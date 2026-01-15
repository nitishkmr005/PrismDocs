#!/bin/bash
# Startup script for Render deployment

set -e  # Exit on error

# Use PORT from environment or default to 8000
PORT=${PORT:-8000}

echo "==> Starting uvicorn on port $PORT..."
echo "==> PYTHONPATH: $PYTHONPATH"
echo "==> Working directory: $(pwd)"

# Test if the module can be imported
python -c "from doc_generator.infrastructure.api.main import app; print('==> App imported successfully')" || {
    echo "ERROR: Failed to import app"
    exit 1
}

# Start uvicorn
echo "==> Launching uvicorn..."
exec python -m uvicorn doc_generator.infrastructure.api.main:app \
    --host 0.0.0.0 \
    --port "$PORT" \
    --log-level info
