/**
 * In-memory mock database for local development.
 * All data resets on server restart.
 * Seed data is loaded on module init.
 */

const { generateId } = require('../utils/crypto');

// ─── Storage ─────────────────────────────────────────────────────────────────
const store = {
  sessions: new Map(),    // token → session
  users: new Map(),       // userId → user
  queries: new Map(),     // queryId → query  (also indexed by userId)
  facilities: [],
  alerts: new Map(),      // alertId → alert
  outbreaks: new Map(),   // outbreakId → outbreak
  vaccinationProfiles: new Map(), // userId → profile
  vaccinationDrives: new Map(),   // driveId → drive
  newsArticles: [],
};

// ─── Seed Data ────────────────────────────────────────────────────────────────
function seed() {
  // Facilities
  store.facilities = [
    {
      facilityId: 'fac_001',
      name: 'Rajiv Gandhi Government General Hospital',
      facilityType: 'hospital',
      location: { latitude: 12.9716, longitude: 77.5946, address: 'Seshadri Rd, Bengaluru 560001', regionCode: 'KA_BLR' },
      contactInfo: { phoneNumber: '+918022213801', email: null, website: null },
      services: ['emergency', 'outpatient', 'inpatient', 'pediatrics', 'vaccination'],
      languagesSupported: ['en', 'kn', 'hi'],
      operatingHours: {
        emergency24x7: true,
        monday: { open: '08:00', close: '20:00', closed: false },
        tuesday: { open: '08:00', close: '20:00', closed: false },
        wednesday: { open: '08:00', close: '20:00', closed: false },
        thursday: { open: '08:00', close: '20:00', closed: false },
        friday: { open: '08:00', close: '20:00', closed: false },
        saturday: { open: '08:00', close: '14:00', closed: false },
        sunday: { open: '09:00', close: '13:00', closed: false },
      },
      lastUpdated: new Date().toISOString(),
    },
    {
      facilityId: 'fac_002',
      name: 'Victoria Hospital',
      facilityType: 'hospital',
      location: { latitude: 12.9620, longitude: 77.5744, address: 'Fort Rd, Bengaluru 560002', regionCode: 'KA_BLR' },
      contactInfo: { phoneNumber: '+918022973200', email: null, website: null },
      services: ['emergency', 'surgery', 'maternity', 'vaccination'],
      languagesSupported: ['en', 'kn'],
      operatingHours: { emergency24x7: true, monday: { open: '09:00', close: '18:00', closed: false } },
      lastUpdated: new Date().toISOString(),
    },
    {
      facilityId: 'fac_003',
      name: 'PHC Jayanagar',
      facilityType: 'phc',
      location: { latitude: 12.9299, longitude: 77.5833, address: '4th Block, Jayanagar, Bengaluru 560011', regionCode: 'KA_BLR' },
      contactInfo: { phoneNumber: '+918026561234', email: null, website: null },
      services: ['outpatient', 'vaccination', 'maternal_health', 'child_health'],
      languagesSupported: ['en', 'kn', 'hi', 'te'],
      operatingHours: {
        emergency24x7: false,
        monday: { open: '09:00', close: '17:00', closed: false },
        sunday: { open: '09:00', close: '13:00', closed: false },
      },
      lastUpdated: new Date().toISOString(),
    },
    {
      facilityId: 'fac_004',
      name: 'Apollo Pharmacy - Koramangala',
      facilityType: 'pharmacy',
      location: { latitude: 12.9352, longitude: 77.6245, address: '80 Feet Rd, Koramangala, Bengaluru 560034', regionCode: 'KA_BLR' },
      contactInfo: { phoneNumber: '+918041234567', email: null, website: null },
      services: ['pharmacy', 'diagnostics'],
      languagesSupported: ['en', 'kn'],
      operatingHours: { emergency24x7: false, monday: { open: '08:00', close: '22:00', closed: false } },
      lastUpdated: new Date().toISOString(),
    },
    {
      facilityId: 'fac_005',
      name: 'Urban PHC Vaccination Centre - Shivajinagar',
      facilityType: 'vaccination_center',
      location: { latitude: 12.9867, longitude: 77.5945, address: 'Shivajinagar, Bengaluru 560001', regionCode: 'KA_BLR' },
      contactInfo: { phoneNumber: '+918022345678', email: null, website: null },
      services: ['vaccination', 'child_health'],
      languagesSupported: ['en', 'kn', 'hi'],
      operatingHours: { emergency24x7: false, monday: { open: '09:00', close: '16:00', closed: false } },
      lastUpdated: new Date().toISOString(),
    },
  ];

  // Alerts
  const now = new Date();
  const in14days = new Date(now.getTime() + 14 * 86400000).toISOString();
  const in7days = new Date(now.getTime() + 7 * 86400000).toISOString();

  store.alerts.set('alert_001', {
    alertId: 'alert_001',
    type: 'outbreak',
    severity: 'high',
    title: 'Dengue Outbreak Warning — Bengaluru South',
    message: 'A significant rise in dengue fever cases has been reported in Bengaluru South wards. Residents are advised to eliminate standing water, use mosquito repellents, and seek medical attention for fever with joint pain.',
    regionCode: 'KA_BLR',
    affectedRegions: ['KA_BLR'],
    sourceUrl: 'https://mohfw.gov.in/alerts/dengue-blr-2025',
    createdAt: now.toISOString(),
    expiresAt: in14days,
    active: true,
  });

  store.alerts.set('alert_002', {
    alertId: 'alert_002',
    type: 'weather',
    severity: 'medium',
    title: 'Heavy Rainfall Advisory — Waterborne Disease Risk',
    message: 'IMD forecasts heavy rainfall for the next 5 days. Risk of waterborne diseases (cholera, typhoid, leptospirosis) is elevated. Boil drinking water. Avoid floodwater contact.',
    regionCode: 'KA_BLR',
    affectedRegions: ['KA_BLR', 'TN_CHE'],
    sourceUrl: 'https://imd.gov.in/advisory/rainfall-june-2025',
    createdAt: now.toISOString(),
    expiresAt: in7days,
    active: true,
  });

  store.alerts.set('alert_003', {
    alertId: 'alert_003',
    type: 'health',
    severity: 'low',
    title: 'Influenza Season Advisory',
    message: 'Annual influenza season has begun. High-risk groups (elderly, children, pregnant women) should get vaccinated. Practice hand hygiene and avoid crowded spaces if symptomatic.',
    regionCode: 'KA_BLR',
    affectedRegions: ['KA_BLR', 'TN_CHE', 'AP_HYD', 'MH_MUM'],
    sourceUrl: 'https://mohfw.gov.in/advisory/influenza-2025',
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + 30 * 86400000).toISOString(),
    active: true,
  });

  // Outbreaks
  store.outbreaks.set('ob_001', {
    outbreakId: 'ob_001',
    disease: 'Dengue',
    regionCode: 'KA_BLR',
    regionName: 'Bengaluru, Karnataka',
    cases: 342,
    severity: 'high',
    trend: 'up',
    description: 'Rising dengue cases across south and east Bengaluru wards. Aedes aegypti breeding sites identified in multiple residential areas.',
    source: 'BBMP Health Department',
    reportedAt: now.toISOString(),
    active: true,
  });

  store.outbreaks.set('ob_002', {
    outbreakId: 'ob_002',
    disease: 'Influenza',
    regionCode: 'MH_MUM',
    regionName: 'Mumbai, Maharashtra',
    cases: 1240,
    severity: 'medium',
    trend: 'stable',
    description: 'Seasonal influenza cases consistent with annual patterns. H3N2 strain dominant. No unusual severity observed.',
    source: 'Maharashtra Health Department',
    reportedAt: now.toISOString(),
    active: true,
  });

  store.outbreaks.set('ob_003', {
    outbreakId: 'ob_003',
    disease: 'Cholera',
    regionCode: 'OR_BHU',
    regionName: 'Bhubaneswar, Odisha',
    cases: 87,
    severity: 'critical',
    trend: 'up',
    description: 'Waterborne cholera outbreak linked to contaminated water supply in peri-urban areas. ORS distribution underway.',
    source: 'Odisha State Health Department',
    reportedAt: now.toISOString(),
    active: true,
  });

  // Vaccination Drives
  store.vaccinationDrives.set('drv_001', {
    driveId: 'drv_001',
    vaccines: ['Polio (OPV)', 'Vitamin A'],
    regionCode: 'KA_BLR',
    location: 'Community Hall, Jayanagar',
    address: '32nd Cross, Jayanagar 4th Block, Bengaluru 560011',
    date: new Date(now.getTime() + 5 * 86400000).toISOString().slice(0, 10),
    time: '09:00-17:00',
    capacity: 500,
    registeredCount: 212,
    organizer: 'BBMP',
    active: true,
  });

  store.vaccinationDrives.set('drv_002', {
    driveId: 'drv_002',
    vaccines: ['COVID-19 (Covishield)', 'Influenza'],
    regionCode: 'KA_BLR',
    location: 'Kempegowda Stadium',
    address: 'Chamrajpet, Bengaluru 560018',
    date: new Date(now.getTime() + 10 * 86400000).toISOString().slice(0, 10),
    time: '08:00-16:00',
    capacity: 1000,
    registeredCount: 743,
    organizer: 'Karnataka Health Department',
    active: true,
  });

  // News Articles
  store.newsArticles = [
    {
      articleId: 'news_001',
      title: 'Waterborne disease outbreaks surge threefold in Maharashtra',
      summary: 'Health authorities report a significant rise in waterborne disease cases across Maharashtra following heavy monsoon rains.',
      url: 'https://mohfw.gov.in/news/waterborne-maharashtra-2025',
      source: 'MoHFW',
      publishedAt: new Date(now.getTime() - 2 * 3600000).toISOString(),
    },
    {
      articleId: 'news_002',
      title: 'India launches first bird-to-human disease surveillance program',
      summary: 'ICMR initiates a nationwide study to detect zoonotic diseases early, covering 30 districts across 10 states.',
      url: 'https://icmr.gov.in/news/zoonotic-surveillance-2025',
      source: 'ICMR',
      publishedAt: new Date(now.getTime() - 6 * 3600000).toISOString(),
    },
    {
      articleId: 'news_003',
      title: 'Strengthening India\'s Health Preparedness Framework',
      summary: 'New policy framework announced to strengthen district-level health infrastructure under the National Health Mission.',
      url: 'https://mohfw.gov.in/nhm/preparedness-2025',
      source: 'MoHFW',
      publishedAt: new Date(now.getTime() - 12 * 3600000).toISOString(),
    },
    {
      articleId: 'news_004',
      title: 'GBS outbreak across India — Ministry issues advisory',
      summary: 'Guillain-Barré Syndrome clusters detected in multiple states. Ministry advises healthcare workers on diagnosis and management.',
      url: 'https://mohfw.gov.in/alerts/gbs-advisory-2025',
      source: 'MoHFW',
      publishedAt: new Date(now.getTime() - 24 * 3600000).toISOString(),
    },
    {
      articleId: 'news_005',
      title: 'WHO releases updated dengue prevention guidelines for South Asia',
      summary: 'New WHO guidelines emphasize community-level vector control and early case detection for dengue prevention.',
      url: 'https://who.int/news/dengue-southasia-guidelines-2025',
      source: 'WHO',
      publishedAt: new Date(now.getTime() - 48 * 3600000).toISOString(),
    },
    {
      articleId: 'news_006',
      title: 'Record outbreaks of acute stomach flu highlight lurking health risks',
      summary: 'Epidemiologists warn of systemic risks as acute gastroenteritis cases spike across urban India.',
      url: 'https://mohfw.gov.in/news/gastroenteritis-spike-2025',
      source: 'MoHFW',
      publishedAt: new Date(now.getTime() - 72 * 3600000).toISOString(),
    },
  ];
}

