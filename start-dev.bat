@echo off
echo Starting BMX/MTB Website (Frontend and Backend)...

start cmd /k "cd vue-project && npm run dev"
start cmd /k "cd map-tracks-api && npm run dev"

echo Both servers have been started!