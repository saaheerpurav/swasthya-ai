'use strict';

const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { success, notFound, error } = require('../utils/response');
const db = require('../db/client');

const router = express.Router();

// GET /v1/facilities
router.get('/', requireAuth, async (req, res) => {
  try {
    const { lat, lng, type, radius = '10', language, limit = '20' } = req.query;

    const facilities = await db.listFacilities({
      latitude:     lat ? parseFloat(lat) : undefined,
      longitude:    lng ? parseFloat(lng) : undefined,
      facilityType: type,
      radius:       parseFloat(radius),
      language,
    });

    const limited = facilities.slice(0, Math.min(parseInt(limit, 10), 50));

    const now = new Date();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = dayNames[now.getDay()];
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const enriched = limited.map((f) => {
      const todayHours = f.operatingHours?.[today];
      const isOpen =
        f.operatingHours?.emergency24x7 ||
        (!todayHours?.closed && todayHours?.open <= currentTime && currentTime <= todayHours?.close);
      return { ...f, isOpen: Boolean(isOpen) };
    });

    return success(res, { facilities: enriched, total: enriched.length, searchRadius: parseFloat(radius) });
  } catch (err) {
    console.error('[facilities] list error:', err);
    return error(res, 'INTERNAL_ERROR', 'Failed to fetch facilities', 500);
  }
});

// GET /v1/facilities/:facilityId
router.get('/:facilityId', requireAuth, async (req, res) => {
  try {
    const facility = await db.getFacility(req.params.facilityId);
    if (!facility) return notFound(res, 'Facility not found');
    return success(res, { facility });
  } catch (err) {
    console.error('[facilities] get error:', err);
    return error(res, 'INTERNAL_ERROR', 'Failed to fetch facility', 500);
  }
});

module.exports = router;
