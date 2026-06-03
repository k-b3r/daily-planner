from django.db import models


class RecurringTask(models.Model):
    title = models.CharField(max_length=200)
    days = models.JSONField(default=list)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class Task(models.Model):
    recurring_task = models.ForeignKey(RecurringTask, null=True, blank=True, on_delete=models.SET_NULL)
    title = models.CharField(max_length=200)
    date = models.DateField()
    is_done = models.BooleanField(default=False)
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def is_recurring(self):
        return self.recurring_task_id is not None

    def __str__(self):
        return f'{self.date} — {self.title}'

    class Meta:
        ordering = ['date', 'title']