seed();

// ─── Helper: distance calculation (Haversine) ─────────────────────────────────
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Sessions ─────────────────────────────────────────────────────────────────
const createSession = (data) => {
  store.sessions.set(data.token, data);
  return data;
};
const getSession = (token) => store.sessions.get(token) || null;
const deleteSession = (token) => store.sessions.delete(token);

// ─── Users ────────────────────────────────────────────────────────────────────
const createUser = (data) => {
  store.users.set(data.userId, data);
  return data;
};
const getUser = (userId) => store.users.get(userId) || null;
const getUserByPhone = (phone) => {
  for (const u of store.users.values()) {
    if (u.phoneNumber === phone) return u;
  }
  return null;
};
const updateUser = (userId, updates) => {
  const user = store.users.get(userId);
  if (!user) return null;
  const updated = { ...user, ...updates, lastActive: new Date().toISOString() };
  store.users.set(userId, updated);
  return updated;
};
const deleteUser = (userId) => store.users.delete(userId);
const listUsers = (filters = {}, pagination = { page: 1, limit: 20 }) => {
  let items = Array.from(store.users.values());
  if (filters.search) {
    const s = filters.search.toLowerCase();
    items = items.filter((u) => u.phoneNumber?.includes(s) || u.userId.includes(s));
  }
  if (filters.language) items = items.filter((u) => u.preferredLanguage === filters.language);
  if (filters.channel) items = items.filter((u) => u.channels?.includes(filters.channel));
  if (filters.onboardingComplete !== undefined) {
    items = items.filter((u) => u.onboardingComplete === filters.onboardingComplete);
  }
  const total = items.length;
  const start = (pagination.page - 1) * pagination.limit;
  return { items: items.slice(start, start + pagination.limit), total };
};

