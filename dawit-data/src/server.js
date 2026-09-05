/**
 * Dawit Data - Backend Server
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
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, 'leads.json');

function readLeads() {
  try {
    if (!fs.existsSync(dbPath)) {
      fs.writeFileSync(dbPath, JSON.stringify({ leads: [] }, null, 2));
    }
    const raw = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('DB read error:', err);
    return { leads: [] };
  }
}

function writeLeads(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

// ---------- Security & Middleware ----------
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: '32kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  message: { error: 'Too many requests. Please try again later.' }
});

function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = process.env.ADMIN_TOKEN || 'change_me_immediately';

  if (!authHeader || authHeader !== `Bearer ${token}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// ---------- Static Files ----------
app.use(express.static(path.join(__dirname, '..', 'public')));

// ---------- Public API ----------
app.post('/api/leads', formLimiter, (req, res) => {
  try {
    const { name, email, service, budget, message, language, source } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email and message are required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address.' });
    }

    const db = readLeads();
    const now = new Date().toISOString();

    const lead = {
      id: uuidv4(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      service: service || null,
      budget: budget || null,
      message: message.trim(),
      status: 'new',
      source: source || 'website',
      language: language || 'en',
      notes: null,
      created_at: now,
      updated_at: now
    };

    db.leads.unshift(lead);
    writeLeads(db);

    res.status(201).json({
      success: true,
      message: 'Project request received. You will be contacted shortly.',
      id: lead.id
    });
  } catch (err) {
    console.error('Error saving lead:', err);
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
      leads = leads.filter(l => l.status === status);
    }

    leads = leads.slice(0, Number(limit));

    res.json({ success: true, total: leads.length, leads });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

app.get('/api/admin/leads/:id', requireAdmin, (req, res) => {
  const db = readLeads();
  const lead = (db.leads || []).find(l => l.id === req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found' });
  res.json({ success: true, lead });
});

app.patch('/api/admin/leads/:id', requireAdmin, (req, res) => {
  try {
    const { status, notes } = req.body;
    const allowed = ['new', 'contacted', 'quoted', 'won', 'lost'];

    if (status && !allowed.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const db = readLeads();
    const index = (db.leads || []).findIndex(l => l.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Lead not found' });

    if (status) db.leads[index].status = status;
    if (notes !== undefined) db.leads[index].notes = notes;
    db.leads[index].updated_at = new Date().toISOString();

    writeLeads(db);
    res.json({ success: true, lead: db.leads[index] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Update failed' });
  }
});

app.get('/api/admin/stats', requireAdmin, (req, res) => {
  try {
    const db = readLeads();
    const leads = db.leads || [];

    const stats = {
      total: leads.length,
      new: leads.filter(l => l.status === 'new').length,
      contacted: leads.filter(l => l.status === 'contacted').length,
      quoted: leads.filter(l => l.status === 'quoted').length,
      won: leads.filter(l => l.status === 'won').length,
      lost: leads.filter(l => l.status === 'lost').length
    };

    res.json({ success: true, stats });
  } catch (err) {
    res.status(500).json({ error: 'Stats failed' });
  }
});

// ---------- Admin UI ----------
app.get('/admin', (req, res) => {
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
});
