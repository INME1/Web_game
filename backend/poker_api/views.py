from rest_framework.decorators import api_view
from rest_framework.response import Response
from .poker_logic import Card, Player, Hand, evaluate_hand, compare, Deck
from .q_learning_cpu import QLearningCPU, Q_table, save_q_table, load_q_table
from .models import GameLog
import json

# 족보 번호 → 이름
HAND_RANKINGS = {
    9: "스트레이트 플러시",
    8: "포카드",
    7: "풀하우스",
    6: "플러시",
    5: "스트레이트",
    4: "트리플",
    3: "투페어",
    2: "원페어",
    1: "하이카드",
}

# Q러닝 CPU 인스턴스
qcpu = QLearningCPU()

# --- 게임 시작 ---
@api_view(['POST'])
def start_new_hand(request):
    try:
        player_name = request.data.get('player_name', 'Player')
        player_stack = request.data.get('player_stack', 2000)
        cpu_stack = request.data.get('cpu_stack', 2000)

        player = Player(player_name, stack=player_stack)
        cpu = Player("CPU", is_cpu=True, stack=cpu_stack)

        hand = Hand(player, cpu, button=0)
        hand.start_hand()

        game_data = make_game_data(hand, player, cpu, False, None, None)
        return Response(game_data, status=200)

    except Exception as e:
        return Response({'error': str(e)}, status=500)

# --- 플레이어 액션 ---
@api_view(['POST'])
def player_action(request):
    try:
        action = request.data.get('action')
        amount = request.data.get('amount', 0)
        game_data = request.data.get('game_data')
        cpu_model = request.data.get('cpu_model', 'basic')  # ⭐️ 기본은 basic

        # 복원
        player = Player(game_data['player']['name'], stack=game_data['player']['stack'])
        player.current_bet = game_data['player']['current_bet']
        player.hands = [Card(c['suit'], c['rank']) for c in game_data['player']['hand']]

        cpu = Player(game_data['cpu']['name'], is_cpu=True, stack=game_data['cpu']['stack'])
        cpu.current_bet = game_data['cpu']['current_bet']
        cpu.hands = [Card(c['suit'], c['rank']) for c in game_data['cpu']['hand']]

        hand = Hand(player, cpu, button=game_data['button'])
        hand.table = [Card(c['suit'], c['rank']) for c in game_data['table']['cards']]
        hand.pot = game_data['table']['pot']
        hand.current_round = game_data['table']['round']
        hand.current_player = game_data['current_player']
        hand.sb = game_data['sb']
        hand.bb = game_data['bb']

        # 플레이어 액션 적용
        actor = hand.players[hand.current_player]
        opponent = hand.players[1 - hand.current_player]
        to_call = max(opponent.current_bet - actor.current_bet, 0)

        if action == 'fold':
            actor.is_folded = True
        elif action in ['call', 'check']:
            real_call = min(to_call, actor.stack)
            actor.stack -= real_call
            actor.current_bet += real_call
            hand.pot += real_call
        elif action == 'raise':
            total_raise = to_call + amount
            real_raise = min(total_raise, actor.stack)
            actor.stack -= real_raise
            actor.current_bet += real_raise
            hand.pot += real_raise

        hand.current_player = 1 - hand.current_player

        game_over, winner, winner_reason = hand.check_round_end()

        # CPU 턴
        if not game_over and hand.current_player == 1:
            cpu_actor = cpu
            opponent = player
            to_call = max(opponent.current_bet - cpu_actor.current_bet, 0)

            if cpu_model == 'basic':
                cpu_action_result, cpu_amount = hand.cpu_action_basic(cpu_actor, opponent)
            elif cpu_model == 'q_learning':
                cpu_action_result, cpu_amount = hand.cpu_action_q_learning(cpu_actor, opponent)

            if cpu_action_result == 'fold':
                cpu_actor.is_folded = True
                winner = opponent.name
                winner_reason = "CPU 폴드"
                game_over = True
            else:
                hand.apply_action(cpu_actor, opponent, cpu_action_result, cpu_amount)

            hand.current_player = 0
            game_over, winner, winner_reason = hand.check_round_end()

            if game_over and cpu_model == 'q_learning':
                if winner == cpu.name:
                    reward = 1
                elif winner == player.name:
                    reward = -1
                else:
                    reward = 0
                qcpu.learn_after_game(reward)

        # 족보
        player_hand_rank = None
        cpu_hand_rank = None
        if game_over:
            player_rank_value, _ = evaluate_hand(player.hands + hand.table)
            cpu_rank_value, _ = evaluate_hand(cpu.hands + hand.table)
            player_hand_rank = HAND_RANKINGS.get(player_rank_value)
            cpu_hand_rank = HAND_RANKINGS.get(cpu_rank_value)

        updated_game_data = make_game_data(hand, player, cpu, game_over, winner, winner_reason)
        updated_game_data['player']['hand_rank'] = player_hand_rank
        updated_game_data['cpu']['hand_rank'] = cpu_hand_rank

        return Response(updated_game_data, status=200)

    except Exception as e:
        print(f"player_action error: {e}")
        return Response({'error': str(e)}, status=500)