// ─── Queries ──────────────────────────────────────────────────────────────────
const saveQuery = (data) => {
  store.queries.set(data.queryId, data);
  return data;
};
const getQueryHistory = (userId, pagination = { limit: 20, before: null }) => {
  let items = Array.from(store.queries.values())
    .filter((q) => q.userId === userId)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  if (pagination.before) {
    items = items.filter((q) => new Date(q.timestamp) < new Date(pagination.before));
  }
  return { items: items.slice(0, pagination.limit), hasMore: items.length > pagination.limit };
};
const listQueries = (filters = {}, pagination = { page: 1, limit: 20 }) => {
  let items = Array.from(store.queries.values()).sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );
  if (filters.userId) items = items.filter((q) => q.userId === filters.userId);
  if (filters.intent) items = items.filter((q) => q.intent === filters.intent);
  if (filters.language) items = items.filter((q) => q.language === filters.language);
  if (filters.channel) items = items.filter((q) => q.channel === filters.channel);
  if (filters.flaggedOnly) items = items.filter((q) => q.safetyFlags?.length > 0);
  if (filters.from) items = items.filter((q) => new Date(q.timestamp) >= new Date(filters.from));
  if (filters.to) items = items.filter((q) => new Date(q.timestamp) <= new Date(filters.to));
  const total = items.length;
  const start = (pagination.page - 1) * pagination.limit;
  return { items: items.slice(start, start + pagination.limit), total };
};

