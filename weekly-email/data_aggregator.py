from datetime import date, timedelta

from repository import get_all_tasks_date_range


def get_tasks_from_date_range(start, end):
    tasks = get_all_tasks_date_range(start, end)
    for task in tasks.copy():
        print(task)


def get_weekly_tasks_for(target_date: date):
    start_day = target_date - timedelta(days=target_date.weekday())
    end_day = start_day + timedelta(days=6)
    print(start_day)
    print(end_day)
