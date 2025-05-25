#!/bin/bash
echo "=== Updating Frontend Configuration ==="

# Stop the server
pm2 stop el-virus

# Find and replace port 8000 with 5000 in all frontend files
cd /webs/juego/dist
find . -type f -name "*.js" -exec sed -i 's|localhost:8000|localhost:5000|g' {} \;
echo "Updated frontend configuration to use port 5000"

# Restart the server
cd /webs/juego
pm2 start server/server.js --name=el-virus

echo "=== Configuration Update Complete ==="
echo "Your application should now be working correctly."
echo "Access the application at: http://localhost:5000"
