'use strict';

const express = require('express');
const { z } = require('zod');
const { requireAdmin, requireAdminWrite } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { success, notFound, error, paginated } = require('../utils/response');
const { generateId } = require('../utils/crypto');
const db = require('../db/client');

const router = express.Router();

// All admin routes: GETs are public (dashboard reads), writes require X-Admin-Key
router.use(requireAdminWrite);

// ─── Stats ─────────────────────────────────────────────────────────────────────

// GET /v1/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const raw = await db.getStats();
    // Map backend field names → what the web dashboard expects
    return success(res, {
      totalUsers:       raw.totalUsers,
      queriesToday:     raw.queries24h,
      activeUsersToday: raw.activeUsers24h,
      activeUsers7d:    raw.activeUsers7d,
      totalQueries:     raw.totalQueries,
      escalationCount:  raw.escalationsRequired,
      emergencyCount:   raw.emergenciesDetected,
      avgResponseTime:  raw.avgResponseTime,
      uptimePercent:    raw.uptimePercent,
      byChannel:        raw.byChannel,
      byLanguage:       raw.byLanguage,
      byIntent:         raw.byIntent,
      // Top query categories derived from intent counts
      topQueryCategories: Object.entries(raw.byIntent || {})
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count),
    });
  } catch (err) {
    console.error('[admin/stats]', err);
    return error(res, 'INTERNAL_ERROR', 'Failed to fetch stats', 500);
  }
});

// GET /v1/admin/analytics
router.get('/analytics', async (req, res) => {
  try {
    const period = ['7d', '30d', '90d'].includes(req.query.period) ? req.query.period : '30d';
    const raw = await db.getAnalytics({ period });
    return success(res, {
      period:      raw.period,
      totalQueries: raw.totalQueries,
      newUsers:    raw.newUsers,
      // timeSeries items use 'queries' field — map to 'count' for the chart
      queriesByDay: (raw.timeSeries || []).map((d) => ({ date: d.date, count: d.queries, newUsers: d.newUsers })),
      breakdown: {
        byChannel:    raw.byChannel    || {},
        byLanguage:   raw.byLanguage   || {},
        byIntent:     raw.byIntent     || {},
        safetyEvents: raw.safetyEvents || { escalations: 0, emergencies: 0, diagnosticBlocks: 0 },
      },
    });
  } catch (err) {
    console.error('[admin/analytics]', err);
    return error(res, 'INTERNAL_ERROR', 'Failed to fetch analytics', 500);
  }
});

// ─── Users ─────────────────────────────────────────────────────────────────────

// GET /v1/admin/users
router.get('/users', async (req, res) => {
  try {
    const page  = Math.max(parseInt(req.query.page  || '1',  10), 1);
    const limit = Math.min(parseInt(req.query.limit || '20', 10), 100);

    const { items, total } = await db.listUsers({
      page, limit,
      search:   req.query.search   || undefined,
      language: req.query.language || undefined,
      channel:  req.query.channel  || undefined,
    });

    const safeItems = await Promise.all(
      items.map(async ({ fcmToken, ...u }) => ({
        ...u,
        phoneNumber: u.phoneNumber
          ? u.phoneNumber.replace(/(\+\d{2})\d{5}(\d{4})/, '$1*****$2')
          : null,
        queryCount: (await db.listQueries({ userId: u.userId, page: 1, limit: 1 })).total,
      })),
    );
    return paginated(res, safeItems, total, page, limit);
  } catch (err) {
    console.error('[admin/users]', err);
    return error(res, 'INTERNAL_ERROR', 'Failed to list users', 500);
  }
});

// GET /v1/admin/users/:userId
router.get('/users/:userId', async (req, res) => {
  try {
    const user = await db.getUser(req.params.userId);
    if (!user) return notFound(res, 'User not found');
    const { fcmToken, ...safeUser } = user;
    const queryHistory = await db.getQueryHistory(req.params.userId, { limit: 10 });
    const vaccinationProfile = await db.getVaccinationProfile(req.params.userId);
    return success(res, { user: safeUser, queryHistory, vaccinationProfile: vaccinationProfile || null });
  } catch (err) {
    console.error('[admin/users/:id]', err);
    return error(res, 'INTERNAL_ERROR', 'Failed to fetch user', 500);
  }
});

