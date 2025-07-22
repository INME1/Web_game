from django.db import models

# 게임 상태를 나타내는 모델
class Game(models.Model):
    DIFFICULTY_CHOICES = [
        ('EASY', 'Easy'),
        ('MEDIUM', 'Medium'),
        ('HARD', 'Hard'),
    ]

    difficulty = models.CharField(max_length=6, choices=DIFFICULTY_CHOICES, default = 'EASY')
    grid_size = models.IntegerField()  # 게임판 크기 (9x9, 16x16, 16x30)
    mine_count = models.IntegerField()  # 지뢰의 개수
    time_taken = models.IntegerField(default=0)  # 게임 시간 (초 단위)
    is_won = models.BooleanField(default=False)  # 게임 승리 여부
    is_lost = models.BooleanField(default=False)  # 게임 패배 여부
    is_active = models.BooleanField(default=True)  # 게임 진행 중 여부

    def __str__(self):
        return f"Game {self.id} - {self.difficulty}"

# 셀 상태를 나타내는 모델
class Cell(models.Model):
    game = models.ForeignKey(Game, related_name="cells", on_delete=models.CASCADE)
    x = models.IntegerField()  # x 좌표
    y = models.IntegerField()  # y 좌표
    is_mine = models.BooleanField(default=False)  # 지뢰 여부
    is_open = models.BooleanField(default=False)  # 열림 여부
    is_flagged = models.BooleanField(default=False)  # 깃발 여부
    adjacent_mines = models.IntegerField(default=0)  # 인접한 지뢰 수

    def __str__(self):
        return f"Cell ({self.x}, {self.y}) - {'Mine' if self.is_mine else 'Safe'}"
