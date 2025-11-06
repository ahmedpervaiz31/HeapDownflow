# Database Reset Instructions

If you're getting migration errors, you may need to reset the database:

## Option 1: Reset Docker Volume (Recommended for Development)

```bash
# Stop all containers
docker-compose down

# Remove the database volume
docker volume rm stack-overflow_postgres_data

# Or remove all volumes
docker-compose down -v

# Start fresh
docker-compose up -d db

# Wait a few seconds for DB to be ready, then:
docker-compose run --rm backend python manage.py makemigrations
docker-compose run --rm backend python manage.py migrate
```

## Option 2: Just Create Migrations (If DB is clean)

```bash
# Make sure DB is running
docker-compose up -d db

# Create migrations
docker-compose run --rm backend python manage.py makemigrations

# Run migrations
docker-compose run --rm backend python manage.py migrate
```

