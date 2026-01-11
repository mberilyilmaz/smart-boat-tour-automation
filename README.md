🚢 Dark Canyon: Tekne Turu Otomasyonu & Kaptan Paneli
Bu proje, turizm sektöründeki tekne işletmelerinin iskele ve sefer süreçlerini dijitalleştirmek amacıyla geliştirilmiştir. Manuel takip sistemlerini ortadan kaldırarak kaptan ve iskele personeli arasındaki veri akışını optimize eder.

🚀 Öne Çıkan Özellikler
Gerçek Zamanlı Takip: İskeledeki yetişkin ve çocuk yolcu sayılarının anlık izlenmesi.

Kaptan Kontrolü: Tekne kartlarına dokunarak manuel sefer başlatma ve bitirme (Toggle sistemi).

Akıllı Görselleştirme: Tekne kapasitesine göre dinamik doluluk barı ve durum bazlı (Mavi/Turuncu) renk değişimi.

Optimistik UI: Sunucu gecikmelerini tolere eden ve kullanıcıya anında geri bildirim veren akıcı deneyim.

🛠 Teknoloji Yığını
Frontend: React Native (Expo)

Backend: Python FastAPI / Node.js

İkonlar: Lucide-React-Native

Veri Senkronizasyonu: RESTful API Polling (3sn periyotlu).

📋 Kurulum ve Çalıştırma Talimatları
Proje, Backend (Sunucu) ve Frontend (Mobil Uygulama) olmak üzere iki ana bölümden oluşur.

1. Backend (Sunucu) Kurulumu
Backend, tekne statülerini ve yolcu verilerini yönetir.

backend/ dizinine gidin.

Gerekli kütüphaneleri yükleyin:

Bash

pip install fastapi uvicorn
Sunucuyu yerel ağda erişilebilir şekilde başlatın:

Bash

uvicorn main:app --host 0.0.0.0 --port 8000
2. Frontend (Mobil Uygulama) Kurulumu
Ana dizinde bağımlılıkları yükleyin:

Bash

npm install
App.tsx içerisindeki API_BASE değişkenini, sunucunun çalıştığı bilgisayarın yerel IP adresiyle güncelleyin:

JavaScript

const API_BASE = "http://192.168.x.x:8000"; 
Uygulamayı başlatın:

Bash

npx expo start
Telefonunuzdaki Expo Go uygulaması ile QR kodu taratarak kaptan panelini kullanmaya başlayın.

📂 Proje Yapısı
backend/main.py: Veri yönetimini ve API endpointlerini içeren sunucu kodları.

App.tsx: Mobil uygulamanın ana mantığı ve gerçek zamanlı UI güncellemeleri.

Versiyon Kontrolü: Proje süresince main ve gelistirme dalları üzerinden Git Branching stratejisi uygulanmıştır.