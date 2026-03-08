'use strict';

const express = require('express');
const twilio = require('twilio');
const { generateHealthResponse } = require('../services/aiService');
const { sendWhatsApp } = require('../services/notificationService');
const { analyzeImage } = require('../services/imageService');
const { generateId, signJwt } = require('../utils/crypto');
const db = require('../db/client');

const router = express.Router();

// ─── Twilio signature validation ─────────────────────────────────────────────

const verifyTwilio = (req, res, next) => {
  if (process.env.NODE_ENV !== 'production') return next();

  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!authToken) return next(); // no token configured — skip in dev

  const sig = req.headers['x-twilio-signature'];
  if (!sig) return res.status(403).send('Missing Twilio signature');

  // Reconstruct the full URL Twilio signed
  const proto = req.headers['x-forwarded-proto'] || req.protocol;
  const fullUrl = `${proto}://${req.headers.host}${req.originalUrl}`;

  const params = req.body || {};
  const valid = twilio.validateRequest(authToken, sig, fullUrl, params);

  if (!valid) {
    console.warn('[whatsapp] Invalid Twilio signature — rejecting webhook');
    return res.status(403).send('Invalid signature');
  }
  next();
};

// GET — Twilio webhook health check
router.get('/', (_req, res) => res.status(200).send('OK'));

// POST /v1/webhooks/whatsapp
router.post('/', verifyTwilio, async (req, res) => {
  const twimlReply = (text) => {
    const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return res
      .status(200)
      .set('Content-Type', 'text/xml')
      .send(`<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escaped}</Message></Response>`);
  };

  const twimlEmpty = () =>
    res
      .status(200)
      .set('Content-Type', 'text/xml')
      .send('<?xml version="1.0" encoding="UTF-8"?><Response/>');

  try {
    const { From, Body, NumMedia, MediaUrl0, MediaContentType0 } = req.body;
    const phone = (From || '').replace('whatsapp:', '');
    if (!phone) return twimlEmpty();

    // Get or auto-create user
    let user = await db.getUserByPhone(phone);
    if (!user) {
      const userId = generateId('usr_');
      user = await db.createUser({
        userId,
        phoneNumber: phone,
        preferredLanguage: 'en',
        channels: ['whatsapp'],
        location: null,
        privacySettings: { shareLocation: true, allowAlerts: true },
        onboardingComplete: true,
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
      });
      const sessionId = generateId('sess_');
      const token = signJwt({ userId, sessionId });
      await db.createSession({
        token, sessionId, userId, channel: 'whatsapp', expiresAt: null,
      });
    }

    let responseText;

    if (parseInt(NumMedia, 10) > 0 && MediaContentType0?.startsWith('image/')) {
      // Image message — fetch from Twilio (auth required) then analyse
      try {
        const imageResp = await fetch(MediaUrl0, {
          headers: {
            Authorization:
              'Basic ' +
              Buffer.from(
                `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`,
              ).toString('base64'),
          },
        });
        if (!imageResp.ok) throw new Error(`Twilio image fetch ${imageResp.status}`);
        const imageBuffer = Buffer.from(await imageResp.arrayBuffer());
        const analysis = await analyzeImage(imageBuffer, user.preferredLanguage, Body || '');

        responseText = analysis.educationalInfo;
        if (analysis.escalationRequired) {
          responseText = '🚨 Please seek immediate medical attention.\n\n' + responseText;
        }
      } catch (e) {
        console.error('[whatsapp] image analysis error:', e.message);
        responseText = 'Unable to analyze the image. Please describe your symptoms in text.';
      }
    } else {
      // Text message
      const message = (Body || '').trim();
      if (!message) return twimlEmpty();

      const aiResponse = await generateHealthResponse({
        message,
        language: user.preferredLanguage,
      });

      responseText = aiResponse.content;

      await db.saveQuery({
        queryId: generateId('qry_'),
        userId: user.userId,
        channel: 'whatsapp',
        originalText: message,
        language: aiResponse.language,
        intent: aiResponse.intent,
        safetyFlags: aiResponse.safetyFlags,
        timestamp: new Date().toISOString(),
        responsePreview: aiResponse.content.slice(0, 200),
      });
    }

    return twimlReply(responseText);
  } catch (err) {
    console.error('[whatsapp] webhook error:', err);
    return twimlReply('Sorry, something went wrong. Please try again or call 108 for emergencies.');
  }
});

module.exports = router;