// ─── Queries ───────────────────────────────────────────────────────────────────

// GET /v1/admin/queries
router.get('/queries', async (req, res) => {
  try {
    const page  = Math.max(parseInt(req.query.page  || '1',  10), 1);
    const limit = Math.min(parseInt(req.query.limit || '20', 10), 100);

    const { items, total } = await db.listQueries({
      page, limit,
      userId:    req.query.userId    || undefined,
      intent:    req.query.intent    || undefined,
      language:  req.query.language  || undefined,
      channel:   req.query.channel   || undefined,
      emergency: req.query.flaggedOnly === 'true' ? true : undefined,
      dateFrom:  req.query.from      || undefined,
      dateTo:    req.query.to        || undefined,
    });
    return paginated(res, items, total, page, limit);
  } catch (err) {
    console.error('[admin/queries]', err);
    return error(res, 'INTERNAL_ERROR', 'Failed to list queries', 500);
  }
});

// ─── Alerts ────────────────────────────────────────────────────────────────────

const AlertSchema = z.object({
  type:            z.enum(['outbreak', 'weather', 'health', 'disease', 'vaccination']),
  severity:        z.enum(['critical', 'high', 'medium', 'low', 'info']),
  title:           z.string().min(1).max(200),
  message:         z.string().min(1).max(2000),
  affectedRegions: z.array(z.string()).min(1),
  expiresAt:       z.string().datetime(),
  sourceUrl:       z.string().url().optional(),
});

// GET /v1/admin/alerts
router.get('/alerts', async (req, res) => {
  try {
    const filters = {};
    if (req.query.regionCode) filters.regionCode = req.query.regionCode;
    if (req.query.type)       filters.alertType  = req.query.type;
    if (req.query.active !== undefined) filters.isActive = req.query.active === 'true';

    const alerts = await db.listAlerts(filters);
    return success(res, { alerts, total: alerts.length });
  } catch (err) {
    console.error('[admin/alerts GET]', err);
    return error(res, 'INTERNAL_ERROR', 'Failed to list alerts', 500);
  }
});

// POST /v1/admin/alerts
router.post('/alerts', requireAdmin, validate(AlertSchema), async (req, res) => {
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
    return success(res, { alert, notificationsSent: 0 }, 201);
  } catch (err) {
    console.error('[admin/alerts POST]', err);
    return error(res, 'INTERNAL_ERROR', 'Failed to create alert', 500);
  }
});

// PUT /v1/admin/alerts/:alertId
router.put('/alerts/:alertId', requireAdmin, async (req, res) => {
  try {
    const updated = await db.updateAlert(req.params.alertId, req.body);
    if (!updated) return notFound(res, 'Alert not found');
    return success(res, { alert: updated });
  } catch (err) {
    console.error('[admin/alerts PUT]', err);
    return error(res, 'INTERNAL_ERROR', 'Failed to update alert', 500);
  }
});

// DELETE /v1/admin/alerts/:alertId
router.delete('/alerts/:alertId', requireAdmin, async (req, res) => {
  try {
    const existing = await db.getAlert(req.params.alertId);
    if (!existing) return notFound(res, 'Alert not found');
    await db.deleteAlert(req.params.alertId);
    return success(res, { success: true });
  } catch (err) {
    console.error('[admin/alerts DELETE]', err);
    return error(res, 'INTERNAL_ERROR', 'Failed to delete alert', 500);
  }
});

// ─── Outbreaks ─────────────────────────────────────────────────────────────────

const OutbreakSchema = z.object({
  disease:     z.string().min(1),
  regionCode:  z.string().min(1),
  cases:       z.number().int().nonnegative().optional(),
  casesReported: z.number().int().nonnegative().optional(),
  severity:    z.enum(['critical', 'high', 'medium', 'low']),
  trend:       z.enum(['up', 'down', 'stable']).optional(),
  description: z.string().min(1).optional(),
  source:      z.string().min(1).optional(),
});

