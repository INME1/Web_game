# poker_api/urls.py

from django.urls import path
from . import views

urlpatterns = [
    path('start_new_hand/', views.start_new_hand),  # ✅ 꼭 있어야 해
    path('player_action/', views.player_action),
    path('get_hand_evaluation/', views.get_hand_evaluation),
    path('compare_hands/', views.compare_hands),
    path('save_game_log/', views.save_game_log),
    path('show_q_table/', views.show_q_table),
    path('visualize_q_table/', views.visualize_q_table),
    path('show_reward_curve/', views.show_reward_curve),
]
