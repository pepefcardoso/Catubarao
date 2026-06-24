# Monitoring and Alerting Setup Guide

This runbook details how to configure Sentry and Uptime monitoring for the production environment as specified in PROD-009.

## 1. Sentry Configuration

### Performance Monitoring (Transaction Tracing)
The codebase has been updated to use a custom `tracesSampler` in `apps/api/src/instrument.ts`. It specifically targets 100% trace rates for critical endpoints:
- `POST /webhooks/mercadopago`
- `POST /store/orders`

Other endpoints are sampled at 10% to conserve Sentry quota in production.

### Alert Rules (UI Setup)
To configure email notifications for error spikes:
1. Log in to your Sentry dashboard.
2. Go to **Alerts** > **Create Alert**.
3. Select **Metric Alert** (or Issue Alert depending on the exact plan).
4. Define the conditions:
   - **Event Type:** `error`
   - **When:** `count()` is `> 5` in `1 minute`.
5. Set the action to **Send an email** to the technical team.
6. Save the rule as "High Error Rate (> 5/min)".

### Issue Auto-Assignment
To automatically assign unassigned errors to a specific developer:
1. Go to **Settings** > **Projects** > [Your Project] > **Issue Owners**.
2. Create an Ownership Rule (e.g., `url:* *@example.com`).
3. Alternatively, you can use **Auto-assignment** under **Project Settings** to rotate or assign directly to the main developer's Sentry account.

## 2. Uptime Monitoring

We recommend using **UptimeRobot** (free tier) or **BetterUptime** to monitor the API's `/health` endpoint.

### UptimeRobot Setup
1. Create a free account at [UptimeRobot](https://uptimerobot.com/).
2. Click **Add New Monitor**.
3. Monitor Type: **HTTP(s)**
4. Friendly Name: `Catubarao API Health`
5. URL: `https://api.tubarao.fc/health` (replace with actual production URL).
6. Monitoring Interval: **1 minute**.
7. **Alert Contacts To Notify:**
   - Select your Email.
   - To add Telegram, go to "My Settings" > "Alert Contacts", add the Telegram integration, and then select it here.
8. Save changes.

## 3. Verification & Acceptance Criteria

### Verify Sentry Error Capture
To simulate a 500 error in staging:
1. Hit the test endpoint: `GET https://api.tubarao.fc/debug-sentry` (replace with actual production/staging URL).
2. This endpoint intentionally throws an unhandled error (`Manually triggered Sentry test error`).
3. Verify the error appears in the Sentry UI within 30 seconds.

### Verify Uptime Alerts
To simulate API downtime:
1. SSH into the staging/production VPS.
2. Stop the API container: `docker compose stop api`.
3. Wait up to 2 minutes. You should receive an email and/or Telegram alert from UptimeRobot.
4. Restart the API: `docker compose start api`.