// GET /v1/admin/outbreaks
router.get('/outbreaks', async (req, res) => {
  try {
    const page  = Math.max(parseInt(req.query.page  || '1',  10), 1);
    const limit = Math.min(parseInt(req.query.limit || '20', 10), 100);

    const { items, total } = await db.listOutbreaks({
      page, limit,
      regionCode: req.query.regionCode || undefined,
      disease:    req.query.disease    || undefined,
      severity:   req.query.severity   || undefined,
      isActive:   req.query.active !== undefined ? req.query.active === 'true' : undefined,
    });
    return paginated(res, items, total, page, limit);
  } catch (err) {
    console.error('[admin/outbreaks GET]', err);
    return error(res, 'INTERNAL_ERROR', 'Failed to list outbreaks', 500);
  }
});

// POST /v1/admin/outbreaks
router.post('/outbreaks', requireAdmin, validate(OutbreakSchema), async (req, res) => {
  try {
    const outbreak = await db.createOutbreak({
      outbreakId:    generateId('ob_'),
      ...req.body,
      casesReported: req.body.casesReported ?? req.body.cases ?? 0,
      isActive:      true,
      reportedAt:    new Date().toISOString(),
      updatedAt:     new Date().toISOString(),
    });
    return success(res, { outbreak }, 201);
  } catch (err) {
    console.error('[admin/outbreaks POST]', err);
    return error(res, 'INTERNAL_ERROR', 'Failed to create outbreak', 500);
  }
});

// PUT /v1/admin/outbreaks/:outbreakId
router.put('/outbreaks/:outbreakId', requireAdmin, async (req, res) => {
  try {
    const updated = await db.updateOutbreak(req.params.outbreakId, req.body);
    if (!updated) return notFound(res, 'Outbreak not found');
    return success(res, { outbreak: updated });
  } catch (err) {
    console.error('[admin/outbreaks PUT]', err);
    return error(res, 'INTERNAL_ERROR', 'Failed to update outbreak', 500);
  }
});

// ─── Vaccination Drives ────────────────────────────────────────────────────────

const DriveSchema = z.object({
  vaccines:   z.array(z.string()).min(1),
  regionCode: z.string().min(1),
  location:   z.string().min(1).optional(),
  name:       z.string().min(1).optional(),
  address:    z.string().min(1).optional(),
  date:       z.string().optional(),
  scheduledDate: z.string().optional(),
  time:       z.string().min(1).optional(),
  capacity:   z.number().int().positive(),
  organizer:  z.string().min(1),
});

// GET /v1/admin/vaccination-drives
router.get('/vaccination-drives', async (req, res) => {
  try {
    const page  = Math.max(parseInt(req.query.page  || '1',  10), 1);
    const limit = Math.min(parseInt(req.query.limit || '20', 10), 100);

    const { items, total } = await db.listDrives({
      page, limit,
      regionCode: req.query.regionCode || undefined,
      isActive:   req.query.active !== undefined ? req.query.active === 'true' : undefined,
    });
    return paginated(res, items, total, page, limit);
  } catch (err) {
    console.error('[admin/drives GET]', err);
    return error(res, 'INTERNAL_ERROR', 'Failed to list vaccination drives', 500);
  }
});

// POST /v1/admin/vaccination-drives
router.post('/vaccination-drives', requireAdmin, validate(DriveSchema), async (req, res) => {
  try {
    const drive = await db.createDrive({
      driveId:       generateId('drv_'),
      ...req.body,
      scheduledDate: req.body.scheduledDate || req.body.date,
      isActive:      true,
      registered:    0,
      createdAt:     new Date().toISOString(),
      updatedAt:     new Date().toISOString(),
    });
    return success(res, { drive }, 201);
  } catch (err) {
    console.error('[admin/drives POST]', err);
    return error(res, 'INTERNAL_ERROR', 'Failed to create vaccination drive', 500);
  }
});

// PUT /v1/admin/vaccination-drives/:driveId
router.put('/vaccination-drives/:driveId', requireAdmin, async (req, res) => {
  try {
    const updated = await db.updateDrive(req.params.driveId, req.body);
    if (!updated) return notFound(res, 'Vaccination drive not found');
    return success(res, { drive: updated });
  } catch (err) {
    console.error('[admin/drives PUT]', err);
    return error(res, 'INTERNAL_ERROR', 'Failed to update vaccination drive', 500);
  }
});

module.exports = router;
