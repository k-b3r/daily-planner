# Build CLI-compatible email system that runs a weekly stat check, make sense of it, then emails me

# Gather data from existing services like database (sqlite)

# Week 3 (MM dd - MM dd)
# Total Tasks
# Completed Tasks
# Most Active day
# A.I summary, highlights, and suggestion (Gemini - free)
#

from datetime import date

from data_aggregator import get_tasks_from_date_range, get_weekly_tasks_for

# start_date = date(2026, 4, 1)
# end_date = date(2026, 4, 30)
tasks = get_weekly_tasks_for(date.today())
# tasks = get_tasks_from_date_range(start_date, end_date)
print(tasks)
