#!/bin/bash
# Helper script to run document generator with proper environment variables

# Set Cairo library path for macOS
export DYLD_LIBRARY_PATH="/opt/homebrew/opt/cairo/lib:$DYLD_LIBRARY_PATH"

# Activate virtual environment
source .venv/bin/activate

# Run the generator for both PDF and PPTX
if [ "$#" -lt 1 ]; then
  echo "Usage: $0 <input_path_or_folder> [--api-key KEY] [--verbose] [--log-file PATH]"
  echo ""
  echo "Examples:"
  echo "  Single file:  $0 src/data/document.pdf"
  echo "  Folder:       $0 src/data/llm-architectures"
  exit 1
fi

INPUT_PATH="$1"
shift

# Check if input is a directory or a file
if [ -d "$INPUT_PATH" ]; then
  echo "📁 Detected folder input: $INPUT_PATH"
  echo "🔄 Generating both PDF and PPTX from all files in folder..."
  python scripts/generate_from_folder.py "$INPUT_PATH" "$@"
else
  echo "📄 Detected file input: $INPUT_PATH"
  echo "🔄 Generating PDF..."
  python scripts/run_generator.py "$INPUT_PATH" --output pdf "$@"
  echo ""
  echo "🔄 Generating PPTX..."
  python scripts/run_generator.py "$INPUT_PATH" --output pptx "$@"
fi
