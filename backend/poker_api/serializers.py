from rest_framework  import serializers
from poker_api.models import GameRecord

class GameRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = GameRecord
        fields = '__all__'