# --- Hand를 복원하는 함수 ---
def restore_hand_from_data(game_data):
    player_data = game_data['player']
    cpu_data = game_data['cpu']

    player = Player(player_data['name'], stack=player_data['stack'])
    player.current_bet = player_data['current_bet']
    player.hands = [Card(c['suit'], c['rank']) for c in player_data['hand']]

    cpu = Player(cpu_data['name'], is_cpu=True, stack=cpu_data['stack'])
    cpu.current_bet = cpu_data['current_bet']
    cpu.hands = [Card(c['suit'], c['rank']) for c in cpu_data['hand']]

    hand = Hand(player, cpu, button=game_data['button'])
    hand.table = [Card(c['suit'], c['rank']) for c in game_data['table']['cards']]
    hand.pot = game_data['table']['pot']
    hand.sb = game_data['sb']
    hand.bb = game_data['bb']
    hand.current_round = game_data['table']['round']
    hand.current_player = game_data['current_player']

    return player, cpu, hand

# --- 게임 데이터 포맷 ---
def make_game_data(hand, player, cpu, game_over, winner, winner_reason):
    return {
        'player': {
            'name': player.name,
            'hand': [{'suit': c.suit, 'rank': c.rank} for c in player.hands],
            'stack': player.stack,
            'current_bet': player.current_bet,
        },
        'cpu': {
            'name': cpu.name,
            'hand': [{'suit': c.suit, 'rank': c.rank} for c in cpu.hands],
            'stack': cpu.stack,
            'current_bet': cpu.current_bet,
        },
        'table': {
            'cards': [{'suit': c.suit, 'rank': c.rank} for c in hand.table],
            'pot': hand.pot,
            'round': hand.current_round,
        },
        'button': hand.button,
        'current_player': hand.current_player,
        'sb': hand.sb,
        'bb': hand.bb,
        'game_over': game_over,
        'winner': winner,
        'winner_reason': winner_reason,
    }

# --- 족보 평가 API ---
@api_view(['POST'])
def get_hand_evaluation(request):
    try:
        cards_data = request.data.get('cards', [])
        cards = [Card(c['suit'], c['rank']) for c in cards_data]
        hand_eval = evaluate_hand(cards)
        return Response({'hand_evaluation': hand_eval}, status=200)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

# --- 핸드 비교 API ---
@api_view(['POST'])
def compare_hands(request):
    try:
        player_cards = [Card(c['suit'], c['rank']) for c in request.data.get('player_cards', [])]
        cpu_cards = [Card(c['suit'], c['rank']) for c in request.data.get('cpu_cards', [])]
        result = compare(player_cards, cpu_cards)
        return Response({'comparison_result': result}, status=200)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

# --- 게임 로그 저장 ---
@api_view(['POST'])
def save_game_log(request):
    try:
        log_data = request.data
        game_log = GameLog(log_data=json.dumps(log_data))
        game_log.save()
        return Response({'message': 'Game log saved'}, status=201)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

# --- Q-Table 보기 ---
@api_view(['GET'])
def show_q_table(request):
    try:
        return Response(Q_table, status=200)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

# --- Q-Table 시각화 ---
@api_view(['GET'])
def visualize_q_table(request):
    try:
        load_q_table()
        return Response(Q_table, status=200)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

from django.http import FileResponse
import matplotlib.pyplot as plt
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def show_reward_curve(request):
    try:
        rewards = [...]  # ⭐ 누적 reward 기록이 있어야 해
        plt.figure()
        plt.plot(rewards)
        plt.title('Reward Curve')
        plt.xlabel('Episodes')
        plt.ylabel('Total Reward')
        plt.grid()
        plt.savefig('reward_curve.png')
        plt.close()
        return Response({'image_url': '/static/reward_curve.png'}, status=200)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

    
    
@api_view(['GET'])
def show_q_table_stats(request):
    try:
        from .poker_logic import Q_table
        total_states = len(set(k[0] for k in Q_table.keys()))
        total_actions = len(Q_table)
        avg_q_value = sum(Q_table.values()) / len(Q_table) if len(Q_table) > 0 else 0

        stats = {
            '총 학습된 상태 수': total_states,
            '총 저장된 (상태,행동) 쌍 수': total_actions,
            '평균 Q 값': round(avg_q_value, 4)
        }
        return Response(stats, status=200)
    except Exception as e:
        return Response({'error': str(e)}, status=500)
