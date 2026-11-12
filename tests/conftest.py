import os
import sys
from pathlib import Path

# Ensure backend directory is in sys.path
backend_dir = Path(__file__).resolve().parent.parent / "backend"
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

# Ensure settings finds the model artifacts from root
os.environ["MODEL_ARTIFACTS_DIR"] = str(backend_dir / "model_artifacts")

