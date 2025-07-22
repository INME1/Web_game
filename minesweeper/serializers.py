from rest_framework import serializers
from .models import Game, Cell

class CellSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cell
        fields = ['x', 'y', 'is_open', 'is_flagged', 'adjacent_mines']

class GameSerializer(serializers.ModelSerializer):
    cells = CellSerializer(many=True, read_only=True)

    class Meta:
        model = Game
        fields = ['id', 'difficulty', 'grid_size', 'mine_count', 'is_won', 'is_lost', 'is_active', 'cells']
