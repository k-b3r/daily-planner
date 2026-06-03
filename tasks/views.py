from datetime import date

from rest_framework import viewsets

from .models import RecurringTask, Task
from .serializers import RecurringTaskSerializer, TaskSerializer


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer

    def get_queryset(self):
        date_param = self.request.query_params.get("date")
        month = self.request.query_params.get("month")
        if date_param:
            return Task.objects.filter(date=date_param)
        if month:
            year, m = month.split("-")
            return Task.objects.filter(date__year=year, date__month=m)
        return Task.objects.all()


class RecurringTaskViewSet(viewsets.ModelViewSet):
    serializer_class = RecurringTaskSerializer
    queryset = RecurringTask.objects.all().order_by("created_at")

    def partial_update(self, request, *args, **kwargs):
        response = super().partial_update(request, *args, **kwargs)
        habit = self.get_object()
        today = date.today()

        stale = Task.objects.filter(recurring_task=habit, date__gte=today)

        def is_stale(task_date):
            if task_date < habit.start_date:
                return True
            if habit.end_date and task_date > habit.end_date:
                return True
            if habit.days:
                weekday = (task_date.weekday()) % 7
                if weekday not in habit.days:
                    return True
            return False

        stale_ids = [t.id for t in stale if is_stale(t.date)]
        Task.objects.filter(id__in=stale_ids).delete()

        return response

    def destroy(self, request, *args, **kwargs):
        habit = self.get_object()
        Task.objects.filter(recurring_task=habit, date__gte=date.today()).delete()
        return super().destroy(request, *args, **kwargs)
