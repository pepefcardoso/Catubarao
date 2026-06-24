# Runbook: VPS Hardening and Setup

This runbook details the steps to harden the production VPS, specifically configuring the firewall (`ufw`), securing SSH access, installing `fail2ban`, and ensuring the Docker daemon is not exposed to the network.

## 1. SSH Configuration

We must disable root login, enforce key-only authentication, and optionally move SSH to a non-default port to reduce automated brute-force noise.

### Setup Steps
1. Open the SSH daemon configuration file:
   ```bash
   sudo nano /etc/ssh/sshd_config
   ```
2. Apply the following settings:
   ```text
   # Disable root login
   PermitRootLogin no

   # Enforce public key authentication, disable passwords
   PasswordAuthentication no
   PubkeyAuthentication yes

   # (Optional but recommended) Change the default SSH port
   # Port 2222
   ```
3. Restart the SSH service:
   ```bash
   sudo systemctl restart sshd
   ```

> **Warning:** Before restarting SSH or closing your current session, ensure your SSH key is added to `~/.ssh/authorized_keys` for your regular sudo user.

## 2. Firewall Configuration (`ufw`)

We use Uncomplicated Firewall (`ufw`) to restrict incoming traffic to only HTTP, HTTPS, and SSH.

### Setup Steps
1. Set the default policies to deny incoming and allow outgoing traffic:
   ```bash
   sudo ufw default deny incoming
   sudo ufw default allow outgoing
   ```
2. Allow HTTP (80) and HTTPS (443):
   ```bash
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   ```
3. Allow SSH (Port 22 or your custom port):
   ```bash
   sudo ufw allow 22/tcp
   # If using a custom port (e.g., 2222), use: sudo ufw allow 2222/tcp
   ```
4. Enable the firewall:
   ```bash
   sudo ufw enable
   ```
5. Verify the firewall status:
   ```bash
   sudo ufw status verbose
   ```

## 3. Fail2Ban Setup

`fail2ban` protects the SSH service from brute-force attacks by dynamically banning IPs with too many failed login attempts.

### Setup Steps
1. Install `fail2ban`:
   ```bash
   sudo apt update
   sudo apt install fail2ban -y
   ```
2. Create a local configuration to avoid overriding default updates:
   ```bash
   sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
   sudo nano /etc/fail2ban/jail.local
   ```
3. Ensure the SSH jail `[sshd]` is enabled. Update the port if you use a custom SSH port:
   ```ini
   [sshd]
   enabled = true
   port    = ssh    # Change to custom port if applicable, e.g., port = 2222
   logpath = %(sshd_log)s
   backend = %(sshd_backend)s
   maxretry = 3
   bantime = 1h
   ```
4. Start and enable `fail2ban`:
   ```bash
   sudo systemctl enable fail2ban
   sudo systemctl start fail2ban
   ```
5. Verify the SSH jail status:
   ```bash
   sudo fail2ban-client status sshd
   ```

## 4. Docker Daemon Security

The Docker daemon must only be accessible via the local Unix socket to prevent unauthorized network access. By default, Docker on Linux binds to `unix:///var/run/docker.sock`. We must ensure no TCP host is specified.

### Setup Steps
1. Inspect the Docker service configuration to ensure no `-H tcp://...` argument is provided. Check the default systemd drop-ins or daemon.json.
2. Verify `/etc/docker/daemon.json` (create if it doesn't exist) does NOT contain a `"hosts"` array with a TCP address.
3. Restart Docker to apply changes (if any were made):
   ```bash
   sudo systemctl restart docker
   ```
4. Verify the Docker daemon is not listening on any TCP ports:
   ```bash
   sudo ss -tlpn | grep dockerd
   ```
   *(This should return no TCP sockets listening for the Docker daemon.)*

## Acceptance Criteria Verification

- [ ] **Port scan**: Run `nmap -p- <vps-ip>` from an external machine to ensure only 22 (or custom), 80, and 443 are open.
- [ ] **SSH with password**: Run `ssh user@<vps-ip> -o PubkeyAuthentication=no`. It should fail with "Permission denied (publickey)".
- [ ] **fail2ban active**: Run `sudo fail2ban-client status sshd` on the VPS to confirm the jail is active.
