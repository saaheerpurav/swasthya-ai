'use strict';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { attachSession } = require('./middleware/auth');
const { error } = require('./utils/response');

const app = express();

// Trust reverse proxies (ngrok, AWS ALB, etc.) so rate-limiter reads real IP
app.set('trust proxy', 1);

// ─── Security & Logging ────────────────────────────────────────────────────────

app.use(helmet());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ─── CORS ──────────────────────────────────────────────────────────────────────

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.WEB_ORIGIN,
].filter(Boolean);

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  }),
);

// ─── Rate Limiting ─────────────────────────────────────────────────────────────

// General API limit
app.use(
  '/v1',
  rateLimit({
    windowMs: 60 * 1000,      // 1 minute
    max: 120,                  // 120 req/min per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { ok: false, error: { code: 'RATE_LIMITED', message: 'Too many requests. Please slow down.' } },
  }),
);

// Stricter limit on AI-heavy endpoints
app.use(
  ['/v1/chat', '/v1/voice', '/v1/image'],
  rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { ok: false, error: { code: 'RATE_LIMITED', message: 'Too many AI requests. Please wait a moment.' } },
  }),
);

// ─── Body Parsers ──────────────────────────────────────────────────────────────

// Twilio webhooks send application/x-www-form-urlencoded.
// We need the raw body available for HMAC signature verification.
// Mount urlencoded BEFORE json so Twilio payloads parse correctly.
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(express.json({ limit: '2mb' }));

// ─── Health Check ──────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'SwasthyaAI Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
    db: process.env.NODE_ENV === 'production' ? 'dynamodb' : 'in-memory mock',
    openai: process.env.OPENAI_API_KEY ? 'configured' : 'stub',
    twilio: process.env.TWILIO_ACCOUNT_SID ? 'configured' : 'stub',
    aws: process.env.AWS_ACCESS_KEY_ID ? 'configured' : 'stub',
  });
});

// ─── Routes ────────────────────────────────────────────────────────────────────

// Auth
app.use('/v1/auth', require('./handlers/auth'));

// Public
app.use('/v1/news', require('./handlers/news'));

// Twilio webhooks (signature-verified internally)
app.use('/v1/webhooks/whatsapp', require('./handlers/whatsapp'));
app.use('/v1/webhooks/sms', require('./handlers/sms'));

// Public alerts (also readable by dashboard without auth)
app.use('/v1/alerts', attachSession, require('./handlers/alerts'));

// Admin — GETs are public, writes require X-Admin-Key (handled in handler)
app.use('/v1/admin', require('./handlers/admin'));

// Authenticated routes
app.use('/v1/chat', attachSession, require('./handlers/chat'));
app.use('/v1/users', attachSession, require('./handlers/users'));
app.use('/v1/voice', attachSession, require('./handlers/voice'));
app.use('/v1/image', attachSession, require('./handlers/image'));
app.use('/v1/vaccination', attachSession, require('./handlers/vaccination'));
app.use('/v1/facilities', attachSession, require('./handlers/facilities'));

// ─── 404 ───────────────────────────────────────────────────────────────────────

app.use((req, res) => {
  return error(res, 'NOT_FOUND', `Route ${req.method} ${req.path} not found`, 404);
});

// ─── Global Error Handler ──────────────────────────────────────────────────────

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[app] unhandled error:', err.message);

  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'CORS_FORBIDDEN', message: 'Origin not allowed' });
  }

  return error(res, 'INTERNAL_ERROR', 'An unexpected error occurred', 500);
});

module.exports = app;
