#!/bin/bash
# deploy-apps.sh - Deploys a list of applications to the Ubuntu machine
# Usage: ./deploy-apps.sh

IP="192.168.24.4"
USER="haos"

# Define the list of applications to install
APPS=(
    "curl"
    "wget"
    "git"
    "htop"
    "neofetch"
)

# Prompt for sudo password securely so it is not visible or hardcoded
read -s -p "Enter sudo password for $USER@$IP: " SUDO_PASS
echo ""

echo "Deploying applications to $USER@$IP..."

# Convert the array to a space-separated string
APP_LIST="${APPS[@]}"

# Run the installation command over SSH
ssh -o StrictHostKeyChecking=no "$USER@$IP" << EOF
    echo "Updating package lists..."
    echo "$SUDO_PASS" | sudo -S apt-get update
    echo "Installing applications: $APP_LIST"
    echo "$SUDO_PASS" | sudo -S DEBIAN_FRONTEND=noninteractive apt-get install -y $APP_LIST
    echo "Deployment complete!"
EOF

echo "Done!"
