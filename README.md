# 🚢 Dark Canyon – Tekne Turu Otomasyonu & Kaptan Paneli

Dark Canyon, turizm sektöründe faaliyet gösteren tekne işletmelerinin **iskele ve sefer yönetim süreçlerini dijitalleştirmek** amacıyla geliştirilmiş bir mobil ve sunucu tabanlı otomasyon sistemidir.

Manuel yolcu sayımı, sözlü bildirimler ve dağınık takip yöntemlerini ortadan kaldırarak; **kaptan**, **iskele personeli** ve **sistem** arasındaki veri akışını hızlı, güvenilir ve anlık hale getirir.

---

## 🎯 Projenin Amacı

* Tekne seferlerinin manuel takibini ortadan kaldırmak
* Yolcu sayılarının gerçek zamanlı ve hatasız izlenmesini sağlamak
* Kaptan ve iskele arasındaki iletişimi dijitalleştirmek
* Anlık geri bildirim veren, akıcı ve kullanıcı dostu bir kaptan paneli sunmak

---

## 🚀 Öne Çıkan Özellikler

### 🔄 Gerçek Zamanlı Takip

* İskelede binen **yetişkin** ve **çocuk** yolcu sayıları anlık olarak izlenir
* Veriler 3 saniyelik polling ile senkronize edilir

### 🧑‍✈️ Kaptan Kontrol Paneli

* Tekne kartına dokunarak **sefer başlatma / bitirme** (Toggle sistemi)
* Manuel ve hızlı kontrol imkânı

### 📊 Akıllı Görselleştirme

* Tekne kapasitesine göre **dinamik doluluk barı**
* Duruma bağlı renk değişimi:

  * 🟦 Mavi: Uygun / Normal durum
  * 🟧 Turuncu: Kapasiteye yaklaşan veya kritik durum

### ⚡ Optimistic UI Deneyimi

* Sunucu gecikmelerine rağmen kullanıcıya **anında görsel geri bildirim**
* Akıcı ve kesintisiz kullanım hissi

---

## 🛠 Teknoloji Yığını

### Frontend (Mobil Uygulama)

* **React Native (Expo)**
* **Lucide-React-Native** (ikon seti)

### Backend (Sunucu)

* **Python FastAPI** *(alternatif olarak Node.js)*
* RESTful API mimarisi

### Veri Senkronizasyonu

* **REST API Polling** (3 saniyelik periyot)

---

## 📋 Kurulum ve Çalıştırma

Proje iki ana bileşenden oluşur:

1. **Backend (Sunucu)**
2. **Frontend (Mobil Uygulama)**

### 1️⃣ Backend (Sunucu) Kurulumu

Backend, tekne durumlarını ve yolcu verilerini yönetir.

```bash
cd backend/
pip install fastapi uvicorn
```

Sunucuyu yerel ağda erişilebilir şekilde başlatın:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

---

### 2️⃣ Frontend (Mobil Uygulama) Kurulumu

Ana dizinde bağımlılıkları yükleyin:

```bash
npm install
```

`App.tsx` dosyasında API adresini, sunucunun çalıştığı bilgisayarın **yerel IP adresi** ile güncelleyin:

```ts
const API_BASE = "http://192.168.x.x:8000";
```

Uygulamayı başlatın:

```bash
npx expo start
```

📱 Telefonunuzdaki **Expo Go** uygulaması ile QR kodu tarayarak kaptan panelini kullanmaya başlayabilirsiniz.

---

## 📂 Proje Yapısı

```
backend/
 └── main.py        # API endpointleri ve veri yönetimi

App.tsx             # Mobil uygulamanın ana mantığı ve UI
```

---

## 🌱 Versiyon Kontrolü

Proje geliştirme sürecinde aşağıdaki **Git Branching** stratejisi uygulanmıştır:

* `main` → Kararlı sürüm
* `gelistirme` → Aktif geliştirme ve yeni özellikler

---

## 📌 Notlar & Geliştirme Fikirleri

* Web tabanlı iskele paneli entegrasyonu
* WebSocket ile gerçek zamanlı veri akışı
* Kullanıcı yetkilendirme (kaptan / iskele personeli)
* Sefer geçmişi ve raporlama ekranları

---

## 👤 Geliştirici

Bu proje, **turizm ve ulaşım sektöründe dijital dönüşümü desteklemek** amacıyla geliştirilmiştir.

Her türlü geri bildirim ve katkı için pull request veya issue açabilirsiniz.

---

✨ Keyifli kodlamalar ve güvenli seferler!
