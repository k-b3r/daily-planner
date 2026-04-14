from django.db import models


class Task(models.Model):
    title = models.CharField(max_length=200)
    date = models.DateField()
    is_recurring = models.BooleanField(default=False)
    is_done = models.BooleanField(default=False)
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'{self.date} — {self.title}'

    class Meta:
        ordering = ['date', 'is_recurring', 'title']
