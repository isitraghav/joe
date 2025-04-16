#!/bin/bash

# Check if a virtual environment already exists
if [ ! -d "venv" ]; then
  echo "Creating a new virtual environment..."
  python3 -m venv venv
elif [ -d "venv" ]; then
  echo "Virtual environment 'venv' already exists."
fi

# Activate the virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies from requirements.txt
echo "Installing dependencies from requirements.txt..."
pip install -r requirements.txt

# Run the Gradio application
echo "Running the Gradio YOLO application..."
python main.py

# Optionally, you can add a line to deactivate the virtual environment after running:
# deactivate