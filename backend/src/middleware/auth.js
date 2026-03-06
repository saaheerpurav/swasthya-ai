const { verifyJwt } = require('../utils/crypto');
const { unauthorized, forbidden } = require('../utils/response');
const db = require('../db/client');

/**
 * Attaches req.session and req.userId if valid Bearer token present.
 * Does NOT reject — use requireAuth() for protected routes.
 */
const attachSession = async (req, res, next) => {
  const header = req.headers['authorization'];
  if (!header || !header.startsWith('Bearer ')) return next();

  const token = header.slice(7);
  const payload = verifyJwt(token);
  if (!payload) return next();

  const session = await db.getSession(token);
  if (!session) return next();

  req.session = session;
  req.userId = session.userId;
  next();
};

/**
 * Rejects with 401 if no valid session attached.
 */
const requireAuth = (req, res, next) => {
  if (!req.userId) return unauthorized(res);
  next();
};

/**
 * Rejects with 403 if X-Admin-Key header doesn't match ADMIN_API_KEY.
 * For write operations only (GET routes on admin use requireAuth only).
 */
const requireAdmin = (req, res, next) => {
  const key = req.headers['x-admin-key'];
  if (!key || key !== process.env.ADMIN_API_KEY) {
    return forbidden(res, 'Invalid or missing admin key');
  }
  next();
};

/**
 * Admin GET endpoints are publicly readable (no admin key needed).
 * Admin POST/PUT/DELETE require admin key.
 */
const requireAdminWrite = (req, res, next) => {
  if (req.method === 'GET') return next();
  return requireAdmin(req, res, next);
};

module.exports = { attachSession, requireAuth, requireAdmin, requireAdminWrite };
