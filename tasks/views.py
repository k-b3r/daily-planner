from rest_framework import viewsets
from .models import Task
from .serializers import TaskSerializer


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer

    def get_queryset(self):
        date = self.request.query_params.get('date')
        month = self.request.query_params.get('month')
        if date:
            return Task.objects.filter(date=date)
        if month:
            year, m = month.split('-')
            return Task.objects.filter(date__year=year, date__month=m)
        return Task.objects.all()
