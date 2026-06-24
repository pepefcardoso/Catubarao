# Application Rollback Procedure

This runbook describes how to roll back the Next.js `web` app or Fastify `api` in case a deployment causes errors or downtime in production.

## Zero-Downtime Rollback

Since we use Docker Compose, rolling back is simply specifying an older image tag and re-running `docker compose up -d`.

### Step 1: Identify Previous Version
Check the GitHub Container Registry or your Git tags for the last known stable version (e.g., `v1.0.0`).

### Step 2: Stop Traffic to the Failing Service
If the API is throwing 500s and needs immediate halt before the new image starts:
```bash
cd /opt/tubarao
docker compose up -d --scale api=0
```
*(Repeat for `web` if necessary)*

### Step 3: Deploy Previous Image
To roll back the `web` and `api` services to `v1.0.0`, export the `IMAGE_TAG` variable and recreate the containers:
```bash
export IMAGE_TAG=v1.0.0
docker compose pull web api
docker compose up -d --no-deps web api
```

### Verification
Ensure the containers are running and healthy:
```bash
docker compose ps
docker compose logs -f api
```

The system will now be running the previous stable version.
