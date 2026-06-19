.PHONY: up down logs reset-db

up:
	docker compose up postgres pgbouncer redis -d

down:
	docker compose down -v

logs:
	docker compose logs -f

reset-db:
	docker compose exec -T postgres psql -U tubarao -d postgres -c "DROP DATABASE IF EXISTS tubarao WITH (FORCE);"
	docker compose exec -T postgres psql -U tubarao -d postgres -c "CREATE DATABASE tubarao;"
