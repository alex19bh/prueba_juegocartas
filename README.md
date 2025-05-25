# El Virus Game - On-Premise Deployment Guide

## Quick Start

1. Extract the deployment package

```bash
tar -xzf el-virus-game-deploy-fixed.tar.gz
cd el-virus-fixed
```

2. Run the deployment script

```bash
./scripts/deploy.sh
```

3. Start the server

```bash
node server/server.js
```

4. Access the game at http://localhost:8000

## Manual Deployment Steps

If the automatic script fails, follow these manual steps:

1. Install server dependencies

```bash
cd server
npm install
cd ..
```

2. Initialize the database

```bash
node server/scripts/initDatabase.js
```

3. If needed, build the frontend:

```bash
npm install
npm run build
```

4. Start the server

```bash
node server/server.js
```

## Troubleshooting

### Frontend Build Issues

If you encounter issues with the frontend build:

1. Make sure you have vite.config.js in the root directory
2. Make sure index.html exists in the root directory
3. If needed, copy the pre-built frontend from dist/ to your desired location

Alternatively, you can use the pre-built frontend in the dist/ folder without rebuilding.

### Database Issues

If you encounter database issues:

1. Make sure the server/data directory exists and is writable
2. Check the server/.env file for correct database configuration

## Advanced Configuration

Edit the .env file to configure:
- PORT: The server port (default: 8000)
- JWT_SECRET: Secret for JWT token generation
- DATABASE_URL: Path to SQLite database file

## Backup and Restore

Use the provided backup script to create regular backups:

```bash
./scripts/backup.sh
```

This will create a backup of your database and configuration files in the backups/ directory.

## Security Recommendations

1. Change the JWT_SECRET in .env to a strong, random string
2. Set up HTTPS using a reverse proxy like Nginx
3. Regularly update dependencies with npm audit fix
4. Create regular backups using the provided backup script
