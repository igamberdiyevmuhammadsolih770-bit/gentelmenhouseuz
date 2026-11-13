# Gentleman House

Erkaklar kiyimlari onlayn doʻkoni: sayt, admin panel, Telegram botlar (savdo + texnik monitoring), AI chek tekshiruvi va AI maslahatchi.

## Ikki xil ishga tushirish

### 1. Kompyuterda (lokal)
```
node server.js        # yoki start.bat ni ikki marta bosing
```
Sayt: http://localhost:3000 • Admin: http://localhost:3000/admin
Maʼlumotlar `data/` papkasida saqlanadi (GitHub'ga yuklanmaydi).

### 2. Vercel'da (internetda)
Vercel serverless boʻlgani uchun:
- **baza** — Upstash Redis (`KV_REST_API_URL`, `KV_REST_API_TOKEN`)
- **rasmlar, videolar, cheklar** — Vercel Blob (`BLOB_READ_WRITE_TOKEN`)
- **Telegram botlar** — webhook orqali (avtomatik sozlanadi)
- **tizim tekshiruvi** — admin panel ochilganda + har kuni (Vercel Cron)

Sozlash:
1. Vercel → *Add New Project* → shu GitHub repo'ni import qiling (Framework: **Other**).
2. *Storage* boʻlimida **Blob** va **Upstash for Redis** yarating va loyihaga ulang (env oʻzgaruvchilar avtomatik qoʻshiladi).
3. *Redeploy* qiling. Admin: `/admin` (login va parol lokaldagi bilan bir xil boʻladi, agar baza koʻchirilgan boʻlsa).

Maxfiy maʼlumotlar (bot tokenlari, Gemini kaliti, Google sozlamalari) kodda emas — admin panel → Sozlamalar orqali kiritiladi va bazada saqlanadi.
