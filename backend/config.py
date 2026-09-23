import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Configuration de production"""
    SECRET_KEY = os.environ.get('SECRET_KEY')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    UPLOAD_FOLDER = os.path.join(
        os.path.dirname(os.path.abspath(__file__)),
        'static/uploads'
    )
    MAX_CONTENT_LENGTH = 5 * 1024 * 1024
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

    SESSION_COOKIE_SECURE = False
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    REMEMBER_COOKIE_SECURE = False
    PERMANENT_SESSION_LIFETIME = 3600


class TestConfig(Config):
    """Configuration pour les tests pytest — base de test uniquement"""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = os.environ.get('TEST_DATABASE_URL')
    SECRET_KEY = 'test-secret-key-for-pytest-only'
    JWT_SECRET_KEY = 'test-jwt-secret-key-for-pytest-only-32chars'
    WTF_CSRF_ENABLED = False
    RATELIMIT_ENABLED = False