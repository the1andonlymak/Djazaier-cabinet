// Admin + Gallery API server for Vite React app (Prisma + MySQL)
// Authentication: HttpOnly JWT cookie (1 day) after verifying admin email + bcrypt-hashed password in MySQL (via Prisma ORM).
// Storage: Images stored as Bytes (LONGBLOB) in MySQL with metadata. Served via /api/image/:id.
// Endpoints:
//  - POST   /api/login            { email, password }
//  - POST   /api/logout           clears cookie
//  - GET    /api/me               returns { authenticated: boolean }
//  - GET    /api/gallery          list images (createdAt desc)
//  - POST   /api/gallery          multipart/form-data: file, caption_fr
//  - PATCH  /api/gallery          { public_id, caption_fr }
//  - DELETE /api/gallery          { public_id }
//  - GET    /api/image/:id        streams image binary

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import ExcelJS from 'exceljs';

// Environment
const {
  ADMIN_PASSWORD,
  ADMIN_EMAIL ,
  JWT_SECRET,
  CORS_ORIGINS = 'https://djazaier-cabinet.vercel.app',
  PORT = 3001,
  NODE_ENV,
  DATABASE_URL,
} = process.env;

if (!JWT_SECRET) {
  console.warn('[WARN] JWT_SECRET is required. Set it in server/.env or environment');
}
if (!DATABASE_URL) {
  console.warn('[WARN] DATABASE_URL is required for Prisma to connect to MySQL');
}

// Prisma client
const prisma = new PrismaClient();

async function initDb() {
  // Seed admin if empty
  const count = await prisma.adminUser.count();
  if (count === 0) {
    if (ADMIN_PASSWORD) {
      const hash = await bcrypt.hash(ADMIN_PASSWORD, 12);
      await prisma.adminUser.create({ data: { email: ADMIN_EMAIL, passwordHash: hash } });
      console.log('[INIT] Admin user seeded with email', ADMIN_EMAIL);
    } else {
      console.warn('[WARN] No admin user exists and ADMIN_PASSWORD not provided. Set ADMIN_EMAIL and ADMIN_PASSWORD in env to seed.');
    }
  }
}
await initDb();

const app = express();

// CORS with credentials. In production, set CORS_ORIGINS to a comma-separated list of allowed origins.
const allowedOrigins = ['https://djazaier-cabinet.vercel.app'];
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // same-origin or curl
    if (allowedOrigins.length === 0) return cb(null, true); // dev: allow all
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS: ' + origin));
  },
  credentials: true,
}));
console.log('[CORS] Allowed origins:', allowedOrigins);


app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));

// Rate limiting (basic)
const limiter = rateLimit({ windowMs: 60_000, max: 100 });
app.use('/api/', limiter);

// JWT cookie helpers
const oneDayMs = 24 * 60 * 60 * 1000;
const cookieName = 'token';
const cookieOptions = {
  httpOnly: true,
  sameSite: 'none',
  secure: true,
  maxAge: oneDayMs,
  path: '/',
};

function signAdminToken() {
  return jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '1d' });
}

function verifyToken(token) {
  try { return jwt.verify(token, JWT_SECRET); } catch { return null; }
}

function requireAuth(req, res, next) {
  const token = req.cookies[cookieName];
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: 'Invalid token' });
  next();
}

// Multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only JPG/PNG/WebP allowed'));
  },
});

// Auth routes
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const user = await prisma.adminUser.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const token = signAdminToken();
  res.cookie(cookieName, token, cookieOptions);
  return res.json({ ok: true });
});

app.post('/api/logout', (req, res) => {
  res.clearCookie(cookieName, { ...cookieOptions, maxAge: 0 });
  return res.json({ ok: true });
});

app.get('/api/me', (req, res) => {
  const token = req.cookies[cookieName];
  const payload = token ? verifyToken(token) : null;
  return res.json({ authenticated: Boolean(payload) });
});

// Gallery routes (Prisma + MySQL)
app.get('/api/gallery', async (req, res) => {
  try {
    const rows = await prisma.image.findMany({
      select: { id: true, titleFr: true, captionFr: true, createdAt: true },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });
    const items = rows.map(r => ({
      public_id: String(r.id),
      secure_url: `/api/image/${r.id}`,
      title_fr: r.titleFr || '',
      caption_fr: r.captionFr || '',
      created_at: r.createdAt,
    }));
    res.json({ items });
  } catch (e) {
    console.error('List error', e);
    res.status(500).json({ error: 'Failed to list images' });
  }
});

app.get('/api/image/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).send('Invalid id');
    const img = await prisma.image.findUnique({ where: { id }, select: { mime: true, data: true } });
    if (!img) return res.status(404).send('Not found');
    res.setHeader('Content-Type', img.mime);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.send(Buffer.from(img.data));
  } catch (e) {
    console.error('Image error', e);
    res.status(500).send('Server error');
  }
});

