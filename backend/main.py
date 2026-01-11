import asyncio
from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, Float, DateTime, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional

# 1. VERİTABANI BAĞLANTISI
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:114402@localhost/tekne_turu"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# 2. TABLO TANIMI
class Satis(Base):
    __tablename__ = "satislar_yeni"
    id = Column(Integer, primary_key=True, index=True)
    yetiskin_sayisi = Column(Integer)
    cocuk_sayisi = Column(Integer)
    toplam_tutar = Column(Float)
    tarih = Column(DateTime, default=datetime.now)

Base.metadata.create_all(bind=engine)

app = FastAPI()

# 3. CORS (İzinler)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- GLOBAL HAVUZ VE TEKNE DURUMLARI (RAM) ---
havuz = { "yetiskin": 0, "cocuk": 0 }

boats_state = [
    { "id": 1, "name": "Kanyon Runner", "capacity": 20, "status": "docked", "on_board": {"adult": 0, "child": 0} },
    { "id": 2, "name": "Eğin Tur", "capacity": 40, "status": "docked", "on_board": {"adult": 0, "child": 0} }
]

# --- MODELLER ---
# Yeni Mobil İçin Model
class TicketSale(BaseModel):
    adult_count: int
    child_count: int

# Eski Web Sitesi İçin Model
class OldSatisVerisi(BaseModel):
    yetiskin_sayisi: int
    cocuk_sayisi: int
    toplam_tutar: float
    tur_no: int

# Eski Web Sitesi İçin Havuz Düşme Modeli
class HavuzDusme(BaseModel):
    dusen_miktar: int

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- YARDIMCI FONKSİYONLAR ---
async def simulate_tour(boat_id: int):
    await asyncio.sleep(15) # 15 saniyelik tur
    for boat in boats_state:
        if boat["id"] == boat_id:
            boat["status"] = "docked"
            boat["on_board"] = {"adult": 0, "child": 0}
            break

# --- ENDPOINTLER ---

@app.get("/")
def read_root():
    return {"status": "active", "message": "Dark Canyon Backend Online 🚀"}

# --- YENİ SİSTEM (MOBİL İÇİN) ---

@app.get("/dashboard-status")
def get_dashboard_status(db: Session = Depends(get_db)):
    bugun = datetime.now().date()
    ciro = db.query(func.sum(Satis.toplam_tutar)).filter(func.date(Satis.tarih) == bugun).scalar() or 0
    total_waiting = havuz["yetiskin"] + havuz["cocuk"]
    return {
        "waiting_stats": { "total": total_waiting, "adult": havuz["yetiskin"], "child": havuz["cocuk"] },
        "total_revenue": ciro,
        "boats": boats_state
    }

@app.post("/tickets/sell")
def sell_tickets(ticket: TicketSale, db: Session = Depends(get_db)):
    tutar = ticket.adult_count * 250
    yeni_satis = Satis(yetiskin_sayisi=ticket.adult_count, cocuk_sayisi=ticket.child_count, toplam_tutar=tutar)
    db.add(yeni_satis)
    db.commit()
    havuz["yetiskin"] += ticket.adult_count
    havuz["cocuk"] += ticket.child_count
    return {"message": "Satış başarılı", "new_pool": havuz}

@app.post("/boats/{boat_id}/depart")
def start_expedition(boat_id: int, background_tasks: BackgroundTasks):
    boat = next((b for b in boats_state if b["id"] == boat_id), None)
    if not boat: raise HTTPException(status_code=404, detail="Tekne yok")
    if boat["status"] == "tour": raise HTTPException(status_code=400, detail="Zaten seferde")
    
    toplam_bekleyen = havuz["yetiskin"] + havuz["cocuk"]
    if toplam_bekleyen < boat["capacity"]:
        raise HTTPException(status_code=400, detail=f"Yetersiz yolcu! En az {boat['capacity']} kişi lazım.")

    kapasite = boat["capacity"]
    binen_yetiskin = min(havuz["yetiskin"], kapasite)
    kapasite -= binen_yetiskin
    binen_cocuk = min(havuz["cocuk"], kapasite)

    havuz["yetiskin"] -= binen_yetiskin
    havuz["cocuk"] -= binen_cocuk
    
    boat["on_board"]["adult"] = binen_yetiskin
    boat["on_board"]["child"] = binen_cocuk
    boat["status"] = "tour"
    
    background_tasks.add_task(simulate_tour, boat_id)
    return {"message": "Sefer başladı", "boat": boat}


# --- ESKİ SİSTEM (WEB SİTESİ KURTARICI ENDPOINTLER) ---
# Web sitesindeki "404 Not Found" hatalarını bunlar çözecek.

# 1. Havuz Bilgisi (Web Sitesi buraya bakıyor)
@app.get("/havuz-bilgi")
def get_havuz_old():
    return {
        "yetiskin": havuz["yetiskin"],
        "cocuk": havuz["cocuk"],
        "toplam": havuz["yetiskin"] + havuz["cocuk"]
    }

# 2. Günlük Ciro (Web Sitesi buraya bakıyor)
@app.get("/gunluk-ciro")
def get_ciro_old(db: Session = Depends(get_db)):
    bugun = datetime.now().date()
    ciro = db.query(func.sum(Satis.toplam_tutar)).filter(func.date(Satis.tarih) == bugun).scalar()
    return {"ciro": ciro if ciro else 0}

# 3. Satış Yap (Web Sitesi buraya gönderiyor)
@app.post("/satis-yap")
def satis_yap_old(satis: OldSatisVerisi, db: Session = Depends(get_db)):
    yeni_satis = Satis(
        yetiskin_sayisi=satis.yetiskin_sayisi,
        cocuk_sayisi=satis.cocuk_sayisi,
        toplam_tutar=satis.toplam_tutar
    )
    db.add(yeni_satis)
    db.commit()
    
    # Havuzu güncelle
    havuz["yetiskin"] += satis.yetiskin_sayisi
    havuz["cocuk"] += satis.cocuk_sayisi
    
    return {"mesaj": "Kayıt Başarılı (Legacy Mode)"}

# 4. Havuz Güncelle (Web Sitesi tekne kaldırınca buraya istek atabilir, hata vermesin diye ekledik)
@app.post("/havuz-guncelle")
def update_havuz_old(dusme: HavuzDusme):
    # Bu özellik artık mobilden yönetiliyor ama web sitesi hata vermesin diye boş cevap dönüyoruz.
    # Web sitesinden tekne kaldırma işlemi eski usul çalışmaya devam edebilir (havuzu sıfırlayarak).
    toplam = havuz["yetiskin"] + havuz["cocuk"]
    yeni_toplam = max(0, toplam - dusme.dusen_miktar)
    
    # Basitçe havuzu orantılı azaltalım veya sıfırlayalım (Web sitesi mantığına uyması için)
    if yeni_toplam == 0:
        havuz["yetiskin"] = 0
        havuz["cocuk"] = 0
    else:
        # Tam mantık kurmak zor, şimdilik basitçe azaltıyoruz
        havuz["yetiskin"] = max(0, havuz["yetiskin"] - dusme.dusen_miktar) 
    
    return {"mesaj": "Havuz güncellendi", "guncel_durum": havuz}