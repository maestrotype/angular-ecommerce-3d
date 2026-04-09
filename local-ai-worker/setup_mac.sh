#!/bin/bash

echo "🚀 Setting up Local 3D AI Worker (macOS)..."

# 1. Create virtual environment
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# 2. Activate virtual environment
source venv/bin/activate

# 3. Upgrade pip
echo "🆙 Upgrading pip..."
pip install --upgrade pip

# 4. Install PyTorch with MPS (Apple Silicon) support
echo "🍎 Installing PyTorch with MPS support..."
pip install torch torchvision torchaudio

# 5. Install other dependencies
echo "📝 Installing requirements..."
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt
else
    pip install fastapi uvicorn requests pillow python-multipart rembg
fi

# 6. Success message
echo ""
echo "✅ Setup complete!"
echo "------------------------------------------------"
echo "📦 HEAVY WEIGHTS: Will be stored in ~/Documents/InstantMesh-Weights"
echo "To download them, run: python download_weights.py"
echo ""
echo "To start the worker:"
echo "1. source venv/bin/activate"
echo "2. python main.py"
echo ""
echo "Then point your Admin -> Integrations -> Custom URL to http://localhost:8000/generate"
echo "------------------------------------------------"