app.post('/api/gallery', requireAuth, upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const { caption_fr = '', title_fr = '' } = req.body || {};
    if (!file) return res.status(400).json({ error: 'File required' });

    const created = await prisma.image.create({
      data: { mime: file.mimetype, data: file.buffer, titleFr: title_fr, captionFr: caption_fr },
      select: { id: true },
    });

    const id = created.id;
    return res.json({
      public_id: String(id),
      secure_url: `/api/image/${id}`,
      caption_fr,
    });
  } catch (e) {
    console.error('Upload error', e);
    res.status(500).json({ error: 'Upload failed' });
  }
});

app.patch('/api/gallery', requireAuth, async (req, res) => {
  try {
    const { public_id, caption_fr, title_fr } = req.body || {};
    const id = Number(public_id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'public_id required' });
    const data = {};
    if (typeof caption_fr === 'string') data.captionFr = caption_fr;
    if (typeof title_fr === 'string') data.titleFr = title_fr;
    await prisma.image.update({ where: { id }, data });
    return res.json({ ok: true });
  } catch (e) {
    console.error('Caption update error', e);
    res.status(500).json({ error: 'Failed to update caption' });
  }
});

app.delete('/api/gallery', requireAuth, async (req, res) => {
  try {
    const { public_id } = req.body || {};
    const id = Number(public_id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'public_id required' });
    await prisma.image.delete({ where: { id } });
    return res.json({ ok: true });
  } catch (e) {
    console.error('Delete error', e);
    res.status(500).json({ error: 'Failed to delete' });
  }
});

// Appointments routes
app.post('/api/appointments', async (req, res) => {
  try {
    const { firstName, lastName, birthDate, appointmentDate, firstTime, phone } = req.body || {};
    if (!firstName || !lastName || !birthDate || !appointmentDate || !phone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const firstTimeBool = typeof firstTime === 'string' ? firstTime.toLowerCase() === 'oui' : Boolean(firstTime);
    const created = await prisma.appointment.create({
      data: {
        firstName,
        lastName,
        birthDate: new Date(birthDate),
        appointmentDate: new Date(appointmentDate),
        firstTime: firstTimeBool,
        phone,
      },
    });
    return res.json({ id: created.id });
  } catch (e) {
    console.error('Create appointment error', e);
    return res.status(500).json({ error: 'Failed to create appointment' });
  }
});

app.get('/api/appointments', requireAuth, async (req, res) => {
  try {
    const items = await prisma.appointment.findMany({ orderBy: [{ createdAt: 'desc' }, { id: 'desc' }] });
    return res.json({ items });
  } catch (e) {
    console.error('List appointments error', e);
    return res.status(500).json({ error: 'Failed to list appointments' });
  }
});

app.patch('/api/appointments/:id', requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });
    const { status } = req.body || {};
    if (!['PENDING', 'DONE'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
    await prisma.appointment.update({ where: { id }, data: { status } });
    return res.json({ ok: true });
  } catch (e) {
    console.error('Update appointment error', e);
    return res.status(500).json({ error: 'Failed to update appointment' });
  }
});

app.get('/api/appointments/export', requireAuth, async (req, res) => {
  try {
    const rows = await prisma.appointment.findMany({ orderBy: [{ createdAt: 'desc' }, { id: 'desc' }] });
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Appointments');
    ws.columns = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Created At', key: 'createdAt', width: 20 },
      { header: 'First Name', key: 'firstName', width: 16 },
      { header: 'Last Name', key: 'lastName', width: 16 },
      { header: 'Birth Date', key: 'birthDate', width: 16 },
      { header: 'Appointment Date', key: 'appointmentDate', width: 20 },
      { header: 'First Time', key: 'firstTime', width: 12 },
      { header: 'Phone', key: 'phone', width: 18 },
      { header: 'Status', key: 'status', width: 12 },
    ];
    for (const r of rows) {
      ws.addRow({
        id: r.id,
        createdAt: r.createdAt.toISOString(),
        firstName: r.firstName,
        lastName: r.lastName,
        birthDate: r.birthDate.toISOString().slice(0,10),
        appointmentDate: r.appointmentDate.toISOString().slice(0,10),
        firstTime: r.firstTime ? 'oui' : 'non',
        phone: r.phone,
        status: r.status,
      });
    }
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="appointments.xlsx"');
    await wb.xlsx.write(res);
    res.end();
  } catch (e) {
    console.error('Export appointments error', e);
    return res.status(500).json({ error: 'Failed to export appointments' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ API server listening on port ${PORT}`);
});
