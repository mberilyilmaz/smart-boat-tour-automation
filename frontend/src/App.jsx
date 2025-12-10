import React, { useState } from 'react';
import { Ticket, Ship, CreditCard, User, AlertCircle, CheckCircle2, ChevronRight, Anchor, Wallet, Send } from 'lucide-react';

export default function App() {
  // --- DURUM YÖNETİMİ (STATE) ---
  const [yetiskinSayisi, setYetiskinSayisi] = useState(0);
  const [cocukSayisi, setCocukSayisi] = useState(0);
  const [toplamYolcu, setToplamYolcu] = useState(0); 
  const [turNumarasi, setTurNumarasi] = useState(1); // Tur Sayacı
  const [yukleniyor, setYukleniyor] = useState(false);
  
  // --- SABİTLER ---
  const FIYAT = 250;
  
  // --- HESAPLAMALAR ---
  const anlikSepetYolcu = yetiskinSayisi + cocukSayisi;
  const anlikTutar = yetiskinSayisi * FIYAT;
  
  const guncelToplamYolcu = toplamYolcu + anlikSepetYolcu;
  
  // Tekne Seçimi Mantığı
  const tekneKapasitesi = guncelToplamYolcu > 20 ? 40 : 20;
  const tekneAdi = guncelToplamYolcu > 20 ? "Eğin Tur (40)" : "Kanyon Runner (20)";
  
  // Doluluk Hesabı ve Renkler
  const dolulukOrani = (guncelToplamYolcu / tekneKapasitesi) * 100;
  const barRengi = dolulukOrani >= 100 ? "bg-red-500" : dolulukOrani > 50 ? "bg-blue-500" : "bg-emerald-500";
  
  // Kural: En az 6 kişi
  const kalkisaHazirMi = guncelToplamYolcu >= 6;

  // --- 1. FONKSİYON: SATIŞ YAP ---
  const satisYap = async () => {
    if (anlikSepetYolcu === 0) return alert("⚠️ Lütfen en az bir bilet seçiniz!");
    
    setYukleniyor(true);

    const satisVerisi = {
      yetiskin_sayisi: yetiskinSayisi,
      cocuk_sayisi: cocukSayisi,
      toplam_tutar: anlikTutar,
      tur_no: turNumarasi
    };

    try {
      const cevap = await fetch("http://127.0.0.1:8081/satis-yap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(satisVerisi)
      });

      if (cevap.ok) {
        const sonuc = await cevap.json();
        alert(`✅ BİLET KESİLDİ!\n\nVeritabanı ID: ${sonuc.detay}\nTutar: ${anlikTutar} TL`);
        
        setToplamYolcu(guncelToplamYolcu);
        setYetiskinSayisi(0);
        setCocukSayisi(0);
      } else {
        alert("❌ Hata oluştu! Sunucu cevap vermedi.");
      }

    } catch (hata) {
      console.error("Bağlantı Hatası:", hata);
      alert("⚠️ Sunucuya bağlanılamadı! Backend açık mı?");
    } finally {
      setYukleniyor(false);
    }
  };

  // --- 2. FONKSİYON: SEFERİ KALDIR ---
  const seferiBaslat = () => {
    // KİLİT NOKTASI: 6 kişiden azsa fonksiyonu durdur!
    if (!kalkisaHazirMi) {
        return alert(`⚠️ Yetersiz Yolcu! Kalkış için en az 6 yolcu gerekiyor.\n(Şu anki yolcu: ${guncelToplamYolcu})`);
    }
    
    if (window.confirm(`🚢 ${turNumarasi}. Seferi başlatmak üzeresiniz.\n\nTekne sistemden temizlenecek ve ${turNumarasi + 1}. Tur için kayıtlar başlayacak.\nOnaylıyor musunuz?`)) {
       setToplamYolcu(0);
       setYetiskinSayisi(0);
       setCocukSayisi(0);
       setTurNumarasi(turNumarasi + 1);
       
       alert("🌊 İYİ YOLCULUKLAR! Tekne yola çıktı. Panel yeni tur için hazır.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      
      {/*HEADER*/}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-700 p-2.5 rounded-xl text-white shadow-blue-200 shadow-lg">
              <Ship size={28} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">DARK CANYON CAFE</h1>
              <p className="text-slate-500 text-xs font-medium tracking-wide">AKILLI TEKNE TURU OTOMASYONU v2.0</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-slate-900 text-white px-4 py-2 rounded-lg font-bold border border-slate-700 shadow-lg flex items-center gap-2">
                <Anchor size={16} className="text-blue-400"/>
                <span>SEFER #{turNumarasi}</span>
            </div>

            <div className={`hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold border ${kalkisaHazirMi ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
              <div className={`w-2.5 h-2.5 rounded-full ${kalkisaHazirMi ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`}></div>
              {kalkisaHazirMi ? "KALKIŞA HAZIR" : "DOLUM BEKLENİYOR"}
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 bg-slate-100 px-4 py-2 rounded-lg border border-slate-200">
              <User size={18} />
              <span>Merve Beril</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
        
        {/* SOL PANEL */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="font-bold text-lg flex items-center gap-2 text-slate-800">
                <Ticket className="text-blue-600" /> Bilet Satış
              </h2>
              <span className="text-xs font-bold text-slate-400 bg-slate-200 px-2 py-1 rounded">TUR {turNumarasi}</span>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-700">Yetişkin</span>
                  <span className="text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded text-sm">250 ₺</span>
                </div>
                <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-xl border border-slate-200">
                  <button onClick={() => setYetiskinSayisi(Math.max(0, yetiskinSayisi - 1))} className="w-12 h-12 bg-white rounded-lg shadow-sm border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 font-bold text-xl active:scale-95">-</button>
                  <span className="flex-1 text-center font-black text-2xl text-slate-800">{yetiskinSayisi}</span>
                  <button onClick={() => setYetiskinSayisi(yetiskinSayisi + 1)} className="w-12 h-12 bg-blue-600 rounded-lg shadow-blue-200 shadow-md text-white hover:bg-blue-700 font-bold text-xl active:scale-95">+</button>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-700">Çocuk <span className="text-slate-400 text-xs">(0-10)</span></span>
                  <span className="text-green-600 font-bold bg-green-50 px-2 py-1 rounded text-sm">ÜCRETSİZ</span>
                </div>
                <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-xl border border-slate-200">
                  <button onClick={() => setCocukSayisi(Math.max(0, cocukSayisi - 1))} className="w-12 h-12 bg-white rounded-lg shadow-sm border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 font-bold text-xl active:scale-95">-</button>
                  <span className="flex-1 text-center font-black text-2xl text-slate-800">{cocukSayisi}</span>
                  <button onClick={() => setCocukSayisi(cocukSayisi + 1)} className="w-12 h-12 bg-blue-600 rounded-lg shadow-blue-200 shadow-md text-white hover:bg-blue-700 font-bold text-xl active:scale-95">+</button>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-50 p-6 border-t border-slate-100">
              <div className="flex justify-between items-end">
                <span className="text-slate-500 font-medium flex items-center gap-2"><Wallet size={18}/> Toplam Tutar</span>
                <span className="text-3xl font-black text-slate-900 tracking-tight">{anlikTutar} <span className="text-lg text-slate-500 font-bold">₺</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* ORTA & SAĞ PANEL */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* TEKNE DURUMU */}
          <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 rounded-2xl shadow-xl text-white p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 opacity-10 transform translate-x-10 -translate-y-10 transition-transform duration-700 group-hover:scale-110">
              <Ship size={240} />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <div className="flex items-center gap-2 text-blue-200 font-bold mb-1 text-sm tracking-wider">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  SİSTEM AKTİF • SEFER #{turNumarasi}
                </div>
                <h2 className="text-4xl font-black tracking-tight mt-2">{tekneAdi}</h2>
                <p className="text-blue-200 mt-2 text-lg">Kapasite: <span className="text-white font-bold">{tekneKapasitesi} Kişi</span></p>
              </div>

              <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 min-w-[240px] shadow-lg">
                <div className="flex justify-between text-sm font-medium mb-3 text-blue-100">
                  <span>Doluluk Oranı</span>
                  <span className="font-bold text-white">%{dolulukOrani.toFixed(0)}</span>
                </div>
                <div className="w-full bg-black/30 rounded-full h-4 mb-3 overflow-hidden border border-white/10">
                  <div className={`h-full transition-all duration-1000 ease-out ${barRengi}`} style={{width: `${dolulukOrani}%`}}></div>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-xs text-blue-200">Yolcu Sayısı</span>
                    <span className="text-xl font-bold text-white">{guncelToplamYolcu} <span className="text-sm font-normal text-blue-200">/ {tekneKapasitesi}</span></span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6">
                 {!kalkisaHazirMi ? (
                  <div className="inline-flex items-center gap-3 bg-amber-500/20 border border-amber-500/30 text-amber-100 px-4 py-3 rounded-xl text-sm font-bold backdrop-blur-sm">
                    <AlertCircle size={20} className="text-amber-400" />
                    <span>Min. kalkış için {6 - guncelToplamYolcu} yolcu bekleniyor.</span>
                  </div>
                 ) : (
                  <div className="inline-flex items-center gap-3 bg-green-500/20 border border-green-500/30 text-green-100 px-4 py-3 rounded-xl text-sm font-bold backdrop-blur-sm">
                    <CheckCircle2 size={20} className="text-green-400" />
                    <span>Yeterli sayıya ulaşıldı. Tekne kalkabilir.</span>
                  </div>
                 )}

                 {/* BUTON: Sadece 6 kişi ve üzeri varsa aktif olur */}
                 <button 
                    onClick={seferiBaslat}
                    disabled={!kalkisaHazirMi} 
                    className={`px-6 py-3 rounded-xl font-bold text-sm shadow-lg flex items-center gap-2 transition-all 
                        ${kalkisaHazirMi 
                            ? 'bg-white text-blue-900 hover:bg-blue-50 active:scale-95 cursor-pointer' 
                            : 'bg-slate-700 text-slate-500 cursor-not-allowed opacity-50'} 
                    `}>
                    <Send size={18} />
                    SEFERİ KALDIR ({turNumarasi}. TUR)
                 </button>
            </div>
          </div>

          {/* ÖDEME KARTI */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <h2 className="font-bold text-lg flex items-center gap-2 text-slate-800 mb-6">
              <CreditCard className="text-blue-600" /> Ödeme & Onay
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <button className="flex items-center justify-center gap-3 p-4 rounded-xl border-2 border-blue-600 bg-blue-50 text-blue-700 font-bold transition-all hover:shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-bl-lg font-bold">SEÇİLİ</div>
                <span>NAKİT ÖDEME</span>
              </button>
              <button className="flex items-center justify-center gap-3 p-4 rounded-xl border-2 border-slate-100 text-slate-400 font-bold hover:border-slate-300 hover:text-slate-600 transition-all bg-slate-50 cursor-not-allowed opacity-60">
                <span>KREDİ KARTI (Yakında)</span>
              </button>
            </div>

            <button 
              onClick={satisYap}
              disabled={yukleniyor || anlikSepetYolcu === 0}
              className={`w-full py-5 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3 group
                ${yukleniyor || anlikSepetYolcu === 0 ? 'bg-slate-400 cursor-not-allowed text-slate-200' : 'bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.99] shadow-slate-200'}
              `}>
              
              {yukleniyor ? (
                <>
                   <div className="w-6 h-6 border-4 border-slate-200 border-t-transparent rounded-full animate-spin"></div>
                   Kayıt Yapılıyor...
                </>
              ) : (
                <>
                  <CheckCircle2 size={24} className="text-green-400" />
                  BİLETİ KES & GÖNDER
                  <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}