#!/bin/sh
set -e

# Run only on post-backup hook
if [ "$1" != "post-backup" ]; then
  exit 0
fi

if [ -z "$BACKUP_ENCRYPTION_KEY" ]; then
  echo "No BACKUP_ENCRYPTION_KEY set, skipping encryption."
  exit 0
fi

# Ensure openssl is installed
if ! command -v openssl > /dev/null 2>&1; then
  echo "openssl not found, installing..."
  apk add --no-cache openssl
fi

for file in /backups/*.sql.gz; do
  if [ -f "$file" ]; then
    echo "Encrypting $file with AES-256..."
    openssl enc -aes-256-cbc -salt -in "$file" -out "${file}.enc" -pass pass:"$BACKUP_ENCRYPTION_KEY" -pbkdf2
    mv "${file}.enc" "$file"
    echo "Encryption successful."
  fi
done
