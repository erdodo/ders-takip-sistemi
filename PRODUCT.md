# StüdyoTakip — Ürün Tanıtım Dokümanı

> **"Müşterilerinizi takip etmek için daha fazla zaman harcıyorsanız, onlara ders verecek vaktiniz kalmıyor."**

---

## 🎯 Ürün Nedir?

**StüdyoTakip**, yoga stüdyoları, pilates merkezleri ve özel ders veren eğitmenler için tasarlanmış, bulut tabanlı bir **paket ve ders takip sistemidir**.

Kağıt defterlere, Excel tablolarına ya da karmaşık yazılımlara gerek kalmadan; üyelerinizin paketlerini, derslerini ve ödemelerini tek bir yerden yönetebilirsiniz.

---

## 😣 Çözülen Problem

Küçük ve orta ölçekli stüdyolar şu sorunlarla her gün boğuşuyor:

| Problem | Sonuç |
|---------|-------|
| Kimin kaç dersi kaldığını bilmemek | Üye memnuniyetsizliği, gelir kaybı |
| Ödemesi bekleyen üyeleri takip edememek | Tahsilat güçlüğü |
| Kontörü bitmek üzere olan üyeyi fark edememek | Paket yenilenmemesi, üye kaybı |
| WhatsApp'tan manuel hatırlatma yazmak | Zaman kaybı, insani hata |
| Aylık gelirin ne olduğunu bilmemek | Finansal belirsizlik |

StüdyoTakip bu problemlerin tamamını **tek bir uygulama** ile çözer.

---

## ✨ Özellikler

### 📊 Akıllı Dashboard

Uygulamayı açtığınızda anlık durumu görürsünüz:

- **Bugün işlenen dersler** — kimin bugün geldiği
- **Kredisi azalan üyeler** — 2 veya daha az dersi kalanlar (yenileme vakti!)
- **Ödeme bekleyenler** — tahsilat yapılmamış paketler
- **5 özet kart** — aktif üye, aktif paket, günlük ders, düşük kredi, bekleyen ödeme sayıları

Sabah 5 dakikada günü planlayın.

---

### 👥 Müşteri Yönetimi

Her müşteri için tam profil:

- Ad-soyad, telefon, e-posta, notlar
- Aktif / pasif durumu
- Tüm paket geçmişi
- Her paketin ilerleme çubuğu (5/10 ders tamamlandı)
- Ders-ders geçmiş (tarih, tür, işleyen eğitmen)
- Ödeme geçmişi

---

### 📦 Kontör Tabanlı Paket Sistemi

Stüdyonuza uygun paket tanımları oluşturun:

- **İsim:** "10 Ders Paketi", "Aylık Pilates", "Özel 5'li Paket"
- **Ders sayısı:** kaç kontör içerdiği
- **Geçerlilik süresi:** kaç gün süreceği (opsiyonel)
- **Fiyat:** referans ücret

Üyeye paket atadığınızda kontörler otomatik tanımlanır. Her "Ders İşle" tıklamasında bir kontör düşer.

---

### ⚡ Tek Tıkla Ders İşleme

Üye geldi, ders verildi — tek buton:

1. Müşteri sayfasını açın
2. **"Ders İşle"** butonuna tıklayın
3. İşlem tamamlandı

Sistem otomatik olarak:
- Kontörü 1 azaltır
- Ders kaydını tarihle saklar
- Paketi kapanmış olarak işaretler (kontör bitince)
- Kredi ≤ 2 ise webhook tetikler (CRM, bildirim, Zapier vb.)

Ders başına 30 saniyenin altında idari iş.

---

### 💬 WhatsApp Entegrasyonu

Kontörü azalan her üye için tek tıkla hazır mesaj:

> *"Merhaba Ayşe Hanım, paketinizde 2 ders hakkınız kalmıştır. Yeni paket için bizi arayabilirsiniz. İyi günler! 🌿"*

Mesaj, WhatsApp Web'i otomatik açarak numaraya yönlendirir. Kopyala-yapıştır yok, numara arıyor yok.

---

### 💳 Ödeme Takibi

- Müşteri başına ödeme geçmişi
- Paket bazlı ödeme durumu (ödendi / bekliyor)
- Ödeme yöntemi: Nakit, Kart, Havale/EFT
- Toplam tahsilat özeti
- Henüz tahsil edilmemiş tutarların listesi

---

### ⚙️ Ayarlar Paneli

**Hesabım:**
- Profil bilgileri (ad, e-posta)
- Şifre değiştirme

**İşletme Bilgileri:**
- Stüdyo adı, açıklama, iletişim
- Logo URL'i
- Marka renkleri (ana renk + vurgu rengi)
- Web sitesi ve adres

**Webhook Yönetimi:**
- Sınırsız webhook endpoint ekleyin
- Her endpoint için ayrı olay seçimi
- HMAC-SHA256 imza güvenliği
- Test butonu
- Teslimat geçmişi (son 5 log / endpoint)
- Secret yenileme

