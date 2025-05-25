#!/bin/bash

echo "=== El Virus Game Deployment Script ==="
echo "This script will install dependencies, build the frontend, and initialize the database."

# Create directory structure if it doesn't exist
mkdir -p server/data

# Install server dependencies
echo -e "\nInstalling server dependencies..."
cd server && npm install
cd ..

# Check if we need to build the frontend
if [ ! -d "dist" ] || [ -z "$(ls -A dist 2>/dev/null)" ]; then
    echo -e "\nFrontend build not found or empty. Installing dependencies and building..."
    npm install
    
    # Check if vite.config.js exists
    if [ ! -f "vite.config.js" ]; then
        echo "Creating vite.config.js file..."
        cat > vite.config.js << 'EOCFG'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
})
EOCFG
    fi
    
    # Check if public/index.html or index.html exists
    if [ ! -f "index.html" ] && [ -f "dist/index.html" ]; then
        echo "Using existing index.html from dist folder..."
        cp dist/index.html .
    elif [ ! -f "index.html" ]; then
        echo "ERROR: index.html not found. Cannot build frontend."
        echo "Skipping frontend build. You'll need to manually copy a pre-built frontend to the dist directory."
    else
        echo "Building frontend..."
        npm run build
    fi
else
    echo -e "\nFrontend build already exists in dist directory. Skipping build process."
fi

# Initialize the database
echo -e "\nInitializing database..."
node server/scripts/initDatabase.js
echo "Initialization script completed"

echo -e "\n=== Installation Complete ==="
echo "To start the server, run: node server/server.js"
echo "Then access the application at: http://localhost:8000"
echo -e "\nFor production deployment, it's recommended to use PM2 or another process manager:"
echo "npm install -g pm2"
echo "pm2 start server/server.js --name=el-virus"
