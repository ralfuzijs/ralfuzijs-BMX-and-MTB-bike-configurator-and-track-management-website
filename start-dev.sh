#!/bin/bash

echo "Starting BMX/MTB Website (Frontend and Backend)..."
echo ""

# Start backend in background
echo "Starting backend server..."
cd map-tracks-api
npx nodemon server.js > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 2

# Start frontend in background
echo "Starting frontend server..."
cd vue-project
npx vite > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

echo ""
echo "Both servers have been started!"
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "To view logs:"
echo "  Backend:  tail -f backend.log"
echo "  Frontend: tail -f frontend.log"
echo ""
echo "To stop servers:"
echo "  kill $BACKEND_PID $FRONTEND_PID"
echo "  or press Ctrl+C if running in foreground"
