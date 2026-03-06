'use strict';

const express = require('express');
const { z } = require('zod');
const { requireAuth } = require('../middleware/auth');
const { validate, validateQuery } = require('../middleware/validate');
const { success, notFound, error } = require('../utils/response');
const { generateId } = require('../utils/crypto');
const { createProfile, generateSchedule, recalculateReminders } = require('../services/vaccinationService');
const db = require('../db/client');

const router = express.Router();

// Accept "YYYY-MM-DD" or full ISO strings — always normalise to "YYYY-MM-DD"
const dobField = z.string().min(1).transform((v) => v.slice(0, 10));
// Accept any capitalisation of gender
const genderField = z.string().transform((v) => v.toLowerCase()).pipe(z.enum(['male', 'female', 'other']));

const ProfileSchema = z.object({
  dateOfBirth: dobField,
  gender:      genderField,
  familyMembers: z
    .array(
      z.object({
        name:         z.string().min(1),
        relationship: z.enum(['child', 'spouse', 'parent', 'sibling', 'other']),
        dateOfBirth:  dobField,
      })
    )
    .optional()
    .default([]),
});

const RecordSchema = z.object({
  vaccineName:      z.string().min(1),
  dateAdministered: dobField,
  facilityId:       z.string().optional().nullable(),
  batchNumber:      z.string().optional().nullable(),
  memberId:         z.string().optional().nullable(),
});

const ScheduleQuerySchema = z.object({
  dateOfBirth: dobField,
  gender:      genderField,
  language:    z.enum(['en', 'hi', 'kn', 'te']).optional().default('en'),
});

// GET /v1/vaccination/profile
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const profile = await db.getVaccinationProfile(req.userId);
    return success(res, { profile: profile || null });
  } catch (err) {
    console.error('[vaccination] get profile error:', err);
    return error(res, 'INTERNAL_ERROR', 'Failed to get profile', 500);
  }
});

// POST /v1/vaccination/profile
router.post('/profile', requireAuth, validate(ProfileSchema), async (req, res) => {
  try {
    const profile = createProfile(req.userId, req.body);
    await db.saveVaccinationProfile(req.userId, profile);
    return success(res, { profile }, 201);
  } catch (err) {
    console.error('[vaccination] profile error:', err);
    return error(res, 'INTERNAL_ERROR', 'Failed to create profile', 500);
  }
});

// POST /v1/vaccination/records
router.post('/records', requireAuth, validate(RecordSchema), async (req, res) => {
  try {
    let profile = await db.getVaccinationProfile(req.userId);
    if (!profile) return notFound(res, 'Vaccination profile not found. Create a profile first.');

    const record = {
      vaccineId:        generateId('vrec_'),
      vaccineName:      req.body.vaccineName,
      dateAdministered: req.body.dateAdministered,
      facilityId:       req.body.facilityId || null,
      batchNumber:      req.body.batchNumber || null,
    };

    const added = await db.addVaccinationRecord(req.userId, record, req.body.memberId || null);
    if (!added) return notFound(res, 'Family member not found');

    // Recalculate upcoming reminders
    profile = await db.getVaccinationProfile(req.userId);
    recalculateReminders(profile);
    await db.saveVaccinationProfile(req.userId, profile);

    return success(res, { record: added, adjustedReminders: [] }, 201);
  } catch (err) {
    console.error('[vaccination] record error:', err);
    return error(res, 'INTERNAL_ERROR', 'Failed to add record', 500);
  }
});

// DELETE /v1/vaccination/records/:vaccineId
router.delete('/records/:vaccineId', requireAuth, async (req, res) => {
  try {
    const memberId = req.query.memberId || null;
    const removed = await db.deleteVaccinationRecord(req.userId, req.params.vaccineId, memberId);
    if (!removed) return notFound(res, 'Vaccination record not found');
    return success(res, { success: true });
  } catch (err) {
    console.error('[vaccination] delete record error:', err);
    return error(res, 'INTERNAL_ERROR', 'Failed to delete record', 500);
  }
});

// GET /v1/vaccination/schedule
router.get('/schedule', validateQuery(ScheduleQuerySchema), async (req, res) => {
  try {
    const { dateOfBirth, gender } = req.query;
    const profile = req.userId ? await db.getVaccinationProfile(req.userId) : null;
    const completed = profile?.vaccinations || [];
    const schedule = generateSchedule(dateOfBirth, gender, completed);
    return success(res, { schedule });
  } catch (err) {
    console.error('[vaccination] schedule error:', err);
    return error(res, 'INTERNAL_ERROR', 'Failed to generate schedule', 500);
  }
});

// GET /v1/vaccination/centers
router.get('/centers', requireAuth, async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;
    const centers = await db.listFacilities({
      latitude:     lat ? parseFloat(lat) : undefined,
      longitude:    lng ? parseFloat(lng) : undefined,
      facilityType: 'vaccination_center',
      radius:       radius ? parseFloat(radius) : 10,
    });
    return success(res, { facilities: centers, total: centers.length, searchRadius: parseFloat(radius) || 10 });
  } catch (err) {
    console.error('[vaccination] centers error:', err);
    return error(res, 'INTERNAL_ERROR', 'Failed to fetch centers', 500);
  }
});

module.exports = router;
