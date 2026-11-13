# akdutip2

Akdeniz Üniversitesi Tıp Fakültesi (Dönem 1, Dönem 2, Dönem 3) Not ve Komite Hesaplayıcı — **AkduTip.space**

Mobil öncelikli, modern cam morfolojisi (glassmorphism), akıcı Framer Motion animasyonları ve PWA (ana ekrana ekleme) desteğine sahip not hesaplama uygulaması.

## 🚀 Teknolojiler

- **React 19**
- **Vite**
- **Tailwind CSS v4**
- **Framer Motion**
- **PWA / Service Worker** (Çevrimdışı çalışma ve mobil kurulum desteği)

## 🛠 Kurulum ve Çalıştırma

```bash
# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev

# Canlı/üretim derlemesi oluşturun
npm run build
```

## 📱 Özellikler

- **Dönem 1, 2 ve 3 Ayrı Hesaplama:** Her dönemin kendi komite, PDÖ, pratik ve yıl içi/final ağırlıkları.
- **Akıllı Akordeon:** Veri girilmemiş komiteler açık kalır, tamamlanan komiteler puanını gösterip açılır-kapanır hale gelir.
- **Yönetici Paneli (`/admin`):** Ağırlıkları parola korumalı arayüz üzerinden düzenleyebilme ve `weights.json` dışa aktarma.
- **PWA & Mobil Uyum:** iOS ve Android cihazlar için optimize edilmiş "Ana Ekrana Ekle" yönlendirmesi.
