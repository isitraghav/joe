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

