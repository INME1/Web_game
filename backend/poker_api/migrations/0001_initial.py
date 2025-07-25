# Generated by Django 5.2 on 2025-04-10 23:47

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="GameRecord",
            fields=[
                (
                    "game_id",
                    models.CharField(max_length=100, primary_key=True, serialize=False),
                ),
                ("player_id", models.CharField(max_length=100)),
                ("action", models.CharField(max_length=100)),
                ("amount", models.IntegerField()),
                ("timestamp", models.DateTimeField(auto_now_add=True)),
            ],
        ),
    ]
