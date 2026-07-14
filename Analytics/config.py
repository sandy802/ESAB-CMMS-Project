import os
from dotenv import load_dotenv

# Load variables from the .env file in Backend/ (same DB credentials Node uses)
load_dotenv(dotenv_path="../Backend/.env")

DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")
DB_USERNAME = os.getenv("DB_USERNAME")
DB_PASSWORD = os.getenv("DB_PASSWORD")
