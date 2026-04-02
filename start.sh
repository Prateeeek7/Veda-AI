#!/bin/bash

# ==============================================================================
# Veda AI (GeetaAI) Unified Boot Script
# Orchestrates the simultaneous startup of the React Next.js Front-end
# and the Cosmic Oracle Flask Back-end with clean process shutdown handlers.
# ==============================================================================

# Ascii Art Header
echo -e "\033[33m"
echo '
 ॐ  V  E  D  A     A  I  ॐ 
============================
The Cosmic Guidance Portal.
'
echo -e "\033[0m"

# Absolute working paths
ROOT_DIR=$(pwd)
FRONTEND_DIR="$ROOT_DIR/frontend"
BACKEND_DIR="$ROOT_DIR/backend"

# Graceful Shutdown Routine (Ctrl + C)
cleanup() {
    echo -e "\n\033[91m🛑 Shutting down Veda AI...\033[0m"
    echo "Killing Back-end PID: $BACKEND_PID"
    kill $BACKEND_PID 2>/dev/null
    echo "Killing Front-end PID: $FRONTEND_PID"
    kill $FRONTEND_PID 2>/dev/null
    exit
}

# Trap terminal interrupt/terminate signals
trap cleanup SIGINT SIGTERM EXIT

# ------------------------------------------------------------------------------
# 1. Boot Python Backend Server
# ------------------------------------------------------------------------------
echo -e "\033[96m⚙️  Igniting Oracle Back-end Engine (Port 5001)...\033[0m"
cd "$BACKEND_DIR" || exit
python3 chatbot.py &
BACKEND_PID=$!

# Brief pause to allow FAISS index loading
sleep 3

# ------------------------------------------------------------------------------
# 2. Boot Next.js Frontend Server
# ------------------------------------------------------------------------------
echo -e "\033[92m🌐 Booting Next.js Front-end Server (Port 3000)...\033[0m"
cd "$FRONTEND_DIR" || exit
npm run dev &
FRONTEND_PID=$!

# ------------------------------------------------------------------------------
# 3. Access Instructions
# ------------------------------------------------------------------------------
echo ""
echo -e "\033[33m✨ Veda AI is fully operational!\033[0m"
echo -e "👉 \033[1mDashboard:\033[0m http://localhost:3000"
echo -e "👉 \033[1mBack-end API:\033[0m  http://localhost:5001"
echo ""
echo -e "\033[90m(Press Ctrl+C to stop both servers at any time)\033[0m"
echo "------------------------------------------------------------------------------"

# Wait indefinitely locking script thread until processes are explicitly killed
wait $FRONTEND_PID $BACKEND_PID
