'use strict';

const express = require('express');
const twilio = require('twilio');
const { generateHealthResponse } = require('../services/aiService');
const { sendSMS } = require('../services/notificationService');
const { generateId, signJwt } = require('../utils/crypto');
const db = require('../db/client');

const router = express.Router();

// ─── Twilio signature validation ─────────────────────────────────────────────

const verifyTwilio = (req, res, next) => {
  if (process.env.NODE_ENV !== 'production') return next();

  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!authToken) return next();

  const sig = req.headers['x-twilio-signature'];
  if (!sig) return res.status(403).send('Missing Twilio signature');

  const proto = req.headers['x-forwarded-proto'] || req.protocol;
  const fullUrl = `${proto}://${req.headers.host}${req.originalUrl}`;

  const valid = twilio.validateRequest(authToken, sig, fullUrl, req.body || {});
  if (!valid) {
    console.warn('[sms] Invalid Twilio signature — rejecting webhook');
    return res.status(403).send('Invalid signature');
  }
  next();
};

// POST /v1/webhooks/sms
router.post('/', verifyTwilio, async (req, res) => {
  res
    .status(200)
    .set('Content-Type', 'text/xml')
    .send('<?xml version="1.0" encoding="UTF-8"?><Response/>');

  try {
    const { From, Body } = req.body;
    const phone = From || '';
    const message = (Body || '').trim();
    if (!phone || !message) return;

    let user = await db.getUserByPhone(phone);
    if (!user) {
      const userId = generateId('usr_');
      user = await db.createUser({
        userId,
        phoneNumber: phone,
        preferredLanguage: 'en',
        channels: ['sms'],
        location: null,
        privacySettings: { shareLocation: true, allowAlerts: true },
        onboardingComplete: true,
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
      });
      const sessionId = generateId('sess_');
      const token = signJwt({ userId, sessionId });
      await db.createSession({
        token, sessionId, userId, channel: 'sms', expiresAt: null,
      });
    }

    const aiResponse = await generateHealthResponse({
      message,
      language: user.preferredLanguage,
    });

    // SMS: strip markdown, keep under 1500 chars
    const responseText = aiResponse.content.replace(/[*_#`]/g, '').slice(0, 1500);

    await db.saveQuery({
      queryId: generateId('qry_'),
      userId: user.userId,
      channel: 'sms',
      originalText: message,
      language: aiResponse.language,
      intent: aiResponse.intent,
      safetyFlags: aiResponse.safetyFlags,
      timestamp: new Date().toISOString(),
      responsePreview: aiResponse.content.slice(0, 200),
    });

    await sendSMS(phone, responseText);
  } catch (err) {
    console.error('[sms] webhook error:', err);
  }
});

module.exports = router;
