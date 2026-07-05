# Docker Commands

## Dev Mode (hot reload)

```bash
# Start full dev stack (postgres + backend + frontend)
docker compose -f docker-compose.dev.yml up -d --build

# Restart Frontend
docker compose -f docker-compose.dev.yml restart frontend


# Start only postgres (if running backend locally with npm run dev)
docker compose -f docker-compose.dev.yml up -d postgres

# View logs
docker compose -f docker-compose.dev.yml logs -f

# Stop and remove containers + volumes
docker compose -f docker-compose.dev.yml down -v
```

Dev services:
| Service  | URL                   | Container               |
|----------|-----------------------|-------------------------|
| Postgres | localhost:5432        | ecommerce-db-dev        |
| Backend  | http://localhost:5000 | ecommerce-backend-dev   |
| Frontend | http://localhost:3000 | ecommerce-frontend-dev  |

Source code is volume-mounted so changes reload automatically.

---

## Prod Mode

```bash
# Build and start all services
docker compose up -d --build

# Start in order (if needed)
docker compose up -d postgres
docker compose up -d --build backend
docker compose up -d --build frontend

# View logs
docker compose logs -f

# Stop
docker compose down

# Stop and remove volumes (destructive — deletes DB data)
docker compose down -v
```

Prod services:
| Service  | URL                   | Container            |
|----------|-----------------------|----------------------|
| Postgres | localhost:5432        | ecommerce-db         |
| Backend  | http://localhost:5000 | ecommerce-backend    |
| Frontend | http://localhost:3000 | ecommerce-frontend   |

---

## Database Migrations

```bash
# Run migrations (inside backend container or locally)
npm run migration:run

# Revert last migration
npm run migration:revert

# Generate a new migration from entity changes
npm run migration:generate
```

---

## Useful Commands

```bash
# List running containers
docker ps

# Remove a stuck container
docker rm -f <container-name>

# Remove all stopped containers
docker container prune

# Shell into a container
docker exec -it ecommerce-backend-dev sh
docker exec -it ecommerce-db-dev psql -U node_user -d ecommerce
```
docker network create web-proxy