---

### 🔗 Webhook & Otomasyon

Stüdyonuzu sevdiğiniz araçlarla entegre edin:

**Örnek kullanım senaryoları:**

- **Zapier:** Kontör azaldığında otomatik SMS gönder
- **Make (Integromat):** Yeni üye eklendiğinde Google Sheets'e kaydet
- **Kendi CRM'iniz:** Ödeme geldiğinde fatura oluştur
- **Slack/Discord botu:** Günlük ders özetini kanala gönder
- **E-posta servisi:** Paketi bitenle otomatik iletişim

Tetiklenen olaylar: ders işlendi, ödeme alındı, müşteri oluşturuldu, müşteri güncellendi, paket atandı, kredi azaldı.

---

## 🏗 Teknik Altyapı

*Teknik detaylar ilgilenen kullanıcılar ve IT ekipleri için:*

- **Mimari:** Multi-tenant SaaS — her stüdyo tamamen izole, veriler karışmaz
- **Güvenlik:** Tüm şifreler bcrypt ile hash'lenir; session JWT ile yönetilir; webhook'lar HMAC-SHA256 ile imzalanır
- **Performans:** Next.js 14 App Router + statik önbellekleme; sunucu taraflı render
- **Veritabanı:** PostgreSQL — sektörün en güvenilir açık kaynak veritabanı
- **Kurulum:** Docker Compose ile tek komut — PostgreSQL dahil tamamen izole
- **Ölçekleme:** Mevcut sunucu altyapınıza entegre edilir veya bulut sağlayıcısında barındırılır

---

## 📐 Kullanım Senaryoları

### Senaryo 1 — Yoga Stüdyosu (15–50 aktif üye)
Hafta içi 3 eğitmen, 8–12 ders/gün. Dashboard sabah günlük doluluğu gösterir. Eğitmenler kendi cihazlarından ders işler. Sahip akşam kasa özetine bakar.

### Senaryo 2 — Pilates Merkezi (30–100 aktif üye)
Seans bazlı ön kayıt yapılır, ders işlenince kontör düşer. Kasiyero ödeme ekler, sistem her paketin ne zaman dolacağını gösterir. Webhook ile WhatsApp Business API'ye bağlanır.

### Senaryo 3 — Özel Ders Eğitmeni (5–20 öğrenci)
Tek kişilik işletme. Telefonda müşteri listesine bakıp "Ders İşle" basar. Ay sonunda ödemeler sayfasından kimin borcu olduğunu görür.

---

## 🚀 Başlarken Ne Kadar Sürer?

| Adım | Süre |
|------|------|
| Kayıt / kurulum | 5 dakika |
| İlk müşterileri eklemek | 10 dakika |
| İlk paketleri tanımlamak | 5 dakika |
| Aktif kullanıma geçiş | **20 dakika** |

---

## 🔒 Güvenlik & Veri Gizliliği

- Verileriniz kendi sunucunuzda durur (self-hosted) — üçüncü taraflarla paylaşılmaz
- Her stüdyo tamamen izole — başka stüdyoların verisine erişim imkansız
- Tüm şifreler tek yönlü hash ile saklanır, okunamaz
- Webhook istekleri imzalanır — sahte istekler reddedilir
- HTTPS + güvenli JWT session yönetimi

---

## 📦 Fiyatlandırma Modeli *(Ürün olarak konumlandırıldığında)*

| Plan | Uygun Kitle | Özellikler |
|------|-------------|------------|
| **Başlangıç** | Bireysel eğitmen | 1 kullanıcı, 30 üyeye kadar, temel özellikler |
| **Stüdyo** | Küçük stüdyolar | 5 kullanıcıya kadar, sınırsız üye, webhook (3 endpoint) |
| **Pro** | Büyüyen merkezler | Sınırsız kullanıcı, sınırsız webhook, öncelikli destek |
| **Self-Hosted** | Teknik ekipler | Kaynak kodu, kendi sunucunuzda çalışır, tek seferlik lisans |

---

## 🗺 Yol Haritası

- [ ] Seans rezervasyon takvimi (üyeler kendi seansını seçir)
- [ ] Native mobil uygulama (iOS & Android)
- [ ] Üye portalı (üye kendi kontörünü görebilir)
- [ ] SMS / e-posta otomatik hatırlatıcı
- [ ] Fatura / makbuz oluşturma
- [ ] Çoklu şube desteği
- [ ] Gelişmiş raporlama (aylık gelir, doluluk oranı, üye churn)
- [ ] Biyometrik / QR kod ile giriş doğrulama

---

## 📞 İletişim & Destek

Kurulum yardımı, özelleştirme talebi veya demo için:

- 📧 E-posta: destek@studyotakip.com
- 🌐 Web: [studyotakip.com](https://studyotakip.com)
- 💬 WhatsApp: +90 5xx xxx xx xx

---

*StüdyoTakip — Stüdyonuzu yönetin, derslerinize odaklanın.*
