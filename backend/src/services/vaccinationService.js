/**
 * Vaccination service — schedule generation and reminder logic.
 */

const { generateId } = require('../utils/crypto');

// Standard Indian immunization schedule (age in months → vaccines)
const IMMUNIZATION_SCHEDULE = [
  { vaccineId: 'vac_bcg', vaccineName: 'BCG', ageMonths: 0 },
  { vaccineId: 'vac_hepb0', vaccineName: 'Hepatitis B (Birth dose)', ageMonths: 0 },
  { vaccineId: 'vac_opv0', vaccineName: 'OPV (Oral Polio) - Birth dose', ageMonths: 0 },
  { vaccineId: 'vac_opv1', vaccineName: 'OPV 1', ageMonths: 1.5 },
  { vaccineId: 'vac_penta1', vaccineName: 'Pentavalent 1 (DPT+HepB+Hib)', ageMonths: 1.5 },
  { vaccineId: 'vac_rota1', vaccineName: 'Rotavirus 1', ageMonths: 1.5 },
  { vaccineId: 'vac_opv2', vaccineName: 'OPV 2', ageMonths: 2.5 },
  { vaccineId: 'vac_penta2', vaccineName: 'Pentavalent 2', ageMonths: 2.5 },
  { vaccineId: 'vac_rota2', vaccineName: 'Rotavirus 2', ageMonths: 2.5 },
  { vaccineId: 'vac_opv3', vaccineName: 'OPV 3', ageMonths: 3.5 },
  { vaccineId: 'vac_penta3', vaccineName: 'Pentavalent 3', ageMonths: 3.5 },
  { vaccineId: 'vac_rota3', vaccineName: 'Rotavirus 3', ageMonths: 3.5 },
  { vaccineId: 'vac_ipv', vaccineName: 'IPV (Inactivated Polio)', ageMonths: 3.5 },
  { vaccineId: 'vac_vita6', vaccineName: 'Vitamin A (1st dose)', ageMonths: 9 },
  { vaccineId: 'vac_mmr1', vaccineName: 'MMR 1', ageMonths: 9 },
  { vaccineId: 'vac_je1', vaccineName: 'Japanese Encephalitis 1', ageMonths: 9 },
  { vaccineId: 'vac_dpt_b1', vaccineName: 'DPT Booster 1', ageMonths: 16 },
  { vaccineId: 'vac_opv_b', vaccineName: 'OPV Booster', ageMonths: 16 },
  { vaccineId: 'vac_mmr2', vaccineName: 'MMR 2', ageMonths: 16 },
  { vaccineId: 'vac_vita16', vaccineName: 'Vitamin A (2nd-9th doses, every 6 months)', ageMonths: 16 },
  { vaccineId: 'vac_dpt_b2', vaccineName: 'DPT Booster 2', ageMonths: 60 },
  { vaccineId: 'vac_tt1', vaccineName: 'Tetanus Toxoid 1 (school entry)', ageMonths: 120 },
  { vaccineId: 'vac_tt2', vaccineName: 'Tetanus Toxoid 2 (school entry)', ageMonths: 132 },
  // Adult annual
  { vaccineId: 'vac_flu_annual', vaccineName: 'Influenza (Annual)', ageMonths: null, annual: true },
];

/**
 * Generate recommended vaccination schedule for a user profile.
 * @param {string} dateOfBirth - ISO date string
 * @param {string} gender
 * @param {Array} completedVaccines - array of { vaccineId }
 */
const generateSchedule = (dateOfBirth, gender, completedVaccines = []) => {
  const dob = new Date(dateOfBirth);
  if (isNaN(dob.getTime())) return [];
  const ageMs = Date.now() - dob.getTime();
  const ageMonths = ageMs / (1000 * 60 * 60 * 24 * 30.44);

  const completedIds = new Set(completedVaccines.map((v) => v.vaccineId));

  return IMMUNIZATION_SCHEDULE.map((item) => {
    const dueDate = item.annual
      ? new Date(new Date().getFullYear(), 9, 1).toISOString().slice(0, 10) // Oct 1 each year
      : new Date(dob.getTime() + item.ageMonths * 30.44 * 86400000).toISOString().slice(0, 10);

    const isCompleted = completedIds.has(item.vaccineId);
    const isOverdue = !isCompleted && new Date(dueDate) < new Date() && item.ageMonths <= ageMonths;
    const isUpcoming = !isCompleted && !isOverdue;
    const notApplicable = !item.annual && item.ageMonths > ageMonths + 2; // more than 2 months away age-wise

    let status = 'not_applicable';
    if (isCompleted) status = 'completed';
    else if (isOverdue) status = 'overdue';
    else if (isUpcoming && !notApplicable) status = 'upcoming';

    return {
      vaccineId: item.vaccineId,
      vaccineName: item.vaccineName,
      recommendedAgeMonths: item.ageMonths,
      dueDate,
      status,
    };
  });
};

/**
 * Build initial upcomingVaccines list for a new profile.
 */
const buildUpcomingVaccines = (dateOfBirth, gender) => {
  const schedule = generateSchedule(dateOfBirth, gender, []);
  return schedule
    .filter((s) => s.status === 'upcoming' || s.status === 'overdue')
    .slice(0, 5)
    .map((s) => ({
      vaccineId: s.vaccineId,
      vaccineName: s.vaccineName,
      dueDate: s.dueDate,
      reminderSent: false,
      priority: s.status === 'overdue' ? 'high' : 'medium',
    }));
};

/**
 * Create a new vaccination profile.
 */
const createProfile = (userId, { dateOfBirth, gender, familyMembers = [] }) => {
  const profileId = generateId('vp_');
  const upcomingVaccines = buildUpcomingVaccines(dateOfBirth, gender);

  const members = familyMembers.map((m) => ({
    memberId: generateId('fm_'),
    name: m.name,
    relationship: m.relationship,
    dateOfBirth: m.dateOfBirth,
    vaccinations: [],
    upcomingVaccines: buildUpcomingVaccines(m.dateOfBirth, 'other'),
  }));

  return {
    profileId,
    userId,
    dateOfBirth,
    gender,
    vaccinations: [],
    upcomingVaccines,
    familyMembers: members,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

/**
 * After adding a new record, recalculate upcoming vaccine reminders.
 */
const recalculateReminders = (profile) => {
  const newUpcoming = buildUpcomingVaccines(profile.dateOfBirth, profile.gender);
  const completedIds = new Set(profile.vaccinations.map((v) => v.vaccineId));
  profile.upcomingVaccines = newUpcoming.filter((v) => !completedIds.has(v.vaccineId));
  profile.updatedAt = new Date().toISOString();
  return profile;
};

module.exports = { generateSchedule, createProfile, recalculateReminders, buildUpcomingVaccines };
