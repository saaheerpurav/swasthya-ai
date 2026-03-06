const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const SESSION_TTL_HOURS = parseInt(process.env.SESSION_TTL_HOURS || '24', 10);

const generateToken = () => uuidv4();

const generateId = (prefix = '') => `${prefix}${uuidv4().replace(/-/g, '').slice(0, 12)}`;

const signJwt = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: `${SESSION_TTL_HOURS}h` });
};

const verifyJwt = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
};

// Anonymize phone numbers for logs: +919876543210 → +91****3210
const anonymizePhone = (phone) => {
  if (!phone) return null;
  const s = String(phone);
  if (s.length <= 6) return '****';
  return s.slice(0, 3) + '****' + s.slice(-4);
};

const hashIdentifier = (identifier) => {
  // Simple deterministic hash for linking phone→userId consistently in mock
  let hash = 0;
  for (const ch of String(identifier)) {
    hash = ((hash << 5) - hash + ch.charCodeAt(0)) | 0;
  }
  return Math.abs(hash).toString(36);
};

module.exports = { generateToken, generateId, signJwt, verifyJwt, anonymizePhone, hashIdentifier };
