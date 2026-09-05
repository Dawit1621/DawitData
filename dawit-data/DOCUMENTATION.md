# Dawit Data — System Documentation

**Version:** 1.0  
**Author:** Dawit  
**Email:** dawitassisstant@gmail.com  
**Purpose:** Core business system for data entry & analysis freelance services

---

## 1. Overview

This system is the operational foundation of the freelance business.  
It is not a portfolio demo. It is a working tool used to:

- Present services professionally (English + Amharic)
- Capture client inquiries
- Store and manage leads
- Track pipeline status
- Support daily operations

The design priority is **simplicity + reliability + easy maintenance** by a single person.

---

## 2. Technology Stack (Frameworks & Libraries)

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** (≥ 18) | Runtime |
| **Express.js** | Web framework / REST API |
| **dotenv** | Environment variables |
| **helmet** | Basic security headers |
| **cors** | Cross-origin support |
| **express-rate-limit** | Protect contact form from spam |
| **morgan** | Request logging |
| **uuid** | Unique lead IDs |

**No heavy frameworks** (no NestJS, no Next.js, no Django).  
Express was chosen because it is lightweight, battle-tested, and easy to maintain alone.

### Frontend
| Technology | Purpose |
|------------|---------|
| **Vanilla HTML + CSS + JavaScript** | Landing page & Admin UI |
| **No React / Vue / Angular** | Intentionally kept simple |

Reasons for vanilla frontend:
- Faster load time
- No build step required
- Easier to edit content
- Lower maintenance cost
- Perfect for a service business landing page

### Database
| Technology | Purpose |
|------------|---------|
| **JSON file** (`data/leads.json`) | Mini database |

This is a deliberate starting choice:
- Zero configuration
- No native dependencies
- Easy to backup
- Easy to migrate later to PostgreSQL / SQLite when volume grows

### Authentication
Simple **Bearer token** authentication for the admin dashboard.  
Token is set in the `.env` file (`ADMIN_TOKEN`).

---

## 3. Project Structure

```
dawit-data/
├── public/                  # Public-facing website
│   └── index.html           # Bilingual landing page (EN + AM)
│
├── admin/                   # Private admin interface
│   └── index.html           # Lead management dashboard
│
├── src/
│   └── server.js            # Express server + all REST routes
│
├── data/                    # Database storage (auto-created)
│   └── leads.json           # All client inquiries live here
│
├── .env.example             # Environment variable template
├── .gitignore
├── package.json
├── README.md                # Quick start guide
└── DOCUMENTATION.md         # This file
```

---

## 4. How the System Works

### 4.1 Public Landing Page (`public/index.html`)

- Fully bilingual (English ↔ Amharic)
- Language preference is saved in `localStorage`
- Contact form submits data to `POST /api/leads`
- After successful submission, the lead is saved in the database
- No page reload required (AJAX)

### 4.2 Backend Server (`src/server.js`)

Responsibilities:
- Serve static files (landing page + admin)
- Handle form submissions
- Protect admin routes
- Read / write the JSON database
- Provide REST API

### 4.3 Database (`data/leads.json`)

Structure of each lead:

```json
{
  "id": "uuid-string",
  "name": "Client Name",
  "email": "client@email.com",
  "service": "Data Analysis",
  "budget": "$300 – $500",
  "message": "Project details...",
  "status": "new",
  "source": "website",
  "language": "en",
  "notes": null,
  "created_at": "2026-09-05T08:30:00.000Z",
  "updated_at": "2026-09-05T08:30:00.000Z"
}
```

**Possible status values:**
- `new`
- `contacted`
- `quoted`
- `won`
- `lost`

### 4.4 Admin Dashboard (`/admin`)

- Protected by `ADMIN_TOKEN`
- Shows statistics (total, new, contacted, quoted, won, lost)
- Lists all leads with filters
- Allows changing lead status
- Shows full message details

---

## 5. REST API Reference

### Public Endpoint

#### `POST /api/leads`
Creates a new lead from the contact form.

**Body example:**
```json
{
  "name": "John Smith",
  "email": "john@company.com",
  "service": "Data Analysis",
  "budget": "$300 – $500",
  "message": "I need help cleaning sales data...",
  "language": "en",
  "source": "website"
}
```

**Success response (201):**
```json
{
  "success": true,
  "message": "Project request received. You will be contacted shortly.",
  "id": "uuid-here"
}
```

---

### Admin Endpoints
All admin endpoints require header:

```
Authorization: Bearer YOUR_ADMIN_TOKEN
```

#### `GET /api/admin/leads`
List leads.  
Optional query: `?status=new`

#### `GET /api/admin/leads/:id`
Get one lead by ID.

#### `PATCH /api/admin/leads/:id`
Update status or notes.

**Body example:**
```json
{
  "status": "contacted",
  "notes": "Called the client on 5 Sept"
}
```

#### `GET /api/admin/stats`
Returns counts for the dashboard.

---

## 6. Environment Variables

Create a `.env` file from `.env.example`:

```env
PORT=3000
NODE_ENV=production
ADMIN_TOKEN=your_long_random_secret_at_least_32_characters
```

**Critical:**  
Change `ADMIN_TOKEN` before deploying. This is the only protection for the admin dashboard.

---

## 7. How to Run Locally

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env and set a strong ADMIN_TOKEN

# Start the server
npm start
```

- Website → http://localhost:3000  
- Admin → http://localhost:3000/admin  

---

## 8. Deployment Recommendations

### Recommended platforms
1. **Render.com** (free tier available)
2. **Railway**
3. Small VPS (Hetzner / DigitalOcean) + PM2

### Important deployment notes
- The folder `data/` must be **persistent** (otherwise leads are lost on restart)
- Never commit `.env` or `data/leads.json` to GitHub
- Always backup `data/leads.json`

---

## 9. Design Decisions (Why it was built this way)

| Decision | Reason |
|----------|--------|
| Express instead of NestJS / Fastify | Simple, widely known, easy to maintain alone |
| Vanilla HTML/JS instead of React | No build step, faster, lower complexity |
| JSON file instead of SQLite/Postgres at start | Zero friction, easy backup, can migrate later |
| Bearer token instead of full auth system | Enough protection for a solo business system |
| Bilingual support | Reach both English and Amharic speaking clients |

These choices prioritize **speed of development**, **low maintenance**, and **reliability** for a one-person business.

---

## 10. Future Growth Path

When the business grows, the system can be upgraded in this order:

1. Move from JSON → PostgreSQL (Supabase / Neon / Railway)
2. Add email notification when a new lead arrives
3. Add more detailed notes and follow-up dates
4. Add source tracking improvements (Upwork, LinkedIn, Referral)
5. Optional: Client portal later

The current architecture is intentionally simple so it can be evolved without rewriting everything.

---

## 11. Security Notes

- Keep `ADMIN_TOKEN` long and secret
- Do not expose the `/admin` page publicly without the token
- Rate limiting is already active on the contact form
- Regularly backup `data/leads.json`
- Never commit secrets to Git

---

## 12. Summary

**Framework used:**  
- Backend → **Express.js** (Node.js)  
- Frontend → **Vanilla HTML / CSS / JavaScript**  
- Database → **JSON file store**

This system is built to be:
- Easy to understand
- Easy to maintain by one person
- Reliable enough to run as a real revenue tool
- Ready for GitHub, Upwork, and LinkedIn presentation

It is the operational backbone of the freelance business.
EOF
