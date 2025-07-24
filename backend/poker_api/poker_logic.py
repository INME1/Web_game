import random
import os
import pickle
from collections import Counter

# --- 기본 카드 설정 ---
rank_order = {'2': 2, '3': 3, '4': 4, '5': 5, '6': 6,
              '7': 7, '8': 8, '9': 9, '10': 10,
              'J': 11, 'Q': 12, 'K': 13, 'A': 14}
suits = ['H', 'D', 'C', 'S']

# --- 카드 / 덱 ---
class Card:
    def __init__(self, suit, rank):
        self.suit = suit
        self.rank = rank

    def __repr__(self):
        return f"{self.suit}{self.rank}"

class Deck:
    def __init__(self):
        self.cards = [Card(s, r) for s in suits for r in rank_order]
        random.shuffle(self.cards)

    def deal(self, n=1):
        return [self.cards.pop() for _ in range(n)] if n > 1 else self.cards.pop()

# --- 플레이어 ---
class Player:
    def __init__(self, name, is_cpu=False, stack=2000):
        self.name = name
        self.is_cpu = is_cpu
        self.hands = []
        self.stack = stack
        self.current_bet = 0
        self.is_folded = False

# --- 핸드 관리 ---
class Hand:
    def __init__(self, player, cpu, button):
        self.players = [player, cpu]
        self.deck = Deck()
        self.table = []
        self.pot = 0
        self.sb, self.bb = 1, 2
        self.button = button
        self.current_round = 'Preflop'
        self.current_player = 0

    def start_hand(self):
        for p in self.players:
            p.hands.clear()
            p.is_folded = False
            p.current_bet = 0
        for _ in range(2):
            for p in self.players:
                p.hands.append(self.deck.deal())
        self.players[1 - self.button].stack -= self.sb
        self.players[self.button].stack -= self.bb
        self.players[1 - self.button].current_bet = self.sb
        self.players[self.button].current_bet = self.bb
        self.pot = self.sb + self.bb
        self.current_player = 0

    def apply_action(self, actor, opponent, action, amount=0):
        to_call = max(opponent.current_bet - actor.current_bet, 0)
        if action == 'fold':
            actor.is_folded = True
        elif action in ['call', 'check']:
            real_call = min(to_call, actor.stack)
            actor.stack -= real_call
            actor.current_bet += real_call
            self.pot += real_call
        elif action == 'raise':
            total_raise = to_call + amount
            real_raise = min(total_raise, actor.stack)
            actor.stack -= real_raise
            actor.current_bet += real_raise
            self.pot += real_raise

    def deal_flop(self):
        self.deck.deal()
        self.table += self.deck.deal(3)
        self.current_round = 'Flop'

    def deal_turn(self):
        self.deck.deal()
        self.table.append(self.deck.deal())
        self.current_round = 'Turn'

    def deal_river(self):
        self.deck.deal()
        self.table.append(self.deck.deal())
        self.current_round = 'River'

    def check_round_end(self):
        alive = [p for p in self.players if not p.is_folded]
        if len(alive) == 1:
            return True, alive[0].name, "폴드 승"

        bets = [p.current_bet for p in alive]
        if len(set(bets)) == 1:
            for p in self.players:
                p.current_bet = 0
            if self.current_round == 'Preflop':
                self.deal_flop()
            elif self.current_round == 'Flop':
                self.deal_turn()
            elif self.current_round == 'Turn':
                self.deal_river()
            elif self.current_round == 'River':
                result = compare(self.players[0].hands + self.table, self.players[1].hands + self.table)
                winner = "무승부" if result == "무승부" else (self.players[0].name if result == "플레이어 승" else self.players[1].name)
                return True, winner, "쇼다운"
        return False, None, None

    def cpu_action_basic(self, cpu, opponent):
        to_call = max(opponent.current_bet - cpu.current_bet, 0)
        win_rate = self.monte_carlo_simulation(cpu.hands + self.table)
        if win_rate > 0.65:
            return 'raise', 6
        elif win_rate > 0.4 or to_call == 0:
            return 'call', 0
        else:
            return 'fold', 0

    def cpu_action_q_learning(self, cpu, opponent):
        from .q_learning_cpu import qcpu  # Q러닝 CPU 인스턴스 사용
        to_call = max(opponent.current_bet - cpu.current_bet, 0)
        state = self.get_state(cpu.hands, to_call)
        action = qcpu.choose_action(state)
        if action == 'raise':
            return 'raise', 6
        elif action == 'call':
            return 'call', 0
        else:
            return 'fold', 0

    def monte_carlo_simulation(self, cpu_cards, simulations=100):
        wins = 0
        for _ in range(simulations):
            deck = Deck()
            deck.cards = [c for c in deck.cards if c not in cpu_cards + self.table]
            player_cards = deck.deal(2)
            remaining = 5 - len(self.table)
            if remaining > 0:
                dealt = deck.deal(remaining)
                if not isinstance(dealt, list):
                    dealt = [dealt]
                simulated_table = self.table + dealt
            else:
                simulated_table = self.table.copy()

            result = compare(player_cards + simulated_table, cpu_cards + simulated_table)
            if result == "CPU 승":
                wins += 1
        return wins / simulations

    def get_state(self, hand, to_call):
        ranks = sorted([rank_order[c.rank] for c in hand])
        return (tuple(ranks), to_call)

