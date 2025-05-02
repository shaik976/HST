import os
from dotenv import load_dotenv
import logging

# Load environment variables from .env file
load_dotenv()

class Config:
    # Flask settings
    FLASK_DEBUG = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    FLASK_HOST = os.getenv('FLASK_HOST', '0.0.0.0')
    FLASK_PORT = int(os.getenv('FLASK_PORT', 5000))
    
    # Database settings
    DATABASE_FILE = os.getenv('DATABASE_FILE', 'sessions.json')
    
    # Email settings
    SMTP_SERVER = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
    SMTP_PORT = int(os.getenv('SMTP_PORT', 587))
    SENDER_EMAIL = os.getenv('SENDER_EMAIL')
    SENDER_PASSWORD = os.getenv('SENDER_PASSWORD')
    
    # Model settings
    MODEL_FILE = os.getenv('MODEL_FILE', 'priority_model.pkl')
    
    # Logging settings
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    LOG_FILE = os.getenv('LOG_FILE', 'app.log')
    
    # Security settings
    RATE_LIMIT = int(os.getenv('RATE_LIMIT', 100))
    RATE_LIMIT_WINDOW = int(os.getenv('RATE_LIMIT_WINDOW', 60))
    
    @classmethod
    def validate(cls):
        """Validate configuration settings"""
        errors = []
        
        # Validate email settings
        if not cls.SENDER_EMAIL or not cls.SENDER_PASSWORD:
            errors.append("Email credentials not configured")
        
        # Validate database file
        if not os.path.exists(cls.DATABASE_FILE):
            try:
                with open(cls.DATABASE_FILE, 'w') as f:
                    f.write('[]')
            except Exception as e:
                errors.append(f"Failed to create database file: {str(e)}")
        
        # Validate model file
        if not os.path.exists(cls.MODEL_FILE):
            try:
                from priority_model import PriorityModel
                model = PriorityModel()
            except Exception as e:
                errors.append(f"Failed to initialize model: {str(e)}")
        
        # Configure logging
        logging.basicConfig(
            level=getattr(logging, cls.LOG_LEVEL),
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(cls.LOG_FILE),
                logging.StreamHandler()
            ]
        )
        
        if errors:
            raise ValueError("\n".join(errors))
    
    @classmethod
    def get_logger(cls, name):
        """Get a logger instance with the configured settings"""
        return logging.getLogger(name) 