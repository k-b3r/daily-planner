from datetime import date, timedelta
from rest_framework import serializers
from .models import Task


class TaskSerializer(serializers.ModelSerializer):
    streak = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = ['id', 'title', 'date', 'is_recurring', 'is_done', 'notes', 'created_at', 'updated_at', 'streak']
        read_only_fields = ['id', 'created_at', 'updated_at', 'streak']

    def get_streak(self, obj):
        if not obj.is_recurring:
            return 0
        done_dates = set(
            Task.objects.filter(title=obj.title, is_recurring=True, is_done=True)
            .values_list('date', flat=True)
        )
        count = 0
        check = date.today() - timedelta(days=1)
        while check in done_dates:
            count += 1
            check -= timedelta(days=1)
        return count
