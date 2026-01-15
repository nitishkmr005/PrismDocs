#!/bin/bash
# Startup script for Render deployment

# Use PORT from environment or default to 8000
PORT=${PORT:-8000}

echo "Starting uvicorn on port $PORT..."
exec uvicorn doc_generator.infrastructure.api.main:app --host 0.0.0.0 --port "$PORT"