// ─── Facilities ───────────────────────────────────────────────────────────────
const listFacilities = ({ lat, lng, type, radius = 10, language, limit = 20 } = {}) => {
  let results = store.facilities.map((f) => ({
    ...f,
    distance: lat && lng ? Math.round(haversineKm(lat, lng, f.location.latitude, f.location.longitude) * 10) / 10 : null,
  }));
  if (type) results = results.filter((f) => f.facilityType === type);
  if (language) results = results.filter((f) => f.languagesSupported.includes(language));
  if (lat && lng && radius) results = results.filter((f) => f.distance <= radius);
  if (lat && lng) results.sort((a, b) => a.distance - b.distance);
  return results.slice(0, limit);
};
const getFacility = (facilityId) => store.facilities.find((f) => f.facilityId === facilityId) || null;

// ─── Alerts ───────────────────────────────────────────────────────────────────
const createAlert = (data) => {
  store.alerts.set(data.alertId, data);
  return data;
};
const getAlert = (alertId) => store.alerts.get(alertId) || null;
const listAlerts = (filters = {}) => {
  let items = Array.from(store.alerts.values());
  if (filters.regionCode) {
    items = items.filter(
      (a) => a.regionCode === filters.regionCode || a.affectedRegions?.includes(filters.regionCode)
    );
  }
  if (filters.type) items = items.filter((a) => a.type === filters.type);
  if (filters.active !== undefined) items = items.filter((a) => a.active === filters.active);
  // Default: only non-expired
  if (filters.active !== false) {
    items = items.filter((a) => !a.expiresAt || new Date(a.expiresAt) > new Date());
  }
  return items.sort((a, b) => {
    const sev = { critical: 4, high: 3, medium: 2, low: 1 };
    return (sev[b.severity] || 0) - (sev[a.severity] || 0);
  });
};
const updateAlert = (alertId, updates) => {
  const alert = store.alerts.get(alertId);
  if (!alert) return null;
  const updated = { ...alert, ...updates };
  store.alerts.set(alertId, updated);
  return updated;
};
const deleteAlert = (alertId) => store.alerts.delete(alertId);
const expireAlerts = () => {
  let count = 0;
  const now = new Date();
  for (const [id, alert] of store.alerts.entries()) {
    if (alert.active && new Date(alert.expiresAt) < now) {
      store.alerts.set(id, { ...alert, active: false });
      count++;
    }
  }
  return count;
};

