#!/bin/bash

# Aequitas Deployment Script for QNAP (and other Linux systems)

echo "==============================================="
echo " Starting Deployment of Aequitas Platform"
echo "==============================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "[ERROR] Docker is not installed or not in PATH."
    echo "Please ensure you have installed Container Station on your QNAP."
    exit 1
fi

# Determine whether to use 'docker-compose' or 'docker compose'
COMPOSE_CMD=""
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
elif command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
else
    echo "[ERROR] Docker Compose is not installed."
    exit 1
fi

echo "[INFO] Using compose command: '$COMPOSE_CMD'"

# Stop and remove existing containers, preserving volumes
echo "[INFO] Stopping existing containers..."
$COMPOSE_CMD down

# Rebuild images and start the containers in detached mode
echo "[INFO] Building images and starting containers..."
$COMPOSE_CMD up -d --build

# Check if the command was successful
if [ $? -eq 0 ]; then
    echo "==============================================="
    echo " Deployment successful!"
    echo " The Aequitas Platform is now running in the background."
    echo " - Frontend: http://<YOUR_QNAP_IP>:80"
    echo " - Backend API: http://<YOUR_QNAP_IP>:8000/api/health"
    echo "==============================================="
else
    echo "[ERROR] Deployment failed. Check the logs above."
    exit 1
fi
