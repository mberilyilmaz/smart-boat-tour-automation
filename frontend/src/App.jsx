import React, { useState, useEffect } from 'react';
import { Ticket, Ship, User, CheckCircle2, ChevronRight, Anchor, Send, Navigation, Timer, RotateCcw, Activity, Wallet, Power } from 'lucide-react';

export default function App() {
  
  // --- AYARLAR ---
  const TUR_SURESI_DAKIKA = 40; 
  const MIN_KALKIS_SAYISI = 6; // Kural: En az 6 kişi!

  // --- SERVER AYARI ---
  const API_URL = "http://127.0.0.1:8081";

  // --- STATE ---
  const [turNumarasi, setTurNumarasi] = useState(() => {
    return parseInt(localStorage.getItem('turNumarasi') || 1);
  });

  const [gunlukCiro, setGunlukCiro] = useState(0);

  const [kucukBitis, setKucukBitis] = useState(() => parseInt(localStorage.getItem('kucukTekneBitis') || 0) || null);
  const [buyukBitis, setBuyukBitis] = useState(() => parseInt(localStorage.getItem('buyukTekneBitis') || 0) || null);

  const [kucukKalan, setKucukKalan] = useState(0);
  const [buyukKalan, setBuyukKalan] = useState(0);

  const [yetiskinSayisi, setYetiskinSayisi] = useState(0);
  const [cocukSayisi, setCocukSayisi] = useState(0);
  
  const [iskeledekiYolcu, setIskeledekiYolcu] = useState(0); 

  const [yukleniyor, setYukleniyor] = useState(false);

  // --- SENKRONİZASYON ---
  useEffect(() => {
    const veriGuncelle = async () => {
        try {
            const havuzRes = await fetch(`${API_URL}/havuz-bilgi`);
            if(havuzRes.ok) {
                const havuzData = await havuzRes.json();
                setIskeledekiYolcu(havuzData.toplam);
            }
            const ciroRes = await fetch(`${API_URL}/gunluk-ciro`);
            if(ciroRes.ok) {
                const ciroData = await ciroRes.json();
                setGunlukCiro(ciroData.ciro);
            }
        } catch(e) { 
            // Hata değişkenini 'e' kullanarak uyarıyı çözdük
            console.error("Sunucuya bağlanılamadı:", e); 
        }
    };

    veriGuncelle();
    const interval = setInterval(veriGuncelle, 2000);
    return () => clearInterval(interval);
  }, []);

  // --- ZAMANLAYICI ---
  useEffect(() => {
    const zamanlayici = setInterval(() => {
      const suan = Date.now();
      if (kucukBitis) {
        const fark = Math.floor((kucukBitis - suan) / 1000);
        if (fark > 0) setKucukKalan(fark); else manuelDonus('kucuk', false); 
      }
      if (buyukBitis) {
        const fark = Math.floor((buyukBitis - suan) / 1000);
        if (fark > 0) setBuyukKalan(fark); else manuelDonus('buyuk', false);
      }
    }, 1000);
    return () => clearInterval(zamanlayici);
  }, [kucukBitis, buyukBitis]);

  // --- KAYIT ---
  useEffect(() => {
    localStorage.setItem('turNumarasi', turNumarasi);
  }, [turNumarasi]);

  // --- İŞLEVLER ---
  const satisYap = async () => {
    const anlikSepet = yetiskinSayisi + cocukSayisi;
    const anlikTutar = yetiskinSayisi * 250;

    if (anlikSepet === 0) return alert("Lütfen bilet seçin.");
    setYukleniyor(true);
    
    try {
      const cevap = await fetch(`${API_URL}/satis-yap`, {
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({
            yetiskin_sayisi: yetiskinSayisi,
            cocuk_sayisi: cocukSayisi,
            toplam_tutar: anlikTutar,
            tur_no: turNumarasi
        })
      });

      if (cevap.ok) {
        setYetiskinSayisi(0); 
        setCocukSayisi(0);
      } else { alert("Kayıt Hatası!"); }
    } catch (hata) { console.error(hata); alert("Sunucu Hatası! Backend çalışıyor mu?"); } 
    finally { setYukleniyor(false); }
  };

  const tekneKaldir = async (tip) => {
    const kapasite = tip === 'kucuk' ? 20 : 40;
    const ad = tip === 'kucuk' ? 'Kanyon Runner' : 'Eğin Tur';
    const binecek = Math.min(iskeledekiYolcu, kapasite);

    if (binecek < MIN_KALKIS_SAYISI) return alert(`⚠️ Yetersiz Yolcu!\n\nSefer kaldırmak için en az ${MIN_KALKIS_SAYISI} yolcu gereklidir.\nŞu anki yolcu: ${binecek}`);

    if (window.confirm(`⚓ ${ad} Kalkıyor!\n\n${binecek} yolcu ile turu başlatmak istiyor musunuz?`)) {
        
        try {
            await fetch(`${API_URL}/havuz-guncelle`, {
                method: "POST", headers: {"Content-Type": "application/json"},
                body: JSON.stringify({ dusen_miktar: binecek })
            });
        } catch(e) { 
            console.error("Havuz güncellenemedi:", e); // 'e' burada kullanıldı
        }

        const bitis = Date.now() + (TUR_SURESI_DAKIKA * 60 * 1000);
        if (tip === 'kucuk') {
            setKucukBitis(bitis);
            localStorage.setItem('kucukTekneBitis', bitis.toString());
        } else {
            setBuyukBitis(bitis);
            localStorage.setItem('buyukTekneBitis', bitis.toString());
        }
        setTurNumarasi(prev => prev + 1);
    }
  };

  const manuelDonus = (tip, elle = true) => {
    if (elle && !window.confirm("⚠️ Emin misiniz?\nTekneyi manuel olarak iskeleye çağırmak üzeresiniz.")) return;
    if (tip === 'kucuk') { setKucukBitis(null); localStorage.removeItem('kucukTekneBitis'); } 
    else { setBuyukBitis(null); localStorage.removeItem('buyukTekneBitis'); }
  };

  const gunSonuYap = () => {
    if (window.confirm("🌙 GÜN SONU YAPILIYOR\n\nEkran temizlensin mi?")) {
        localStorage.clear();
        window.location.reload();
    }
  };

  const formatSure = (saniye) => {
    const dk = Math.floor(saniye / 60);
    const sn = saniye % 60;
    return `${dk}:${sn < 10 ? '0' : ''}${sn}`;
  };

  const FIYAT = 250;
  const anlikSepet = yetiskinSayisi + cocukSayisi;
  const anlikTutar = yetiskinSayisi * FIYAT;
  
  let headerDurumMetni = "SEFERE HAZIR";
  let headerStyle = "bg-green-50 text-green-700 border-green-200";
  let headerIkon = <CheckCircle2 size={16} className="text-green-500"/>;

  if (kucukBitis && buyukBitis) {
      headerDurumMetni = "TÜM FİLO TURDA";
      headerStyle = "bg-indigo-50 text-indigo-700 border-indigo-200";
      headerIkon = <Navigation size={16} className="text-indigo-500 animate-pulse"/>;
  } else if (kucukBitis) {
      headerDurumMetni = "KANYON RUNNER TURDA";
      headerStyle = "bg-blue-50 text-blue-700 border-blue-200";
      headerIkon = <Navigation size={16} className="text-blue-500 animate-pulse"/>;
  } else if (buyukBitis) {
      headerDurumMetni = "EĞİN TUR TURDA";
      headerStyle = "bg-cyan-50 text-cyan-700 border-cyan-200";
      headerIkon = <Navigation size={16} className="text-cyan-500 animate-pulse"/>;
  }

  // --- TEKNE KARTI BİLEŞENİ (GÜNCELLENMİŞ: MOBİL UYUMLU LACİVERT) ---
  const TekneKarti = ({ ad, kapasite, turda, kalanSure, onLaunch, onReset, tema }) => {
    const binecek = Math.min(iskeledekiYolcu, kapasite);
    const doluluk = Math.min((binecek / kapasite) * 100, 100);
    const butonAktif = binecek >= MIN_KALKIS_SAYISI;

    // Mobil uygulama renkleri (#0f172a ve slate tonları)
    const stil = tema === 'mavi' ? {
        bar: 'bg-blue-600', 
        btnNormal: 'bg-blue-600 hover:bg-blue-700 shadow-md text-white', 
        bgIcon: 'text-blue-50'
    } : {
        bar: 'bg-cyan-600', 
        btnNormal: 'bg-cyan-600 hover:bg-cyan-700 shadow-md text-white', 
        bgIcon: 'text-cyan-50'
    };

    return (
        <div className={`relative rounded-3xl overflow-hidden transition-all duration-500 flex flex-col justify-between h-full min-h-[420px] group ${turda ? `bg-[#0f172a] text-white shadow-2xl ring-4 ring-slate-700 border border-slate-600 scale-[1.02]` : 'bg-white border border-slate-200 hover:shadow-xl hover:border-blue-200'}`}>
            
            {/* Arkaplan Efektleri (Turdaysa Sade Lacivert, Değilse İkonlu) */}
            {turda && (<div className={`absolute top-0 right-0 w-80 h-80 bg-blue-900/10 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none`}></div>)}
            {!turda && (<div className={`absolute -bottom-10 -right-10 ${stil.bgIcon} opacity-50 transform rotate-12 pointer-events-none transition-transform duration-700 group-hover:scale-110 group-hover:rotate-45`}><Ship size={180} /></div>)}

            <div className="p-6 relative z-10 flex-grow">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        {turda ? (
                            <span className={`bg-blue-500/10 text-blue-300 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider flex items-center gap-2 border border-blue-500/20 shadow-sm`}>
                                <Timer size={12} className="animate-spin-slow"/> TURDA
                            </span>
                        ) : (
                            <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider flex items-center gap-2">
                                <Anchor size={12}/> İSKELEDE
                            </span>
                        )}
                        <h3 className={`font-black text-2xl tracking-tight mt-3 ${turda ? 'text-white' : 'text-slate-800'}`}>{ad}</h3>
                        <p className={`text-xs font-bold ${turda ? 'text-slate-400' : 'text-slate-400'}`}>{kapasite} Kişilik</p>
                    </div>
                    <div className={`p-3 rounded-2xl ${turda ? 'bg-slate-800 text-white border border-slate-700' : 'bg-slate-100 text-slate-400'}`}><Ship size={32} /></div>
                </div>

                {!turda && (
                    <div className="space-y-2 mt-4">
                        <div className="flex justify-between text-xs font-bold text-slate-500"><span>Yeni Sefer İçin Hazır</span><span>{binecek} / {kapasite}</span></div>
                        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden"><div className={`h-full transition-all duration-500 ${stil.bar}`} style={{width: `${doluluk}%`}}></div></div>
                        {binecek > 0 && binecek < MIN_KALKIS_SAYISI && (<p className="text-[10px] font-bold text-orange-500 mt-2 flex items-center gap-1"><Activity size={10}/> Sefer için {MIN_KALKIS_SAYISI - binecek} kişi daha gerekli.</p>)}
                        {binecek >= MIN_KALKIS_SAYISI && (<p className="text-[10px] font-bold text-green-500 mt-2 flex items-center gap-1 animate-pulse"><CheckCircle2 size={10}/> Sefer kalkışa hazır!</p>)}
                    </div>
                )}
            </div>

            <div className={`p-4 relative z-10 mt-auto ${turda ? 'border-t border-slate-700' : 'border-t border-slate-100/10'}`}>
                {turda ? (
                    <div className="space-y-3">
                         <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-4 text-center border border-slate-700 shadow-inner">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider">Dönüşe Kalan</p>
                            <div className="text-4xl font-black text-white font-mono tracking-tighter drop-shadow-lg">{formatSure(kalanSure)}</div>
                        </div>
                        <button onClick={onReset} className="w-full py-2 rounded-lg text-xs font-bold text-red-400 hover:text-red-200 hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2 border border-dashed border-red-500/30"><RotateCcw size={14}/> Manuel Olarak Sıfırla</button>
                    </div>
                ) : (
                    <button onClick={onLaunch} disabled={!butonAktif} className={`w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${butonAktif ? stil.btnNormal : 'bg-slate-100 text-slate-300'}`}>
                        <Send size={18} /> {butonAktif ? `KALDIR (${binecek} YOLCU)` : `YETERSİZ YOLCU (${binecek})`}
                    </button>
                )}
            </div>
        </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-blue-200">
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3"><div className="bg-blue-900 p-2 rounded-lg text-white shadow-lg"><Ship size={24} strokeWidth={2.5} /></div><div><h1 className="text-lg font-black tracking-tighter text-slate-900 uppercase">Dark Canyon Cafe</h1><p className="text-slate-500 text-[10px] font-bold tracking-widest uppercase">Tekne Takip v4.5</p></div></div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 items-center gap-2"><Anchor size={14} className="text-slate-400"/> SEFER #{turNumarasi}</div>
            <div className={`px-4 py-2 rounded-lg text-xs font-bold border flex items-center gap-2 shadow-sm transition-all duration-300 ${headerStyle}`}>{headerIkon} <span>{headerDurumMetni}</span></div>
            <button onClick={gunSonuYap} className="flex items-center gap-2 text-xs font-bold text-white bg-slate-800 hover:bg-red-600 transition-colors px-4 py-2 rounded-lg border border-slate-700 shadow-md active:scale-95"><Power size={14} /> <span>GÜN SONU</span></button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 mt-2">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-100 flex justify-between items-center"><h2 className="font-bold text-lg flex items-center gap-2 text-slate-800"><Ticket className="text-blue-600" /> Bilet Gişesi</h2><span className="text-xs font-bold bg-white border px-2 py-1 rounded text-slate-400">Tur {turNumarasi}</span></div>
            <div className="p-6 space-y-6">
              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center justify-between shadow-sm"><div className="flex items-center gap-3"><div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><Wallet size={20}/></div><div><p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Bugünkü Hasılat</p><p className="text-2xl font-black text-emerald-700 tracking-tight">{gunlukCiro} ₺</p></div></div></div>
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-start gap-3 text-blue-800 text-xs font-bold leading-relaxed"><Activity size={18} className="shrink-0 text-blue-600" /><span>Yolcular havuza eklenir. Kaptanlar 6 kişi dolmadan sefer başlatamaz.</span></div>
              <div className="space-y-4"><div className="flex justify-between items-center"><span className="font-bold text-slate-700">Yetişkin</span><span className="text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded text-xs">250 ₺</span></div><div className="flex items-center gap-3"><button onClick={() => setYetiskinSayisi(Math.max(0, yetiskinSayisi - 1))} className="w-12 h-12 bg-slate-100 rounded-xl text-slate-600 font-bold text-xl active:scale-95">-</button><span className="flex-1 text-center font-black text-2xl text-slate-800">{yetiskinSayisi}</span><button onClick={() => setYetiskinSayisi(yetiskinSayisi + 1)} className="w-12 h-12 bg-slate-900 rounded-xl text-white font-bold text-xl active:scale-95 shadow-lg shadow-slate-300">+</button></div></div>
              <div className="space-y-4"><div className="flex justify-between items-center"><span className="font-bold text-slate-700">Çocuk</span><span className="text-green-600 font-bold bg-green-50 px-2 py-1 rounded text-xs">ÜCRETSİZ</span></div><div className="flex items-center gap-3"><button onClick={() => setCocukSayisi(Math.max(0, cocukSayisi - 1))} className="w-12 h-12 bg-slate-100 rounded-xl text-slate-600 font-bold text-xl active:scale-95">-</button><span className="flex-1 text-center font-black text-2xl text-slate-800">{cocukSayisi}</span><button onClick={() => setCocukSayisi(cocukSayisi + 1)} className="w-12 h-12 bg-slate-900 rounded-xl text-white font-bold text-xl active:scale-95 shadow-lg shadow-slate-300">+</button></div></div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100">
               <button onClick={satisYap} disabled={yukleniyor || anlikSepet === 0} className={`w-full py-4 rounded-xl font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] ${yukleniyor || anlikSepet === 0 ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'}`}>{yukleniyor ? "İşleniyor..." : "BİLETİ KES & HAVUZA EKLE"} <ChevronRight size={16} /></button>
               <div className="text-center mt-3 text-slate-400 text-[10px] font-black uppercase tracking-widest">Sepet: {anlikTutar} ₺</div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm"><h2 className="text-lg font-bold text-slate-800 flex items-center gap-3"><div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>İskele Bekleme Alanı</h2><div className="bg-slate-900 text-white px-5 py-2 rounded-xl text-sm font-black shadow-lg flex items-center gap-2"><User size={16} className="text-blue-400"/> {iskeledekiYolcu} <span className="text-slate-500 font-normal text-xs ml-1">Kişi Bekliyor</span></div></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <TekneKarti ad="Kanyon Runner" kapasite={20} turda={kucukBitis !== null} kalanSure={kucukKalan} onLaunch={() => tekneKaldir('kucuk')} onReset={() => manuelDonus('kucuk')} tema="mavi"/>
             <TekneKarti ad="Eğin Tur" kapasite={40} turda={buyukBitis !== null} kalanSure={buyukKalan} onLaunch={() => tekneKaldir('buyuk')} onReset={() => manuelDonus('buyuk')} tema="turkuaz"/>
          </div>
        </div>
      </main>
    </div>
  );
}