// ─── Outbreaks ────────────────────────────────────────────────────────────────
const createOutbreak = (data) => {
  store.outbreaks.set(data.outbreakId, data);
  return data;
};
const getOutbreak = (outbreakId) => store.outbreaks.get(outbreakId) || null;
const listOutbreaks = (filters = {}, pagination = { page: 1, limit: 20 }) => {
  let items = Array.from(store.outbreaks.values()).sort(
    (a, b) => new Date(b.reportedAt) - new Date(a.reportedAt)
  );
  if (filters.regionCode) items = items.filter((o) => o.regionCode === filters.regionCode);
  if (filters.disease) items = items.filter((o) => o.disease.toLowerCase().includes(filters.disease.toLowerCase()));
  if (filters.active !== undefined) items = items.filter((o) => o.active === filters.active);
  if (filters.severity) items = items.filter((o) => o.severity === filters.severity);
  const total = items.length;
  const start = (pagination.page - 1) * pagination.limit;
  return { items: items.slice(start, start + pagination.limit), total };
};
const updateOutbreak = (outbreakId, updates) => {
  const ob = store.outbreaks.get(outbreakId);
  if (!ob) return null;
  const updated = { ...ob, ...updates };
  store.outbreaks.set(outbreakId, updated);
  return updated;
};

// ─── Vaccination ──────────────────────────────────────────────────────────────
const getVaccinationProfile = (userId) => store.vaccinationProfiles.get(userId) || null;
const saveVaccinationProfile = (userId, profile) => {
  store.vaccinationProfiles.set(userId, profile);
  return profile;
};
const addVaccinationRecord = (userId, record, memberId = null) => {
  const profile = store.vaccinationProfiles.get(userId);
  if (!profile) return null;
  if (memberId) {
    const member = profile.familyMembers.find((m) => m.memberId === memberId);
    if (!member) return null;
    if (!member.vaccinations) member.vaccinations = [];
    member.vaccinations.push(record);
  } else {
    profile.vaccinations.push(record);
  }
  profile.updatedAt = new Date().toISOString();
  store.vaccinationProfiles.set(userId, profile);
  return record;
};
const deleteVaccinationRecord = (userId, vaccineId, memberId = null) => {
  const profile = store.vaccinationProfiles.get(userId);
  if (!profile) return false;
  if (memberId) {
    const member = profile.familyMembers.find((m) => m.memberId === memberId);
    if (member) member.vaccinations = (member.vaccinations || []).filter((v) => v.vaccineId !== vaccineId);
  } else {
    profile.vaccinations = profile.vaccinations.filter((v) => v.vaccineId !== vaccineId);
  }
  profile.updatedAt = new Date().toISOString();
  store.vaccinationProfiles.set(userId, profile);
  return true;
};
const getUpcomingVaccinations = (daysAhead = 7) => {
  const cutoff = new Date(Date.now() + daysAhead * 86400000);
  const results = [];
  for (const [userId, profile] of store.vaccinationProfiles.entries()) {
    for (const v of profile.upcomingVaccines || []) {
      if (!v.reminderSent && new Date(v.dueDate) <= cutoff) {
        results.push({ userId, vaccine: v });
      }
    }
  }
  return results;
};

