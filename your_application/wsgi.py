"""Render fallback entry point for 'gunicorn your_application.wsgi'."""

import sys
from pathlib import Path

_backend_dir = str(Path(__file__).resolve().parent.parent / "backend")
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

from app.main import app

application = app
