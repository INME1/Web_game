from django.db import models

# Create your models here.

class GameRecord(models.Model):
    game_id = models.CharField(max_length=100,primary_key=True)
    player_id = models.CharField(max_length=100)
    action = models.CharField(max_length=100)
    amount = models.IntegerField()
    timestamp = models.DateTimeField(auto_now_add=True) 
    
    def __str__(self):
        return f"{self.game_id} - {self.player_name} -{self.action}"

class GameLog(models.Model):
    log_data = models.TextField()  # JSON 문자열로 저장
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Game Log - {self.created_at}"
    
