import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-12345'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'postgresql://postgres:password@localhost:5432/suiviterrain'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Configuration de l'upload des photos
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static/uploads')
    MAX_CONTENT_LENGTH = 5 * 1024 * 1024  # 5 Mo
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
    
    # Configuration des sessions
    SESSION_COOKIE_SECURE = True
    REMEMBER_COOKIE_SECURE = True