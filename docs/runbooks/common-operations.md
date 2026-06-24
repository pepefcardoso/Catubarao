# Common Operations

This runbook covers routine operations for managing the Catubarao platform.

## Adding an Admin User

The first admin user is typically created during the go-live process. To add subsequent admins:

**Option 1: Using the Admin Dashboard (Recommended)**
If you already have access to the admin dashboard with an `ADMIN` account:
1. Log in to the admin panel.
2. Navigate to **Users** -> **Invite Admin**.
3. Fill in the email address. The user will receive an invitation to set up their account with the `ADMIN` role.

**Option 2: Manually via Prisma Studio (CLI)**
If you need to escalate an existing user to an admin via the database directly:
1. SSH into the VPS.
2. Open Prisma Studio inside the `api` container:
   ```bash
   docker exec -it catubarao-api-1 pnpm db:studio
   ```
   *Alternatively, connect directly to the database using `psql` or a tool like DBeaver using the production connection string.*
3. Find the user record in the `User` table (handled by Better Auth).
4. Update the `role` field from `USER` to `ADMIN`.
5. Save changes. The user will have admin privileges on their next login.

## Rotating JWT Keys (Membership QR Codes)

Membership QR codes rely on a public/private key pair (ES256) for offline verification. If keys are compromised or require routine rotation:

1. **Generate a new key pair:**
   ```bash
   # On your local machine or a secure environment
   openssl ecparam -name prime256v1 -genkey -noout -out private-key.pem
   openssl ec -in private-key.pem -pubout -out public-key.pem
   ```
2. **Update Environment Variables:**
   - On the VPS, edit the `.env` file for the API and frontend (if the frontend validates them offline).
   - Update `QR_PRIVATE_KEY` and `QR_PUBLIC_KEY` with the new values.
3. **Restart Services:**
   ```bash
   docker compose restart api web
   ```
4. **Important Consequence:** 
   Rotating these keys will instantly invalidate all existing offline QR codes. Members will need to open the app while online to fetch a newly signed QR code.

## Manually Triggering a Debt Snapshot

Debt snapshots are usually generated automatically at the end of the month. To manually trigger one (e.g., for ad-hoc financial reporting):

1. SSH into the VPS.
2. Access the API container:
   ```bash
   docker exec -it catubarao-api-1 sh
   ```
3. Run the specific job script:
   ```bash
   # Assuming a CLI or script is exposed for jobs
   pnpm run jobs:trigger generate-debt-snapshot
   ```
   *If a direct script doesn't exist, you can add a job directly to the BullMQ queue using a temporary Node.js script.*
4. The snapshot will be generated and become visible on the Transparency Portal.

## Pausing the Delinquency Job

If there is a known issue with the payment gateway (e.g., Mercado Pago API is down) and you want to prevent the system from falsely marking members as delinquent:

1. **Access the BullMQ Dashboard (if enabled)**
   - If a BullMQ UI is exposed (e.g., via a protected admin route or a tool like Bull-Board), navigate to it.
   - Find the `delinquency` or `cron` queue and pause the job.

2. **Alternatively, Disable in Code (Temporary Hotfix)**
   - If no UI is available, comment out the cron schedule for the delinquency job in the API's queue configuration (`apps/api/src/plugins/queues.ts`).
   - Re-deploy the API.
   - Remember to revert the change once the external service is stable.
