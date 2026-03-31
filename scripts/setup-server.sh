#!/bin/bash
# scripts/setup-server.sh
# Run this script on the GCP VM after SSHing in.
# Installs Docker and adds your user to the docker group.

set -e

echo "==> Installing Docker..."
if command -v docker &>/dev/null; then
  echo "    Docker already installed: $(docker --version)"
else
  curl -fsSL https://get.docker.com | sudo sh
  sudo usermod -aG docker "$USER"
  echo "    Docker installed. Log out and back in for group changes to take effect."
fi

echo ""
echo "Done. Next steps:"
echo "  1. Verify firewall rules allow ports 80 and 443 (see DEPLOY.md)."
echo "  2. Log out and SSH back in (so docker group takes effect)."
echo "  3. Clone the repo and continue with DEPLOY.md."
