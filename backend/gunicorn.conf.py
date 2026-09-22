"""
Configuration Gunicorn pour SuiviTerrain
Production : Linux (Render, Railway, Heroku)
"""

import multiprocessing
import os


# BIND
port = os.environ.get('PORT', '5000')
bind = f"0.0.0.0:{port}"

# WORKERS
workers = int(os.environ.get('WEB_CONCURRENCY', multiprocessing.cpu_count() * 2 + 1))
worker_class = 'sync'
threads = 2
timeout = 120
keepalive = 5

# LOGS
accesslog = '-'
errorlog = '-'
loglevel = 'info'
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" %(D)sµs'

# SÉCURITÉ
limit_request_line = 8190
limit_request_field_size = 8190
limit_request_fields = 100

# DIVERS
preload_app = True
max_requests = 1000
max_requests_jitter = 100
graceful_timeout = 30