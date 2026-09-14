# Dawit Data — Freelance Business System

> **Full system documentation:** See [`DOCUMENTATION.md`](./DOCUMENTATION.md)

Professional data entry & analysis services platform.  
This is the core system for managing client inquiries and presenting services.

**Author:** Dawit Biru  
**Email:** dawitassisstant@gmail.com

---

## What This System Includes

| Component | Description |
|-----------|-------------|
| **Public Landing Page** | Bilingual (English + Amharic), conversion-focused |
| **Contact Form** | Saves leads directly into the database |
| **REST API** | Clean endpoints for leads |
| **Mini Database** | JSON file based — simple, reliable, grows with you |
| **Admin Dashboard** | View leads, change status, track pipeline |
| **Security basics** | Rate limiting, helmet, token auth |

This is designed as a real revenue system — not a demo.

---

## Project Structure

```
dawit-data/
├── public/               # Frontend (landing page)
│   └── index.html
├── admin/                # Admin dashboard
│   └── index.html
├── src/
│   └── server.js         # Express server + REST API
├── data/                 # Database file (created automatically)
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── DOCUMENTATION.md
```

---

## Quick Start (Local)

```bash
# 1. Install dependencies
npm install

# 2. Create environment file
cp .env.example .env

# 3. Edit .env — set a strong ADMIN_TOKEN
# Example:
# ADMIN_TOKEN=your_long_random_secret_here_32chars_minimum

# 4. Start server
npm start
```

- Landing page: http://localhost:3000  
- Admin dashboard: http://localhost:3000/admin  

Login to admin using the `ADMIN_TOKEN` you set in `.env`.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Default 3000 |
| `ADMIN_TOKEN` | **Yes** | Secret token for admin access (32+ chars recommended) |
| `NODE_ENV` | No | `production` / `development` |

**Important:** Change `ADMIN_TOKEN` to a long random string before going live.

---

## API Endpoints

### Public
- `POST /api/leads` — Submit a new project request

### Admin (requires `Authorization: Bearer <ADMIN_TOKEN>`)
- `GET /api/admin/leads` — List leads (optional `?status=new`)
- `GET /api/admin/leads/:id` — Single lead
- `PATCH /api/admin/leads/:id` — Update status or notes
- `GET /api/admin/stats` — Dashboard numbers

---

## Lead Status Flow

```
new → contacted → quoted → won
                       ↘ lost
```

Use the admin dashboard to move leads through this pipeline.

---

## Deployment Options (Recommended)

### Option 1: Render.com (easiest free tier)
1. Push this repo to GitHub
2. Create a new **Web Service** on Render
3. Connect the repo
4. Set environment variables (`ADMIN_TOKEN`, etc.)
5. Build command: `npm install`
6. Start command: `npm start`

**Important for Render:** Add a persistent disk for the `/data` folder so leads are not lost on restart.

### Option 2: Railway / Fly.io
Same process — Node.js app. Make sure the `data/` folder is persisted.

### Option 3: VPS (DigitalOcean, Hetzner, etc.)
- Install Node.js 18+
- Use PM2: `pm2 start src/server.js --name dawit-data`
- Point domain + Nginx reverse proxy
- Keep `data/` folder backed up regularly

**Backup:** The file `data/leads.json` contains all your client inquiries. Back it up.

---

## For Upwork / LinkedIn / GitHub

This project is suitable to show as:

- A real business system you built and operate
- Evidence of full-stack capability (Node.js + REST + frontend)
- Bilingual product experience (English + Amharic)
- Practical product thinking (lead management for a service business)

Suggested GitHub description:
> Lead management + bilingual landing page for a data entry & analysis freelance business. Node.js, Express, simple admin dashboard.

---

## Future Growth Path

When volume grows:

1. Move from JSON file to PostgreSQL (Supabase, Neon, or Railway)
2. Add email notifications on new leads (Resend / Nodemailer)
3. Add more fields / tags for better pipeline tracking
4. Client portal later if needed

The current structure is intentionally simple so you can maintain it alone while it generates income.

---

## Security Notes

- Never commit `.env` or the `data/` folder
- Use a strong `ADMIN_TOKEN` (minimum 32 random characters)
- Keep rate limiting on the public form
- Regularly backup `data/leads.json`

---

## License

Private / UNLICENSED — this is a personal business system.
