import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-12345-change-me-in-production'
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'suiviterrain-jwt-secret-key-2026-32chars!'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'postgresql://postgres:mdppost@localhost:5432/suiviterrain'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static/uploads')
    MAX_CONTENT_LENGTH = 5 * 1024 * 1024
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
    
    SESSION_COOKIE_SECURE = False
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    REMEMBER_COOKIE_SECURE = False
    PERMANENT_SESSION_LIFETIME = 3600


class TestConfig(Config):
    """Configuration pour les tests pytest"""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'postgresql://postgres:mdppost@localhost:5432/suiviterrain_test'
    JWT_SECRET_KEY = 'test-jwt-secret-key-for-pytest-only'
    WTF_CSRF_ENABLED = False
    RATELIMIT_ENABLED = False
    RATELIMIT_ENABLED = False