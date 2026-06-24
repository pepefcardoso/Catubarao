# Go-Live Checklist

This checklist must be completely checked off before any real member data is collected in the production environment.

## 1. Infrastructure & Networking

- [ ] **DNS Records Configured**
  - [ ] `A` record for `tubarao.fc` pointing to the VPS IP.
  - [ ] `A` record for `api.tubarao.fc` pointing to the VPS IP.
- [ ] **VPS Hardening Complete**
  - [ ] SSH key-only access enabled on a custom port.
  - [ ] Root login disabled.
  - [ ] UFW configured (allowing only custom SSH port, 80, and 443).
  - [ ] Fail2ban installed and active.
  - [ ] Docker daemon is not exposed to the public network.

## 2. Environment Configuration

- [ ] **All Production Env Vars Set and Verified**
  - Check `.env.local` or Docker Swarm/Compose environment files. Ensure no staging or development keys are used.
- [ ] **Sentry DSN Configured**
  - [ ] Ensure the Sentry DSN points to the production environment project.
  - [ ] Verify `NODE_ENV=production` so Sentry environment tags correctly.

## 3. External Services integration

- [ ] **Mercado Pago**
  - [ ] Production credentials (`PROD_ACCESS_TOKEN`) configured.
  - [ ] Webhook URL registered in the Mercado Pago dashboard (`https://api.tubarao.fc/webhooks/mercadopago`).
  - [ ] Webhook signature secret correctly set in the environment.
- [ ] **Cloudflare R2**
  - [ ] Bucket created for production.
  - [ ] CORS policy configured to allow requests from `https://tubarao.fc` and `https://api.tubarao.fc`.

## 4. Database & Backups

- [ ] **First Admin Account Created**
  - Manually create the first admin account via Prisma Studio or an initial seed script. Do not leave the system without at least one `ADMIN` role user.
- [ ] **Backup Service Running**
  - [ ] `pg_backup` container is running.
  - [ ] First automated backup has been generated and verified.

## 5. Testing & Validation

- [ ] **Load Test Passed**
  - [ ] Load test has been successfully run against the staging environment without significant degradation.
- [ ] **Health Checks**
  - [ ] Monitor uptime and alert notifications are set up for `/health` endpoints.

## 6. Deployment Procedure

Once all the checklist items above are verified, you can deploy the code to production.

This project uses an automated CI/CD pipeline via GitHub Actions.

**To trigger a production deployment:**
1. Ensure you are on the `main` branch and all changes are committed and pushed.
2. Create and push a new semantic version tag starting with `v` (e.g., `v1.0.0`):
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
3. This will trigger the `Deploy to Production` GitHub Action, which builds the Docker images and updates the VPS via SSH.
4. Monitor the deployment in the "Actions" tab of the GitHub repository.
5. After it completes, verify the deployment by visiting the live URL and the `/health` endpoint.
