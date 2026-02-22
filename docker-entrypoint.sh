#!/bin/sh
set -e

echo "⏳  Veritabanı bağlantısı bekleniyor..."

# PostgreSQL hazır olana kadar bekle (healthcheck zaten bunu yapıyor ama ekstra güvence)
until node -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.\$connect().then(() => { p.\$disconnect(); process.exit(0); }).catch(() => process.exit(1));
" 2>/dev/null; do
  echo "   Veritabanı henüz hazır değil, 2 saniye bekleniyor..."
  sleep 2
done

echo "✅  Veritabanına bağlanıldı."

echo "🔄  Migration'lar uygulanıyor..."
npx prisma migrate deploy
echo "✅  Migration'lar tamamlandı."

# Demo veri yükleme (SEED_DB=true ise)
if [ "${SEED_DB}" = "true" ]; then
  echo "🌱  Demo veriler yükleniyor..."
  npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
  echo "✅  Demo veriler yüklendi."
fi

echo "🚀  Uygulama başlatılıyor..."
exec npx next start
