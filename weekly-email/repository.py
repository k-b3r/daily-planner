# Run SQL queries
import sqlite3

conn = sqlite3.connect("./db.sqlite3")
cur = conn.cursor()


def get_all_tasks():
    cur.execute("SELECT * FROM tasks_task")
    return cur.fetchall()


def get_all_tasks_date_range(start, end):
    cur.execute("SELECT * FROM tasks_task WHERE date >= ? AND date <= ?", (start, end))
    return cur.fetchall()