// ─── Vaccination Drives ───────────────────────────────────────────────────────
const createDrive = (data) => {
  store.vaccinationDrives.set(data.driveId, data);
  return data;
};
const getDrive = (driveId) => store.vaccinationDrives.get(driveId) || null;
const listDrives = (filters = {}, pagination = { page: 1, limit: 20 }) => {
  let items = Array.from(store.vaccinationDrives.values()).sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );
  if (filters.regionCode) items = items.filter((d) => d.regionCode === filters.regionCode);
  if (filters.upcoming) items = items.filter((d) => new Date(d.date) >= new Date());
  if (filters.active !== undefined) items = items.filter((d) => d.active === filters.active);
  const total = items.length;
  const start = (pagination.page - 1) * pagination.limit;
  return { items: items.slice(start, start + pagination.limit), total };
};
const updateDrive = (driveId, updates) => {
  const drive = store.vaccinationDrives.get(driveId);
  if (!drive) return null;
  const updated = { ...drive, ...updates };
  store.vaccinationDrives.set(driveId, updated);
  return updated;
};

// ─── News ─────────────────────────────────────────────────────────────────────
const listNews = (filters = {}, pagination = { page: 1, limit: 10 }) => {
  let items = [...store.newsArticles].sort(
    (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)
  );
  const total = items.length;
  const start = (pagination.page - 1) * pagination.limit;
  return { items: items.slice(start, start + pagination.limit), total };
};

// ─── Stats ────────────────────────────────────────────────────────────────────
const getStats = () => {
  const queries = Array.from(store.queries.values());
  const today = new Date().toISOString().slice(0, 10);
  const queriesToday = queries.filter((q) => q.timestamp?.startsWith(today)).length;

  const channelBreakdown = { whatsapp: 0, sms: 0, web: 0, mobile: 0, voice: 0 };
  const languageBreakdown = { en: 0, hi: 0, kn: 0, te: 0 };
  let escalationCount = 0;
  let emergencyCount = 0;
  const categories = {};

  for (const q of queries) {
    if (q.channel && channelBreakdown[q.channel] !== undefined) channelBreakdown[q.channel]++;
    if (q.language && languageBreakdown[q.language] !== undefined) languageBreakdown[q.language]++;
    if (q.safetyFlags?.includes('emergency_symptoms')) emergencyCount++;
    if (q.safetyFlags?.length > 0) escalationCount++;
    if (q.intent) categories[q.intent] = (categories[q.intent] || 0) + 1;
  }

  return {
    totalUsers: store.users.size,
    activeUsersToday: Math.min(store.users.size, queriesToday),
    activeUsersWeek: store.users.size,
    totalQueries: queries.length,
    queriesToday,
    channelBreakdown,
    languageBreakdown,
    escalationCount,
    emergencyCount,
    topQueryCategories: Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([category, count]) => ({ category, count })),
  };
};

const getAnalytics = (period = '30d') => {
  const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
  const queries = Array.from(store.queries.values());
  const queriesByDay = [];
  const userGrowthByDay = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    queriesByDay.push({ date: d, count: queries.filter((q) => q.timestamp?.startsWith(d)).length });
    userGrowthByDay.push({ date: d, newUsers: 0, total: store.users.size });
  }

  const stats = getStats();
  return {
    period,
    queriesByDay,
    userGrowthByDay,
    breakdown: {
      byLanguage: stats.languageBreakdown,
      byChannel: stats.channelBreakdown,
      byIntent: { health_question: 0, facility_search: 0, vaccination_info: 0, emergency: 0, general_info: 0 },
      safetyEvents: {
        escalations: stats.escalationCount,
        emergencies: stats.emergencyCount,
        diagnosticBlocks: 0,
      },
    },
  };
};

module.exports = {
  // Sessions
  createSession, getSession, deleteSession,
  // Users
  createUser, getUser, getUserByPhone, updateUser, deleteUser, listUsers,
  // Queries
  saveQuery, getQueryHistory, listQueries,
  // Facilities
  listFacilities, getFacility,
  // Alerts
  createAlert, getAlert, listAlerts, updateAlert, deleteAlert, expireAlerts,
  // Outbreaks
  createOutbreak, getOutbreak, listOutbreaks, updateOutbreak,
  // Vaccination
  getVaccinationProfile, saveVaccinationProfile, addVaccinationRecord,
  deleteVaccinationRecord, getUpcomingVaccinations,
  // Drives
  createDrive, getDrive, listDrives, updateDrive,
  // News
  listNews,
  // Stats
  getStats, getAnalytics,
};
