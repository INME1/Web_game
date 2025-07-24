import random
import pickle
import os

# --- Q-Table 파일 설정 ---
Q_TABLE_FILE = 'q_table.pkl'
Q_table = {}

# --- Q-Table 저장 함수 ---
def save_q_table():
    with open(Q_TABLE_FILE, 'wb') as f:
        pickle.dump(Q_table, f)

# --- Q-Table 불러오기 함수 ---
def load_q_table():
    global Q_table
    if os.path.exists(Q_TABLE_FILE):
        with open(Q_TABLE_FILE, 'rb') as f:
            Q_table = pickle.load(f)
    else:
        Q_table = {}

# 서버 시작할 때 자동 로드
load_q_table()

# --- Q-Learning CPU 클래스 ---
class QLearningCPU:
    def __init__(self, epsilon=0.2, alpha=0.1, gamma=0.9):
        self.actions = ['fold', 'call', 'raise']
        self.epsilon = epsilon  # 탐험 비율
        self.alpha = alpha      # 학습률
        self.gamma = gamma      # 할인율

        self.last_state = None  # ⭐ 추가: 초기화
        self.last_action = None  # ⭐ 추가: 초기화

    def get_state(self, hand, to_call):
        # 상태: (핸드 카드 랭크 2개 + to_call 금액)
        ranks = sorted([hand[0].rank, hand[1].rank])
        return (ranks[0], ranks[1], to_call)

    def choose_action(self, state):
        if random.random() < self.epsilon:
            return random.choice(self.actions)  # 무작위 탐험
        else:
            q_values = {a: Q_table.get((state, a), 0) for a in self.actions}
            max_q = max(q_values.values())
            best_actions = [a for a, q in q_values.items() if q == max_q]
            return random.choice(best_actions)  # 여러개면 랜덤으로 선택

    def update_q(self, state, action, reward, next_state):
        old_q = Q_table.get((state, action), 0)
        next_max_q = max([Q_table.get((next_state, a), 0) for a in self.actions], default=0)
        new_q = old_q + self.alpha * (reward + self.gamma * next_max_q - old_q)
        Q_table[(state, action)] = new_q
        save_q_table()  # ⭐ 매번 저장

    def decide(self, hand, table, to_call):
        state = self.get_state(hand, to_call)
        action = self.choose_action(state)

        # ⭐ decide 때 상태와 액션 저장
        self.last_state = state
        self.last_action = action

        if action == 'raise':
            return 'raise', 6
        elif action == 'call':
            return 'call', 0
        else:
            return 'fold', 0

    def learn_after_game(self, reward):
        # ⭐ 게임 끝나고 리워드 학습
        if self.last_state is not None and self.last_action is not None:
            next_state = ('terminal', 0, 0)  # 종료상태
            self.update_q(self.last_state, self.last_action, reward, next_state)
qcpu = QLearningCPU()
