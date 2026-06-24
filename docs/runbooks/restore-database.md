# Database Restore Procedure

This runbook outlines the steps to restore the PostgreSQL database from the automated daily backups. The backups are encrypted using AES-256 and stored in the `/backups` volume.

## Prerequisites

1. Access to the host server running the Docker containers.
2. The `BACKUP_ENCRYPTION_KEY` used to encrypt the backups (found in the `.env` file).

## Step-by-Step Restore Guide

### 1. Locate the backup file

First, find the latest backup file inside the `pg_backup` container's volume.

```bash
docker compose exec pg_backup ls -la /backups
```
Identify the correct `.sql.gz` file you wish to restore (e.g., `tubarao-20260624-020000.sql.gz`). Note that despite the extension, the file is encrypted.

### 2. Copy the backup to the host

Copy the encrypted backup file from the container to your host machine.

```bash
docker compose cp pg_backup:/backups/tubarao-20260624-020000.sql.gz ./backup-encrypted.sql.gz
```

### 3. Decrypt and decompress the backup

The `.sql.gz` file is encrypted with AES-256. Decrypt it using `openssl` and the `BACKUP_ENCRYPTION_KEY`, then extract it.

```bash
# Decrypt the file
openssl enc -d -aes-256-cbc -salt -in ./backup-encrypted.sql.gz -out ./backup-decrypted.sql.gz -pass pass:"YOUR_BACKUP_ENCRYPTION_KEY" -pbkdf2

# Decompress the file
gunzip ./backup-decrypted.sql.gz
# This will result in a file named: backup-decrypted.sql
```

### 4. Stop connections to the database

Before restoring, ensure no applications are writing to the database by stopping the API and Web containers.

```bash
docker compose stop api web pgbouncer
```

### 5. Drop and recreate the database (Clean Slate)

It's safer to drop and recreate the database to avoid conflicts with existing data.

```bash
# Enter the postgres container
docker compose exec -it postgres psql -U tubarao -d postgres

# Inside the psql shell, run:
DROP DATABASE tubarao;
CREATE DATABASE tubarao;
\q
```

### 6. Restore the database

Copy the decrypted SQL file into the `postgres` container and restore it.

```bash
# Copy the decrypted SQL file
docker compose cp ./backup-decrypted.sql postgres:/tmp/restore.sql

# Execute the restore
docker compose exec postgres psql -U tubarao -d tubarao -f /tmp/restore.sql
```

### 7. Restart services and clean up

Once the restore is complete and verified, restart the stopped services and delete the decrypted backup files.

```bash
docker compose start pgbouncer api web

# Clean up
rm ./backup-encrypted.sql.gz ./backup-decrypted.sql
docker compose exec postgres rm /tmp/restore.sql
```

## Verify the Restore

Check the API logs and make a test request to ensure the data is intact and the system is functioning normally.

```bash
docker compose logs -f api
```
