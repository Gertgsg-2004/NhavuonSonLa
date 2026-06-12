# 07 — Triển khai & vận hành

## 1. Môi trường

| Môi trường | Hạ tầng | Mục đích |
|---|---|---|
| **Dev** | `docker compose up -d` (Postgres/Redis/MinIO) + `pnpm dev:*` | Phát triển cục bộ |
| **Staging** | VPS nhỏ (2 vCPU/4GB), domain `staging.…` chặn index | Khách hàng nội bộ duyệt trước |
| **Production** | VPS 4 vCPU/8GB (DigitalOcean/AWS Lightsail/Viettel Cloud…) + Cloudflare | Vận hành thật |

## 2. Topology production (1 VPS, Docker Compose)

```
Cloudflare (DNS, CDN, WAF, SSL edge)
   └── Nginx (container) :80/:443
         ├── nhavuonsonla.vn        → web (Next.js, node server) :3000
         ├── api.nhavuonsonla.vn    → api (NestJS) :3001
         └── /minio  (nội bộ)       → minio :9000
   Volumes: pgdata, redisdata, miniodata
   Containers: postgres:16, redis:7, minio, api, web, nginx
```

Nginx mẫu (rút gọn):

```nginx
server {
  listen 443 ssl http2;
  server_name nhavuonsonla.vn;
  ssl_certificate     /etc/letsencrypt/live/nhavuonsonla.vn/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/nhavuonsonla.vn/privkey.pem;
  gzip on; gzip_types text/css application/javascript application/json image/svg+xml;

  location /_next/static/ { proxy_pass http://web:3000; expires 365d; add_header Cache-Control "public, immutable"; }
  location / { proxy_pass http://web:3000; proxy_set_header Host $host; proxy_set_header X-Real-IP $remote_addr; }
}
server {
  listen 443 ssl http2;
  server_name api.nhavuonsonla.vn;
  client_max_body_size 20m;          # upload ảnh/PDF
  location / { proxy_pass http://api:3001; proxy_set_header Host $host; }
}
```

## 3. Dockerfile (multi-stage, chuẩn cho cả 2 app)

```dockerfile
# apps/api/Dockerfile
FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/api/package.json apps/api/
RUN pnpm install --frozen-lockfile --filter @nhavuon/api...

FROM deps AS build
COPY apps/api apps/api
RUN pnpm --filter @nhavuon/api prisma:generate && pnpm --filter @nhavuon/api build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY apps/api/prisma ./prisma
EXPOSE 3001
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
```

(`apps/web/Dockerfile` tương tự với `next build` + `output: 'standalone'`.)

## 4. CI/CD — GitHub Actions

- **CI** (mỗi PR/push): `pnpm install` → `typecheck` → `build` → (GĐ2: unit test + `prisma migrate diff` kiểm tra schema). File: `.github/workflows/ci.yml` (đã có trong repo).
- **CD** (push tag `v*` hoặc merge `main`):
  1. Build 2 image Docker, đẩy lên GHCR (`ghcr.io/<org>/nhavuon-api`, `…-web`).
  2. SSH vào VPS → `docker compose pull && docker compose up -d` → `prisma migrate deploy` chạy trong entrypoint.
  3. Healthcheck `/api/v1/health` — fail thì `docker compose rollback` (giữ image cũ bằng tag).
- Secrets cần khai báo: `VPS_HOST`, `VPS_SSH_KEY`, `GHCR_TOKEN`, toàn bộ biến `.env` production.

## 5. Vận hành

| Hạng mục | Cách làm |
|---|---|
| Giám sát uptime | UptimeRobot/BetterStack ping `/health` + trang chủ, báo qua Telegram |
| Log | pino JSON → `docker logs` + Loki (tùy chọn); giữ 14 ngày |
| Lỗi runtime | Sentry (frontend + backend) gói miễn phí |
| Backup | Cron 02:00 `pg_dump` → S3 (xem docs/06 §5) |
| SSL | certbot renew tự động (hoặc Cloudflare Origin Cert) |
| Cập nhật | Dependabot bật cho cả 2 app; vá bảo mật hằng tháng |
| Tài nguyên | cAdvisor/`docker stats`; cảnh báo đĩa > 80% |

## 6. Checklist go-live

- [ ] Đổi toàn bộ secret mặc định (`JWT_*`, mật khẩu DB, MinIO)
- [ ] Bật 2FA cho tài khoản admin; xóa tài khoản seed mẫu
- [ ] Cloudflare: bật proxy, Full(Strict), cache static, WAF rule cơ bản
- [ ] `robots.txt` production cho phép index; staging chặn
- [ ] Khai báo Google Search Console + gửi sitemap; Google Business Profile cho nhà vườn
- [ ] Kiểm tra Lighthouse ≥ 90 SEO/Best practices; thử tải trang trên 3G
- [ ] Thử quy trình: gửi báo giá → nhận email/Zalo → chuyển đơn → trừ kho → hoàn thành
- [ ] Thử khôi phục backup vào staging