# --- 족보 평가 함수 ---
def evaluate_hand(cards):
    ranks = sorted((rank_order[c.rank] for c in cards), reverse=True)
    suits_counter = Counter(c.suit for c in cards)
    ranks_counter = Counter(ranks)

    flush_suit = next((s for s, cnt in suits_counter.items() if cnt >= 5), None)
    flush_cards = sorted((c for c in cards if c.suit == flush_suit), key=lambda x: rank_order[x.rank], reverse=True) if flush_suit else []
    unique_ranks = sorted(set(ranks), reverse=True)

    straight = any(unique_ranks[i] - unique_ranks[i + 4] == 4 for i in range(len(unique_ranks) - 4))

    if flush_cards and any(rank_order[flush_cards[i].rank] - rank_order[flush_cards[i + 4].rank] == 4 for i in range(len(flush_cards) - 4)):
        return (9, rank_order[flush_cards[0].rank])
    if 4 in ranks_counter.values():
        return (8, max(k for k, v in ranks_counter.items() if v == 4))
    if 3 in ranks_counter.values() and 2 in ranks_counter.values():
        return (7, max(k for k, v in ranks_counter.items() if v == 3))
    if flush_cards:
        return (6, rank_order[flush_cards[0].rank])
    if straight:
        return (5, unique_ranks[0])
    if 3 in ranks_counter.values():
        return (4, max(k for k, v in ranks_counter.items() if v == 3))
    if list(ranks_counter.values()).count(2) >= 2:
        return (3, sorted((k for k, v in ranks_counter.items() if v == 2), reverse=True)[0])
    if 2 in ranks_counter.values():
        return (2, max(k for k, v in ranks_counter.items() if v == 2))
    return (1, ranks[0])

# --- 핸드 비교 ---
def compare(player_cards, cpu_cards):
    player_hand = evaluate_hand(player_cards)
    cpu_hand = evaluate_hand(cpu_cards)
    if player_hand > cpu_hand:
        return "플레이어 승"
    elif player_hand < cpu_hand:
        return "CPU 승"
    return "무승부"

# --- Q-러닝 CPU 클래스 (심플) ---
class QLearningCPU:
    def __init__(self, actions=['fold', 'call', 'raise'], alpha=0.1, gamma=0.9, epsilon=0.2):
        self.q_table = {}
        self.actions = actions
        self.alpha = alpha
        self.gamma = gamma
        self.epsilon = epsilon

    def get_state(self, hand, table, stack, pot, to_call):
        return f"{hand}-{len(table)}-{stack}-{pot}-{to_call}"

    def choose_action(self, state):
        if random.random() < self.epsilon:
            return random.choice(self.actions)
        else:
            q_values = [self.q_table.get((state, a), 0) for a in self.actions]
            max_q = max(q_values)
            return self.actions[q_values.index(max_q)]

    def update_q(self, state, action, reward, next_state):
        old_q = self.q_table.get((state, action), 0)
        next_q = max([self.q_table.get((next_state, a), 0) for a in self.actions], default=0)
        self.q_table[(state, action)] = old_q + self.alpha * (reward + self.gamma * next_q - old_q)

# --- Q 테이블 관리 ---
Q_TABLE_FILE = 'q_table.pkl'
Q_table = {}

def save_q_table():
    with open(Q_TABLE_FILE, 'wb') as f:
        pickle.dump(Q_table, f)

def load_q_table():
    global Q_table
    if os.path.exists(Q_TABLE_FILE):
        with open(Q_TABLE_FILE, 'rb') as f:
            Q_table = pickle.load(f)
    else:
        Q_table = {}

# --- Q-러닝 CPU 인스턴스 (최종)
qcpu = QLearningCPU()
