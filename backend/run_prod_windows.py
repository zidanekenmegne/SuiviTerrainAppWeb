"""
Serveur de production pour Windows (équivalent Gunicorn)
Utilise Waitress — serveur WSGI pur Python, portable.

Usage :
    python run_prod_windows.py
"""

import os
from waitress import serve
from wsgi import app


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    host = os.environ.get('HOST', '0.0.0.0')
    
    print(f"\n{'='*70}")
    print(f"🚀 Serveur production démarré (Waitress)")
    print(f"{'='*70}")
    print(f"   Adresse locale : http://localhost:{port}")
    print(f"   Adresse réseau : http://{host}:{port}")
    print(f"   Arrêter        : Ctrl+C")
    print(f"{'='*70}\n")
    
    serve(
        app,
        host=host,
        port=port,
        threads=4,        # 4 threads (équivalent 4 workers légers)
        channel_timeout=120,
        cleanup_interval=30,
        ident='SuiviTerrain'
    )