.PHONY: dev be fe

dev:
	@trap 'kill 0' EXIT; \
	uv run python manage.py runserver & \
	cd frontend && pnpm dev

be:
	uv run python manage.py runserver

fe:
	cd frontend && pnpm dev
