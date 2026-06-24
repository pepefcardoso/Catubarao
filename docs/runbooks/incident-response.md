# Incident Response Runbook

This guide covers common production incidents and how to mitigate them.

## 1. Webhook Stops Processing

**Symptoms:**
- Payments are approved in Mercado Pago, but member subscriptions remain `PENDING`.
- No new payment events in Sentry or logs.

**Investigation:**
1. **Check Sentry:** Look for errors related to `/webhooks/mercadopago` or the `payments` queue in BullMQ.
2. **Check Logs:**
   ```bash
   docker compose logs --tail=100 api | grep webhook
   ```
3. **Verify Mercado Pago Dashboard:**
   - Log into Mercado Pago and check the Webhooks section.
   - See if they are reporting delivery failures (HTTP 4xx or 5xx from our API).
4. **Queue Check:**
   - Check if BullMQ is stuck. The worker might have crashed.

**Resolution:**
- If the API worker crashed, restart the API container: `docker compose restart api`.
- If the webhook signature is failing, verify the `MERCADOPAGO_WEBHOOK_SECRET` matches between the env vars and the MP dashboard.
- **Replay missing webhooks:** Mercado Pago allows manually resending failed webhooks from their developer dashboard. Resend the missing events once the system is stable.

## 2. Database is Full

**Symptoms:**
- The API begins throwing `500` errors for any write operation.
- Logs show PostgreSQL out of space errors (`No space left on device`).
- Sentry alerts trigger heavily.

**Investigation:**
1. SSH into the VPS.
2. Check disk space usage: `df -h`.
3. Check what is consuming space: `ncdu /` or `du -sh /*`.
   - Often, Docker logs or old containers consume disk space.

**Resolution:**
1. **Clear Docker cruft (Quick Mitigation):**
   ```bash
   docker system prune -af --volumes
   ```
2. **Truncate large logs:**
   If a specific container log is huge:
   ```bash
   truncate -s 0 /var/lib/docker/containers/*/*-json.log
   ```
3. **Expand VPS Storage:**
   If the database data itself has filled the disk, you will need to resize the volume in your cloud provider's dashboard and then resize the filesystem.
4. **Database Cleanup:**
   If the database is full of non-essential data (like expired session tokens), run a cleanup script.

## 3. Member Reports Wrong Status

**Symptoms:**
- A member claims they paid, but their membership card says `INACTIVE` or `PENDING`.

**Investigation:**
1. Request the member's email or CPF.
2. Search for the user in Prisma Studio or via the Admin Dashboard.
3. Check the `Subscription` and `Payment` records associated with the user.
4. Compare the payment status in our database with the status in the Mercado Pago dashboard.

**Resolution:**
- **Status Mismatch:** If MP shows "Paid" but our DB shows "Pending", it means a webhook was missed or failed to process.
- **Manual Override:** As an admin, you can manually sync the status if confirmed paid.
  - Using Prisma Studio, update the `Payment` status to `APPROVED` and the `Subscription` status to `ACTIVE`.
  - Ensure a new Membership Card (QR code) is generated for the user.
- **Root Cause Fix:** Review the webhook logs (see section 1) to understand why the event was missed.
