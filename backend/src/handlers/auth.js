'use strict';

const express = require('express');
const { z } = require('zod');
const { generateId, signJwt } = require('../utils/crypto');
const { success, error } = require('../utils/response');
const { validate } = require('../middleware/validate');
const { sendSMS } = require('../services/notificationService');
const db = require('../db/client');

const router = express.Router();

// ─── In-memory OTP store (5-minute TTL) ──────────────────────────────────────
// Map<phone -> { otp, expiresAt }>
const otpStore = new Map();
const OTP_TTL_MS = 5 * 60 * 1000;

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function cleanExpiredOtps() {
  const now = Date.now();
  for (const [phone, entry] of otpStore) {
    if (entry.expiresAt < now) otpStore.delete(phone);
  }
}

// ─── POST /v1/auth/otp/send ───────────────────────────────────────────────────
const SendOtpSchema = z.object({
  phoneNumber: z.string().min(8),
});

router.post('/otp/send', validate(SendOtpSchema), async (req, res) => {
  try {
    cleanExpiredOtps();
    const phone = req.body.phoneNumber.replace(/\s+/g, '');
    const otp = generateOtp();
    otpStore.set(phone, { otp, expiresAt: Date.now() + OTP_TTL_MS });

    const body = `Your SwasthyaAI verification code is: ${otp}\nValid for 5 minutes. Do not share this code.`;
    await sendSMS(phone, body);

    console.log(`[auth/otp] sent OTP to ${phone.slice(0, 4)}****`);
    return success(res, { sent: true, phone });
  } catch (err) {
    console.error('[auth/otp/send]', err);
    return error(res, 'INTERNAL_ERROR', 'Failed to send OTP', 500);
  }
});

// ─── POST /v1/auth/otp/verify ─────────────────────────────────────────────────
const VerifyOtpSchema = z.object({
  phoneNumber: z.string().min(8),
  otp:         z.string().length(6),
  channel:     z.enum(['web', 'mobile', 'whatsapp', 'sms', 'voice']).default('mobile'),
});

router.post('/otp/verify', validate(VerifyOtpSchema), async (req, res) => {
  try {
    const phone = req.body.phoneNumber.replace(/\s+/g, '');
    const { otp, channel } = req.body;

    const entry = otpStore.get(phone);
    if (!entry) {
      return error(res, 'OTP_NOT_FOUND', 'No OTP found for this number. Please request a new code.', 400);
    }
    if (Date.now() > entry.expiresAt) {
      otpStore.delete(phone);
      return error(res, 'OTP_EXPIRED', 'OTP has expired. Please request a new code.', 400);
    }
    if (entry.otp !== otp) {
      return error(res, 'OTP_INVALID', 'Incorrect OTP. Please try again.', 400);
    }

    // OTP valid — consume it
    otpStore.delete(phone);

    // Find or create user
    let user = await db.getUserByPhone(phone);
    let isNew = false;

    if (!user) {
      isNew = true;
      user = await db.createUser({
        userId:            generateId('usr_'),
        phoneNumber:       phone,
        preferredLanguage: 'en',
        channels:          [channel],
        location:          null,
        privacySettings:   { shareLocation: true, allowAlerts: true },
        onboardingComplete: false,
        fcmToken:          null,
        createdAt:         new Date().toISOString(),
        lastActive:        new Date().toISOString(),
      });
    } else {
      if (!user.channels?.includes(channel)) {
        user = await db.updateUser(user.userId, {
          channels: [...(user.channels || []), channel],
        });
      } else {
        await db.updateUser(user.userId, { lastActive: new Date().toISOString() });
      }
    }

    const sessionId  = generateId('sess_');
    const ttlHours   = parseInt(process.env.SESSION_TTL_HOURS || '24', 10);
    const expiresAt  = new Date(Date.now() + ttlHours * 3600_000).toISOString();
    const token      = signJwt({ userId: user.userId, sessionId });

    await db.createSession({ token, sessionId, userId: user.userId, channel, expiresAt });

    return success(res, { token, sessionId, userId: user.userId, isNew, expiresAt });
  } catch (err) {
    console.error('[auth/otp/verify]', err);
    return error(res, 'INTERNAL_ERROR', 'Failed to verify OTP', 500);
  }
});

// ─── POST /v1/auth/session (web / no-OTP quick session) ──────────────────────
const SessionSchema = z.object({
  channel:    z.enum(['web', 'mobile', 'whatsapp', 'sms', 'voice']),
  identifier: z.string().optional(),
});

router.post('/session', validate(SessionSchema), async (req, res) => {
  try {
    const { channel, identifier } = req.body;
    const phone = identifier?.replace(/\s+/g, '').replace(/^whatsapp:/, '') || null;

    let user = phone ? await db.getUserByPhone(phone) : null;
    let isNew = false;

    if (!user) {
      isNew = true;
      user = await db.createUser({
        userId:            generateId('usr_'),
        phoneNumber:       phone,
        preferredLanguage: 'en',
        channels:          [channel],
        location:          null,
        privacySettings:   { shareLocation: true, allowAlerts: true },
        onboardingComplete: false,
        fcmToken:          null,
        createdAt:         new Date().toISOString(),
        lastActive:        new Date().toISOString(),
      });
    } else {
      if (!user.channels?.includes(channel)) {
        user = await db.updateUser(user.userId, {
          channels: [...(user.channels || []), channel],
        });
      }
    }

    const sessionId = generateId('sess_');
    const ttlHours  = parseInt(process.env.SESSION_TTL_HOURS || '24', 10);
    const expiresAt = new Date(Date.now() + ttlHours * 3600_000).toISOString();
    const token     = signJwt({ userId: user.userId, sessionId });

    await db.createSession({ token, sessionId, userId: user.userId, channel, expiresAt });

    return success(res, { sessionId, userId: user.userId, token, isNew, expiresAt });
  } catch (err) {
    console.error('[auth/session]', err);
    return error(res, 'INTERNAL_ERROR', 'Failed to create session', 500);
  }
});

// ─── DELETE /v1/auth/session ──────────────────────────────────────────────────
router.delete('/session', async (req, res) => {
  const header = req.headers['authorization'];
  if (header?.startsWith('Bearer ')) {
    await db.deleteSession(header.slice(7));
  }
  return success(res, { success: true });
});

module.exports = router;
