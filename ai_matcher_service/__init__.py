"""Wrapper package to import modules from the hyphenated directory."""
from importlib import import_module
import sys
from pathlib import Path

# Compute path to the actual package directory
PACKAGE_DIR = Path(__file__).resolve().parent.parent / "ai-matcher-service"
if str(PACKAGE_DIR) not in sys.path:
    sys.path.insert(0, str(PACKAGE_DIR))

# Expose embeddings module for convenience
embeddings = import_module("src.embeddings", package="ai-matcher-service")
ProfileEmbeddingModel = embeddings.ProfileEmbeddingModel
__all__ = ["ProfileEmbeddingModel"]
