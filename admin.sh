#!/bin/bash
cd "$(dirname "$0")/admin"
if [ ! -d node_modules ]; then
  echo "Installiere Abhängigkeiten..."
  npm install
fi
echo "Admin-CMS startet auf http://localhost:3001"
echo "Live-Vorschau auf http://localhost:3000"
node server.js &
SERVER_PID=$!
sleep 1.5
xdg-open http://localhost:3001 2>/dev/null || open http://localhost:3001 2>/dev/null
wait $SERVER_PID
