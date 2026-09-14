/**
 * Dawit Data — Backend Server
 * Simple, reliable REST API + static file serving
 * Designed as a serious freelance business operation system
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- Simple JSON Database ----------
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'leads.json');

function readLeads() {
  try {
    if (!fs.existsSync(dbPath)) {
      fs.writeFileSync(dbPath, JSON.stringify({ leads: [] }, null, 2));
    }
    const raw = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('DB read error:', err.message);
    return { leads: [] };
  }
}

function writeLeads(data) {
  // Atomic-ish write: write temp then rename to reduce corruption risk
  const tmp = dbPath + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, dbPath);
}

// ---------- Security & Middleware ----------
app.use(
  helmet({
    contentSecurityPolicy: false // allow inline styles/scripts used by the static pages
  })
);
app.use(cors());
app.use(express.json({ limit: '32kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' }
});

function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = process.env.ADMIN_TOKEN;

  if (!token || token === 'change_me_to_a_long_random_secret_at_least_32_chars') {
    console.warn('WARNING: ADMIN_TOKEN is missing or still the example value. Set a strong token in .env');
  }

  const expected = token || 'change_me_immediately';
  if (authHeader !== `Bearer ${expected}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// ---------- Static Files ----------
app.use(express.static(path.join(__dirname, '..', 'public')));

// ---------- Public API ----------
app.post('/api/leads', formLimiter, (req, res) => {
  try {
    const { name, email, service, budget, message, language, source } = req.body || {};

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email and message are required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(email).trim())) {
      return res.status(400).json({ error: 'Invalid email address.' });
    }

    const db = readLeads();
    const now = new Date().toISOString();

    const lead = {
      id: uuidv4(),
      name: String(name).trim().slice(0, 200),
      email: String(email).trim().toLowerCase().slice(0, 254),
      service: service ? String(service).trim().slice(0, 100) : null,
      budget: budget ? String(budget).trim().slice(0, 50) : null,
      message: String(message).trim().slice(0, 5000),
      status: 'new',
      source: source ? String(source).trim().slice(0, 50) : 'website',
      language: language === 'am' ? 'am' : 'en',
      notes: null,
      created_at: now,
      updated_at: now
    };

    db.leads = db.leads || [];
    db.leads.unshift(lead);
    writeLeads(db);

    res.status(201).json({
      success: true,
      message: 'Project request received. You will be contacted shortly.',
      id: lead.id
    });
  } catch (err) {
    console.error('Error saving lead:', err.message);
    res.status(500).json({ error: 'Server error. Please try again or email directly.' });
  }
});

// ---------- Admin API ----------
app.get('/api/admin/leads', requireAdmin, (req, res) => {
  try {
    const { status, limit = 100 } = req.query;
    const db = readLeads();
    let leads = db.leads || [];

    if (status) {
      leads = leads.filter((l) => l.status === status);
    }

    const max = Math.min(Math.max(Number(limit) || 100, 1), 500);
    leads = leads.slice(0, max);

    res.json({ success: true, total: leads.length, leads });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

app.get('/api/admin/leads/:id', requireAdmin, (req, res) => {
  try {
    const db = readLeads();
    const lead = (db.leads || []).find((l) => l.id === req.params.id);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    res.json({ success: true, lead });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to fetch lead' });
  }
});

app.patch('/api/admin/leads/:id', requireAdmin, (req, res) => {
  try {
    const { status, notes } = req.body || {};
    const allowed = ['new', 'contacted', 'quoted', 'won', 'lost'];

    if (status && !allowed.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const db = readLeads();
    const index = (db.leads || []).findIndex((l) => l.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Lead not found' });

    if (status) db.leads[index].status = status;
    if (notes !== undefined) {
      db.leads[index].notes = notes === null || notes === '' ? null : String(notes).slice(0, 2000);
    }
    db.leads[index].updated_at = new Date().toISOString();

    writeLeads(db);
    res.json({ success: true, lead: db.leads[index] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Update failed' });
  }
});

app.get('/api/admin/stats', requireAdmin, (req, res) => {
  try {
    const db = readLeads();
    const leads = db.leads || [];

    const stats = {
      total: leads.length,
      new: leads.filter((l) => l.status === 'new').length,
      contacted: leads.filter((l) => l.status === 'contacted').length,
      quoted: leads.filter((l) => l.status === 'quoted').length,
      won: leads.filter((l) => l.status === 'won').length,
      lost: leads.filter((l) => l.status === 'lost').length
    };

    res.json({ success: true, stats });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Stats failed' });
  }
});

// ---------- Admin UI ----------
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'admin', 'index.html'));
});

app.get('/admin/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'admin', 'index.html'));
});

// ---------- Fallback ----------
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// ---------- Start ----------
app.listen(PORT, () => {
  console.log(`Dawit Data server running on port ${PORT}`);
  console.log(`Landing page : http://localhost:${PORT}`);
  console.log(`Admin        : http://localhost:${PORT}/admin`);
  if (!process.env.ADMIN_TOKEN || process.env.ADMIN_TOKEN.length < 16) {
    console.warn('⚠  Set a strong ADMIN_TOKEN in .env before going live.');
  }
});
