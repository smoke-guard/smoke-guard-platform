# smoke-guard-platform

Web platform của SmokeGuard: Node.js + Express + PostgreSQL + EJS.

## Chạy trên máy

1. Copy `.env.example` thành `.env`, điền tài khoản database vàoo.
2. Bật database:
   ```bash
   docker compose up -d
   ```
3. Cài thư viện và chạy:
   ```bash
   npm install
   npm run dev
   ```
4. Mở http://localhost:3000/health, thấy `"status": "ok"` là chạy được
