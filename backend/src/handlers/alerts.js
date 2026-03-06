'use strict';

const express = require('express');
const { z } = require('zod');
const { requireAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { success, notFound, error } = require('../utils/response');
const { generateId } = require('../utils/crypto');
const { notifyUser } = require('../services/notificationService');
const db = require('../db/client');

const router = express.Router();

// GET /v1/alerts — public
router.get('/', async (req, res) => {
  try {
    const filters = {};
    if (req.query.regionCode) filters.regionCode = req.query.regionCode;
    if (req.query.type)       filters.alertType  = req.query.type;
    filters.isActive = true; // only return active alerts publicly

    const alerts = await db.listAlerts(filters);
    return success(res, { alerts, total: alerts.length });
  } catch (err) {
    console.error('[alerts] list error:', err);
    return error(res, 'INTERNAL_ERROR', 'Failed to fetch alerts', 500);
  }
});

const AlertSchema = z.object({
  type:            z.enum(['outbreak', 'weather', 'health', 'disease', 'vaccination']),
  severity:        z.enum(['critical', 'high', 'medium', 'low', 'info']),
  title:           z.string().min(1).max(200),
  message:         z.string().min(1).max(2000),
  affectedRegions: z.array(z.string()).min(1),
  expiresAt:       z.string().datetime(),
  sourceUrl:       z.string().url().optional(),
});

// POST /v1/alerts — admin only
router.post('/', requireAdmin, validate(AlertSchema), async (req, res) => {
  try {
    const alertId = generateId('alert_');
    const alert = await db.createAlert({
      alertId,
      ...req.body,
      alertType:  req.body.type,
      regionCode: req.body.affectedRegions[0],
      isActive:   true,
      createdAt:  new Date().toISOString(),
      updatedAt:  new Date().toISOString(),
    });

    // Notify users in affected regions (fire-and-forget)
    let notificationsSent = 0;
    try {
      const { items: users } = await db.listUsers({ page: 1, limit: 1000 });
      for (const user of users) {
        if (
          user.privacySettings?.allowAlerts &&
          req.body.affectedRegions.includes(user.location?.regionCode)
        ) {
          notifyUser(user, `SwasthyaAI Alert: ${alert.title}\n${alert.message.slice(0, 200)}`).catch(() => {});
          notificationsSent++;
        }
      }
    } catch {}

    return success(res, { alert, notificationsSent }, 201);
  } catch (err) {
    console.error('[alerts] create error:', err);
    return error(res, 'INTERNAL_ERROR', 'Failed to create alert', 500);
  }
});

// PUT /v1/alerts/:alertId — admin only
router.put('/:alertId', requireAdmin, async (req, res) => {
  try {
    const updated = await db.updateAlert(req.params.alertId, req.body);
    if (!updated) return notFound(res, 'Alert not found');
    return success(res, { alert: updated });
  } catch (err) {
    console.error('[alerts] update error:', err);
    return error(res, 'INTERNAL_ERROR', 'Failed to update alert', 500);
  }
});

// DELETE /v1/alerts/:alertId — admin only
router.delete('/:alertId', requireAdmin, async (req, res) => {
  try {
    const exists = await db.getAlert(req.params.alertId);
    if (!exists) return notFound(res, 'Alert not found');
    await db.deleteAlert(req.params.alertId);
    return success(res, { success: true });
  } catch (err) {
    console.error('[alerts] delete error:', err);
    return error(res, 'INTERNAL_ERROR', 'Failed to delete alert', 500);
  }
});

module.exports = router;
