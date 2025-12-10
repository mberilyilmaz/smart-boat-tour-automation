from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
import models
from database import engine, get_db

# Tabloları oluştur (Satis tablosu şimdi oluşacak)
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# İzinler
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Veri Modeli
class SatisVerisi(BaseModel):
    yetiskin_sayisi: int
    cocuk_sayisi: int
    toplam_tutar: int

@app.get("/")
def read_root():
    return {"durum": "Online", "mesaj": "Veritabanı Hazır"}

# --- GERÇEK KAYIT YAPAN FONKSİYON ---
@app.post("/satis-yap")
def satis_yap(satis: SatisVerisi, db: Session = Depends(get_db)):
    
    # 1. Yeni bir satış fişi oluştur
    yeni_satis = models.Satis(
        yetiskin=satis.yetiskin_sayisi,
        cocuk=satis.cocuk_sayisi,
        tutar=satis.toplam_tutar,
        tarih=datetime.now()
    )
    
    # 2. Veritabanına ekle ve kaydet
    db.add(yeni_satis)
    db.commit()
    db.refresh(yeni_satis) # ID numarasını al
    
    print(f"✅ VERİTABANINA KAYDEDİLDİ! Fiş No: {yeni_satis.id}, Tutar: {yeni_satis.tutar} TL")
    
    return {
        "durum": "Başarılı",
        "mesaj": "Satış veritabanına kaydedildi!",
        "detay": f"Fiş No: {yeni_satis.id} referansıyla işlendi."
    }