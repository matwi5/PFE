# backend/logging_config.py
import logging
from logging.handlers import RotatingFileHandler
import os 


# Configuration du logger
logger = logging.getLogger("fastapi")
logger.setLevel(logging.INFO)

log_dir = "logs"
if not os.path.exists(log_dir):
    os.makedirs(log_dir)

logging_config = {
    'version': 1,
    'formatters': {
        'default': {
            'format': '[%(asctime)s] %(levelname)s in %(module)s: %(message)s',
        },
    },
    'handlers': {
        'file': {
            'class': 'logging.FileHandler',
            'filename': os.path.join(log_dir, 'backend.log'),
            'formatter': 'default',
        },
    },
    'root': {
        'level': 'INFO',
        'handlers': ['file'],
    },
}
# Gestionnaire pour enregistrer les logs dans un fichier, avec rotation
handler = RotatingFileHandler("logs/backend.log", maxBytes=2000000, backupCount=10)
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)

# Ajout du gestionnaire au logger
logger.addHandler(handler)

og_dir = "logs"

