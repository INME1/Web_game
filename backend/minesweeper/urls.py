from django.urls import path
from .views import StartGameView, OpenCellView, FlagCellView

urlpatterns = [
    path('start_game/', StartGameView.as_view(), name='start_game'),
    path('open_cell/<int:game_id>/', OpenCellView.as_view(), name='open_cell'),
    path('flag_cell/<int:game_id>/', FlagCellView.as_view(), name='flag_cell'),
]

