from sqlalchemy import Column, Integer, String, Boolean, DateTime
from datetime import datetime
from database import Base

# Tekne Tanımı (Zaten vardı)
class Tekne(Base):
    __tablename__ = "tekneler"
    id = Column(Integer, primary_key=True, index=True)
    ad = Column(String, index=True)
    kapasite = Column(Integer)
    aktif = Column(Boolean, default=True)

# YENİ: Satış Kayıt Defteri
class Satis(Base):
    __tablename__ = "satislar"
    
    id = Column(Integer, primary_key=True, index=True)
    yetiskin = Column(Integer)
    cocuk = Column(Integer)
    tutar = Column(Integer)
    tarih = Column(DateTime, default=datetime.now)