from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Game
from .services import start_game, open_cell, flag_cell
from .serializers import GameSerializer

class StartGameView(APIView):
    def post(self, request):
        difficulty = request.data.get('difficulty')
        if difficulty not in ['EASY', 'MEDIUM', 'HARD']:
            return Response({"error": "Invalid difficulty"}, status=status.HTTP_400_BAD_REQUEST)

        game = start_game(difficulty)
        return Response(GameSerializer(game).data, status=status.HTTP_201_CREATED)

class OpenCellView(APIView):
    def post(self, request, game_id):
        x = request.data.get('x')
        y = request.data.get('y')

        game = Game.objects.get(id=game_id)
        updated_game = open_cell(game, x, y)

        if updated_game is None:
            return Response({"error": "Invalid move"}, status=status.HTTP_400_BAD_REQUEST)

        return Response(GameSerializer(updated_game).data)
    
class FlagCellView(APIView):
    def post(self, request, game_id):
        x = request.data.get('x')
        y = request.data.get('y')

        game = Game.objects.get(id=game_id)
        updated_game = flag_cell(game, x, y)
        
        if updated_game is None:
            return Response({"error": "Invalid move or game is not active"}, status=status.HTTP_400_BAD_REQUEST)

        return Response(GameSerializer(updated_game).data)

