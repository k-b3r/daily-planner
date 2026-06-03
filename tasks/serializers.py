from datetime import date, timedelta
from rest_framework import serializers
from .models import Task, RecurringTask


class RecurringTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecurringTask
        fields = ['id', 'title', 'days', 'start_date', 'end_date', 'notes', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class TaskSerializer(serializers.ModelSerializer):
    is_recurring = serializers.SerializerMethodField()
    habit_notes = serializers.SerializerMethodField()
    streak = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = ['id', 'recurring_task', 'title', 'date', 'is_recurring', 'is_done', 'notes', 'habit_notes', 'created_at', 'updated_at', 'streak']
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_recurring', 'habit_notes', 'streak']

    def get_is_recurring(self, obj):
        return obj.recurring_task_id is not None

    def get_habit_notes(self, obj):
        if obj.recurring_task_id and obj.recurring_task.notes:
            return obj.recurring_task.notes
        return ''

    def get_streak(self, obj):
        if obj.recurring_task_id is None:
            return 0
        done_dates = set(
            Task.objects.filter(recurring_task_id=obj.recurring_task_id, is_done=True)
            .values_list('date', flat=True)
        )
        count = 0
        check = date.today() - timedelta(days=1)
        while check in done_dates:
            count += 1
            check -= timedelta(days=1)
        return count
