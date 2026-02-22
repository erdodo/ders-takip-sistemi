# 📋 StüdyoTakip — Geliştirici Kılavuzu

Yoga, Pilates ve özel ders stüdyoları için multi-tenant SaaS uygulaması. Paket takibi, kontör sistemi, ödeme yönetimi ve webhook entegrasyonları içerir.

---

## 🗂 İçindekiler

- [Teknoloji Yığını](#teknoloji-yığını)
- [Proje Yapısı](#proje-yapısı)
- [Gereksinimler](#gereksinimler)
- [Hızlı Başlangıç (Docker)](#hızlı-başlangıç-docker)
- [Yerel Geliştirme Ortamı](#yerel-geliştirme-ortamı)
- [Ortam Değişkenleri](#ortam-değişkenleri)
- [Veritabanı](#veritabanı)
- [API ve Server Actions](#api-ve-server-actions)
- [Webhook Sistemi](#webhook-sistemi)
- [Test & Build](#test--build)
- [Deploy](#deploy)

---

## Teknoloji Yığını

| Katman | Teknoloji |
|--------|-----------|
| Framework | Next.js 14 (App Router, TypeScript) |
| ORM | Prisma 5 |
| Veritabanı | PostgreSQL 16 |
| Auth | NextAuth.js v5 (Credentials + JWT) |
| UI | Tailwind CSS 3, Lucide React |
| Paket Yöneticisi | npm |
| Container | Docker + Docker Compose |

---

## Proje Yapısı

```
ders-takip-sistemi/
├── prisma/
│   ├── schema.prisma        # Veri modelleri (11 model, 3 enum)
│   ├── migrations/          # SQL migration geçmişi
│   └── seed.ts              # Demo veri
├── src/
│   ├── app/
│   │   ├── (dashboard)/     # Korumalı rotalar (middleware ile)
│   │   │   ├── dashboard/   # Ana panel
│   │   │   ├── customers/   # Müşteri CRUD + detay + düzenleme
│   │   │   ├── packages/    # Paket tanımları
│   │   │   ├── payments/    # Ödeme listesi + ekleme
│   │   │   └── settings/    # Hesap / İşletme / Webhook ayarları
│   │   ├── api/
│   │   │   ├── auth/        # NextAuth endpoint
│   │   │   ├── packages/    # Paket listeleme API
│   │   │   └── register/    # Stüdyo kayıt API
│   │   ├── login/
│   │   └── register/
│   ├── components/
│   │   ├── customers/       # ProcessLessonButton
│   │   ├── dashboard/       # Widget bileşenleri
│   │   ├── payments/        # AddPaymentModal
│   │   └── shared/          # Sidebar, DashboardShell, Providers, WhatsAppButton
│   ├── lib/
│   │   ├── actions/         # Server Actions (customer, lesson, package, payment, settings)
│   │   ├── auth.ts          # NextAuth konfigürasyonu
│   │   ├── prisma.ts        # Singleton PrismaClient
│   │   ├── utils.ts         # Yardımcı fonksiyonlar, formatters
│   │   └── webhook.ts       # HMAC-SHA256 imzalı webhook sistemi
│   └── middleware.ts         # Rota koruma (auth guard)
├── Dockerfile
├── docker-compose.yml
├── docker-entrypoint.sh
└── .env.docker              # Docker ortam değişkeni şablonu
```

---

## Gereksinimler

### Docker ile kurulum için
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) 24+
- [Docker Compose](https://docs.docker.com/compose/) v2+ (Docker Desktop ile gelir)

### Yerel geliştirme için
- Node.js 20+
- PostgreSQL 16+
- npm 10+

---

## Hızlı Başlangıç (Docker)

En hızlı yol — PostgreSQL dahil tek komutla:

```bash
# 1. Repoyu klonlayın
git clone git@github.com:erdodo/ders-takip-sistemi.git
cd ders-takip-sistemi

# 2. Ortam dosyasını oluşturun
cp .env.docker .env.production

# 3. Güçlü bir secret oluşturun (.env.production içine yapıştırın)
openssl rand -base64 32

# 4. .env.production içini doldurun (gerekli alanlar):
#    POSTGRES_PASSWORD=...
#    NEXTAUTH_SECRET=...      ← yukarıdaki komutun çıktısı
#    NEXTAUTH_URL=http://localhost:3000

# 5. İlk kurulumda demo verilerle birlikte başlatın
SEED_DB=true docker compose --env-file .env.production up -d --build

# Uygulama https://localhost:3000 adresinde çalışır
```

**Demo giriş bilgileri** (SEED_DB=true ile yüklendiğinde):
- E-posta: `demo@zenyoga.com`
- Şifre: `demo123`

**Sonraki başlatmalar** (veriler kalıcıdır):
```bash
docker compose --env-file .env.production up -d
```

**Durdurmak:**
```bash
docker compose down          # Container durdur (veriler korunur)
docker compose down -v       # Container + veritabanı verilerini sil
```

**Logları izlemek:**
```bash
docker compose logs -f app   # Uygulama logları
docker compose logs -f db    # Veritabanı logları
```

---

## Yerel Geliştirme Ortamı

### 1. PostgreSQL kurulumu (macOS)

```bash
brew install postgresql@16
brew services start postgresql@16
createdb ders_takip
```

### 2. Projeyi kurun

```bash
git clone git@github.com:erdodo/ders-takip-sistemi.git
cd ders-takip-sistemi
npm install
```

### 3. Ortam dosyasını hazırlayın

```bash
cp .env.example .env
```

`.env` içini düzenleyin:

```env
DATABASE_URL="postgresql://KULLANICI_ADINIZ@localhost:5432/ders_takip"
NEXTAUTH_SECRET="gelistirme-icin-herhangi-bir-deger"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Veritabanını hazırlayın

```bash
# Migration uygula
npx prisma migrate dev

# Demo verileri yükle
npm run prisma:seed
```

### 5. Geliştirme sunucusunu başlatın

```bash
npm run dev
# → http://localhost:3000
```

---

## Ortam Değişkenleri

| Değişken | Zorunlu | Açıklama |
|----------|---------|----------|
| `DATABASE_URL` | ✅ | PostgreSQL bağlantı URL'i |
| `NEXTAUTH_SECRET` | ✅ | JWT imzalama gizli anahtarı (min 32 karakter) |
| `NEXTAUTH_URL` | ✅ | Uygulamanın tam URL'i (örn: `https://app.domain.com`) |
| `NEXT_PUBLIC_APP_URL` | — | Public app URL'i (NEXTAUTH_URL ile aynı olabilir) |
| `POSTGRES_PASSWORD` | Docker | Docker Compose PostgreSQL şifresi |
| `APP_PORT` | Docker | Host port (varsayılan: `3000`) |
| `SEED_DB` | Docker | `true` ise ilk çalıştırmada demo veriler yüklenir |

> ⚠️ **Üretimde** `NEXTAUTH_SECRET` için mutlaka `openssl rand -base64 32` çıktısını kullanın.

---

## Veritabanı

### Modeller

```
Studio          → Stüdyo (multi-tenant root)
User            → Stüdyo kullanıcıları (OWNER / INSTRUCTOR)
Customer        → Üyeler
Package         → Paket tanımları (10 ders, 20 ders vb.)
CustomerPackage → Müşteri-paket ataması (kontör, süre, ödeme durumu)
Lesson          → İşlenen dersler
Payment         → Ödemeler
WebhookEndpoint → Webhook endpoint tanımları
WebhookLog      → Webhook teslimat geçmişi
```

### Migration komutları

```bash
# Geliştirme: yeni migration oluştur + uygula
npx prisma migrate dev --name degisiklik_aciklamasi

# Üretim: sadece uygula (migration oluşturmaz)
npx prisma migrate deploy

# Prisma Studio (görsel DB yönetimi)
npm run prisma:studio

# Schema'dan client yeniden oluştur
npx prisma generate
```

---

## API ve Server Actions

Uygulama Next.js **Server Actions** kullanır (REST API yoktur, doğrudan server-side fonksiyonlar çağrılır).

| Dosya | İçerik |
|-------|--------|
| `src/lib/actions/customer.actions.ts` | Müşteri CRUD, aktif paket sorgulama |
| `src/lib/actions/lesson.actions.ts` | Ders işleme (kontör düşme, webhook tetikleme) |
| `src/lib/actions/package.actions.ts` | Paket tanımları + müşteriye atama |
| `src/lib/actions/payment.actions.ts` | Ödeme oluşturma + listeleme |
| `src/lib/actions/settings.actions.ts` | Stüdyo/hesap/webhook ayarları |
| `src/app/api/register/route.ts` | Stüdyo + kullanıcı kayıt endpoint |

Her action başında `auth()` ile session doğrulanır ve `studioId` alınır — tenant izolasyonu tüm sorguları kapsar.

---

## Webhook Sistemi

`src/lib/webhook.ts` dosyası HMAC-SHA256 imzalı, fire-and-forget webhook sistemi içerir.

**Desteklenen olaylar:**

| Olay | Tetikleyici |
|------|-------------|
| `lesson.processed` | Ders işlendiğinde |
| `credit.low` | Kalan kontör ≤ 2 olduğunda |
| `payment.created` | Ödeme kaydedildiğinde |
| `customer.created` | Yeni müşteri eklendiğinde |
| `customer.updated` | Müşteri bilgisi güncellendiğinde |
| `package.assigned` | Müşteriye paket atandığında |

**İmza doğrulama (alıcı tarafta):**

```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const expected = 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}

// Express örneği:
app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['x-webhook-signature'];
  if (!verifyWebhook(req.body, sig, process.env.WEBHOOK_SECRET)) {
    return res.sendStatus(401);
  }
  const event = JSON.parse(req.body);
  console.log(event.event, event.data); // lesson.processed, {...}
  res.sendStatus(200);
});
```

**Payload yapısı:**

```json
{
  "event": "lesson.processed",
  "studioId": "clxxx...",
  "timestamp": "2026-02-22T10:00:00.000Z",
  "data": {
    "customerPackageId": "clyyy...",
    "remainingCredits": 3
  }
}
```

---

## Test & Build

```bash
# TypeScript tip kontrolü
npx tsc --noEmit

# Production build (yerel)
npm run build

# Production build'i çalıştır
npm start

# Lint
npm run lint
```

---

## Deploy

### Docker Compose (VPS / Sunucu)

```bash
# Sunucuya kopyala
scp -r . user@sunucu:/opt/ders-takip

# Sunucuda
cd /opt/ders-takip
cp .env.docker .env.production
nano .env.production   # değerleri girin
docker compose --env-file .env.production up -d --build
```

### Nginx Reverse Proxy (opsiyonel)

```nginx
server {
    listen 80;
    server_name app.domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Katkı

1. Bu repoyu fork edin
2. Feature branch oluşturun: `git checkout -b feature/yeni-ozellik`
3. Değişikliklerinizi commit edin: `git commit -m 'feat: yeni özellik ekle'`
4. Branch'inizi push edin: `git push origin feature/yeni-ozellik`
5. Pull Request açın

---

## Lisans

MIT © 2026
