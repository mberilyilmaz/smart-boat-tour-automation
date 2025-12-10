from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# .env dosyasındaki şifreyi oku
load_dotenv()

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# Motoru (Engine) Başlat
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Oturum (Session) Fabrikası
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Veritabanı Modelleri için Temel Sınıf
Base = declarative_base()

# Veritabanı bağlantısı alıp işi bitince kapatan fonksiyon
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()