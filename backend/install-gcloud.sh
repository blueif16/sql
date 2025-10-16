#!/bin/bash

# Update packages
sudo apt-get update

# Install prerequisites
sudo apt-get install -y apt-transport-https ca-certificates gnupg curl

# Import Google Cloud public key
curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo gpg --dearmor -o /usr/share/keyrings/cloud.google.gpg

# Add gcloud CLI distribution URI
echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | sudo tee -a /etc/apt/sources.list.d/google-cloud-sdk.list

# Update and install gcloud CLI
sudo apt-get update && sudo apt-get install -y google-cloud-cli

# Optional: Install App Engine Python component (if needed for your assignment)
sudo apt-get install -y google-cloud-cli-app-engine-python

echo "✅ Installation complete! Run 'gcloud init' to get started."