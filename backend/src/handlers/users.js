'use strict';

const express = require('express');
const { z } = require('zod');
const { requireAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { success, notFound, error } = require('../utils/response');
const db = require('../db/client');

const router = express.Router();

const UpdateUserSchema = z.object({
  preferredLanguage:  z.enum(['en', 'hi', 'kn', 'te']).optional(),
  location: z.object({
    regionCode: z.string().optional(),
    latitude:   z.number().optional(),
    longitude:  z.number().optional(),
    address:    z.string().optional(),
  }).optional(),
  privacySettings: z.object({
    shareLocation: z.boolean().optional(),
    allowAlerts:   z.boolean().optional(),
  }).optional(),
  fcmToken:           z.string().optional(),
  onboardingComplete: z.boolean().optional(),
});

// GET /v1/users/me
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await db.getUser(req.userId);
    if (!user) return notFound(res, 'User not found');
    const { fcmToken, ...safeUser } = user;
    return success(res, { user: safeUser });
  } catch (err) {
    console.error('[users/me GET]', err);
    return error(res, 'INTERNAL_ERROR', 'Failed to fetch user', 500);
  }
});

// PUT /v1/users/me
router.put('/me', requireAuth, validate(UpdateUserSchema), async (req, res) => {
  try {
    const updates = {};
    if (req.body.preferredLanguage !== undefined) updates.preferredLanguage = req.body.preferredLanguage;
    if (req.body.location           !== undefined) updates.location          = req.body.location;
    if (req.body.fcmToken           !== undefined) updates.fcmToken          = req.body.fcmToken;
    if (req.body.onboardingComplete !== undefined) updates.onboardingComplete = req.body.onboardingComplete;
    if (req.body.privacySettings) {
      const user = await db.getUser(req.userId);
      updates.privacySettings = { ...(user?.privacySettings || {}), ...req.body.privacySettings };
    }

    const updated = await db.updateUser(req.userId, updates);
    if (!updated) return notFound(res, 'User not found');
    const { fcmToken, ...safeUser } = updated;
    return success(res, { user: safeUser });
  } catch (err) {
    console.error('[users/me PUT]', err);
    return error(res, 'INTERNAL_ERROR', 'Failed to update user', 500);
  }
});

// DELETE /v1/users/me
router.delete('/me', requireAuth, async (req, res) => {
  try {
    const deletionDate = new Date(Date.now() + 30 * 86400000).toISOString();
    await db.updateUser(req.userId, { deletionScheduledAt: deletionDate });
    return success(res, {
      success: true,
      deletionScheduledAt: new Date().toISOString(),
      deletionCompletesBy: deletionDate,
    });
  } catch (err) {
    console.error('[users/me DELETE]', err);
    return error(res, 'INTERNAL_ERROR', 'Failed to schedule deletion', 500);
  }
});

module.exports = router;
