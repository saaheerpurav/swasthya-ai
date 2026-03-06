'use strict';

/**
 * SwasthyaAI — AWS Seed Script
 * Re-seeds all DynamoDB tables with correctly-shaped data matching frontend types.
 * Run: node scripts/seed-aws.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');

const { DynamoDBClient, CreateTableCommand, DescribeTableCommand } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, BatchWriteCommand, ScanCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const { S3Client, CreateBucketCommand, PutObjectCommand, HeadBucketCommand, PutPublicAccessBlockCommand } = require('@aws-sdk/client-s3');
const { SNSClient, CreateTopicCommand } = require('@aws-sdk/client-sns');

const REGION = process.env.DYNAMODB_REGION || 'ap-south-1';
const dynamo = new DynamoDBClient({ region: REGION });
const docClient = DynamoDBDocumentClient.from(dynamo, { marshallOptions: { removeUndefinedValues: true } });
const s3 = new S3Client({ region: REGION });
const sns = new SNSClient({ region: REGION });

const T = {
  sessions:    process.env.DYNAMODB_SESSIONS_TABLE    || 'swasthyaai-sessions',
  users:       process.env.DYNAMODB_USERS_TABLE       || 'swasthyaai-users',
  queries:     process.env.DYNAMODB_QUERIES_TABLE     || 'swasthyaai-queries',
  facilities:  process.env.DYNAMODB_FACILITIES_TABLE  || 'swasthyaai-facilities',
  alerts:      process.env.DYNAMODB_ALERTS_TABLE      || 'swasthyaai-alerts',
  outbreaks:   process.env.DYNAMODB_OUTBREAKS_TABLE   || 'swasthyaai-outbreaks',
  vaxProfiles: process.env.DYNAMODB_VAX_PROFILES_TABLE || 'swasthyaai-vax-profiles',
  vaxDrives:   process.env.DYNAMODB_VAX_DRIVES_TABLE  || 'swasthyaai-vax-drives',
  news:        process.env.DYNAMODB_NEWS_TABLE        || 'swasthyaai-news',
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ─── Helpers ─────────────────────────────────────────────────────────────────

function daysAgo(n) {
  return new Date(Date.now() - n * 86400000).toISOString();
}
function daysFromNow(n) {
  return new Date(Date.now() + n * 86400000).toISOString();
}

async function clearTable(tableName) {
  const { Items = [] } = await docClient.send(new ScanCommand({ TableName: tableName }));
  for (let i = 0; i < Items.length; i += 25) {
    const chunk = Items.slice(i, i + 25).map((item) => ({
      DeleteRequest: { Key: Object.fromEntries(
        Object.entries(item).filter(([k]) => ['pk', 'sk'].includes(k))
      )}
    }));
    await docClient.send(new BatchWriteCommand({ RequestItems: { [tableName]: chunk } }));
  }
}

async function batchPut(tableName, items) {
  for (let i = 0; i < items.length; i += 25) {
    const chunk = items.slice(i, i + 25).map((Item) => ({ PutRequest: { Item } }));
    await docClient.send(new BatchWriteCommand({ RequestItems: { [tableName]: chunk } }));
  }
}

// ─── Table definitions ────────────────────────────────────────────────────────

const TABLE_DEFS = [
  {
    TableName: T.sessions,
    KeySchema: [{ AttributeName: 'pk', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'pk', AttributeType: 'S' }],
    BillingMode: 'PAY_PER_REQUEST',
  },
  {
    TableName: T.users,
    KeySchema: [{ AttributeName: 'pk', KeyType: 'HASH' }],
    AttributeDefinitions: [
      { AttributeName: 'pk', AttributeType: 'S' },
      { AttributeName: 'phoneNumber', AttributeType: 'S' },
    ],
    GlobalSecondaryIndexes: [{
      IndexName: 'phone-index',
      KeySchema: [{ AttributeName: 'phoneNumber', KeyType: 'HASH' }],
      Projection: { ProjectionType: 'ALL' },
    }],
    BillingMode: 'PAY_PER_REQUEST',
  },
  {
    TableName: T.queries,
    KeySchema: [
      { AttributeName: 'pk', KeyType: 'HASH' },
      { AttributeName: 'sk', KeyType: 'RANGE' },
    ],
    AttributeDefinitions: [
      { AttributeName: 'pk', AttributeType: 'S' },
      { AttributeName: 'sk', AttributeType: 'S' },
    ],
    BillingMode: 'PAY_PER_REQUEST',
  },
  {
    TableName: T.facilities,
    KeySchema: [{ AttributeName: 'pk', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'pk', AttributeType: 'S' }],
    BillingMode: 'PAY_PER_REQUEST',
  },
  {
    TableName: T.alerts,
    KeySchema: [{ AttributeName: 'pk', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'pk', AttributeType: 'S' }],
    BillingMode: 'PAY_PER_REQUEST',
  },
  {
    TableName: T.outbreaks,
    KeySchema: [{ AttributeName: 'pk', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'pk', AttributeType: 'S' }],
    BillingMode: 'PAY_PER_REQUEST',
  },
  {
    TableName: T.vaxProfiles,
    KeySchema: [{ AttributeName: 'pk', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'pk', AttributeType: 'S' }],
    BillingMode: 'PAY_PER_REQUEST',
  },
  {
    TableName: T.vaxDrives,
    KeySchema: [{ AttributeName: 'pk', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'pk', AttributeType: 'S' }],
    BillingMode: 'PAY_PER_REQUEST',
  },
  {
    TableName: T.news,
    KeySchema: [{ AttributeName: 'pk', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'pk', AttributeType: 'S' }],
    BillingMode: 'PAY_PER_REQUEST',
  },
];

async function ensureTable(def) {
  try {
    await dynamo.send(new DescribeTableCommand({ TableName: def.TableName }));
    console.log(`  ✓ Exists: ${def.TableName}`);
  } catch {
    await dynamo.send(new CreateTableCommand(def));
    process.stdout.write(`  ✦ Creating ${def.TableName}`);
    for (let i = 0; i < 30; i++) {
      await sleep(2000);
      const { Table } = await dynamo.send(new DescribeTableCommand({ TableName: def.TableName }));
      if (Table.TableStatus === 'ACTIVE') break;
      process.stdout.write('.');
    }
    console.log(' ACTIVE');
  }
}

// ─── Seed Data ────────────────────────────────────────────────────────────────

const FACILITIES = [
  { pk: 'fac_001', facilityId: 'fac_001', name: 'Rajiv Gandhi Government General Hospital', facilityType: 'hospital', location: { latitude: 12.9716, longitude: 77.5946, address: 'Seshadri Rd, Bengaluru 560001', regionCode: 'KA_BLR' }, contactInfo: { phoneNumber: '+918022213801' }, services: ['emergency', 'outpatient', 'inpatient', 'pediatrics', 'vaccination'], languagesSupported: ['en', 'kn', 'hi'], operatingHours: { emergency24x7: true, monday: { open: '08:00', close: '20:00', closed: false }, tuesday: { open: '08:00', close: '20:00', closed: false }, saturday: { open: '08:00', close: '14:00', closed: false }, sunday: { open: '09:00', close: '13:00', closed: false } }, lastUpdated: daysAgo(1) },
  { pk: 'fac_002', facilityId: 'fac_002', name: 'Victoria Hospital', facilityType: 'hospital', location: { latitude: 12.9620, longitude: 77.5744, address: 'Fort Rd, Bengaluru 560002', regionCode: 'KA_BLR' }, contactInfo: { phoneNumber: '+918022973200' }, services: ['emergency', 'surgery', 'maternity', 'vaccination'], languagesSupported: ['en', 'kn'], operatingHours: { emergency24x7: true, monday: { open: '09:00', close: '18:00', closed: false } }, lastUpdated: daysAgo(1) },
  { pk: 'fac_003', facilityId: 'fac_003', name: 'PHC Jayanagar', facilityType: 'phc', location: { latitude: 12.9299, longitude: 77.5833, address: '4th Block, Jayanagar, Bengaluru 560011', regionCode: 'KA_BLR' }, contactInfo: { phoneNumber: '+918026561234' }, services: ['outpatient', 'vaccination', 'maternal_health', 'child_health'], languagesSupported: ['en', 'kn', 'hi', 'te'], operatingHours: { emergency24x7: false, monday: { open: '09:00', close: '17:00', closed: false } }, lastUpdated: daysAgo(1) },
  { pk: 'fac_004', facilityId: 'fac_004', name: 'Apollo Pharmacy - Koramangala', facilityType: 'pharmacy', location: { latitude: 12.9352, longitude: 77.6245, address: '80 Feet Rd, Koramangala, Bengaluru 560034', regionCode: 'KA_BLR' }, contactInfo: { phoneNumber: '+918041234567' }, services: ['pharmacy', 'diagnostics'], languagesSupported: ['en', 'kn'], operatingHours: { emergency24x7: false, monday: { open: '08:00', close: '22:00', closed: false } }, lastUpdated: daysAgo(1) },
  { pk: 'fac_005', facilityId: 'fac_005', name: 'Urban PHC Yeshwanthpur', facilityType: 'vaccination_center', location: { latitude: 13.0213, longitude: 77.5510, address: 'Yeshwanthpur, Bengaluru 560022', regionCode: 'KA_BLR' }, contactInfo: { phoneNumber: '+918023560789' }, services: ['vaccination', 'child_health', 'maternal_health'], languagesSupported: ['en', 'kn', 'hi'], operatingHours: { emergency24x7: false, monday: { open: '09:00', close: '16:00', closed: false } }, lastUpdated: daysAgo(1) },
  { pk: 'fac_006', facilityId: 'fac_006', name: 'KEM Hospital Mumbai', facilityType: 'hospital', location: { latitude: 19.0042, longitude: 72.8413, address: 'Acharya Dhonde Marg, Parel, Mumbai 400012', regionCode: 'MH_MUM' }, contactInfo: { phoneNumber: '+912224136051' }, services: ['emergency', 'outpatient', 'inpatient', 'pediatrics', 'vaccination'], languagesSupported: ['en', 'hi'], operatingHours: { emergency24x7: true, monday: { open: '08:00', close: '20:00', closed: false } }, lastUpdated: daysAgo(1) },
  { pk: 'fac_007', facilityId: 'fac_007', name: 'AIIMS Bhubaneswar', facilityType: 'hospital', location: { latitude: 20.1444, longitude: 85.7144, address: 'Sijua, Bhubaneswar 751019', regionCode: 'OR_BHU' }, contactInfo: { phoneNumber: '+916742476789' }, services: ['emergency', 'outpatient', 'inpatient', 'research', 'vaccination'], languagesSupported: ['en', 'hi'], operatingHours: { emergency24x7: true, monday: { open: '08:00', close: '18:00', closed: false } }, lastUpdated: daysAgo(1) },
];

// Alerts — use `type` and `active` matching frontend type exactly
const ALERTS = [
  { pk: 'alr_001', alertId: 'alr_001', title: 'Dengue Outbreak Alert — Bengaluru', message: 'Rising dengue cases in Bengaluru. Eliminate stagnant water, use mosquito repellents, seek medical attention for high fever with joint pain.', type: 'outbreak', severity: 'high', regionCode: 'KA_BLR', affectedRegions: ['KA_BLR'], active: true, expiresAt: daysFromNow(30), createdAt: daysAgo(3) },
  { pk: 'alr_002', alertId: 'alr_002', title: 'Heavy Rainfall Health Advisory — Karnataka', message: 'Heavy rainfall across Karnataka. Avoid floodwater. Boil drinking water. Watch for leptospirosis symptoms.', type: 'weather', severity: 'medium', regionCode: 'KA_BLR', affectedRegions: ['KA_BLR', 'KA_MYS'], active: true, expiresAt: daysFromNow(7), createdAt: daysAgo(1) },
  { pk: 'alr_003', alertId: 'alr_003', title: 'Seasonal Influenza Advisory — Maharashtra', message: 'Influenza cases rising in Maharashtra. Get vaccinated. Wash hands frequently. Avoid crowded places if symptomatic.', type: 'health', severity: 'low', regionCode: 'MH_MUM', affectedRegions: ['MH_MUM', 'MH_PUN'], active: true, expiresAt: daysFromNow(30), createdAt: daysAgo(2) },
  { pk: 'alr_004', alertId: 'alr_004', title: 'Free Vaccination Camp — Yeshwanthpur', message: 'Free vaccination camp for children (0-5 years) at Urban PHC Yeshwanthpur. Vaccines: OPV, BCG, Pentavalent. Bring immunization card.', type: 'health', severity: 'low', regionCode: 'KA_BLR', affectedRegions: ['KA_BLR'], active: true, expiresAt: daysFromNow(7), createdAt: daysAgo(0) },
  { pk: 'alr_005', alertId: 'alr_005', title: 'Cholera Alert — Bhubaneswar', message: 'Cholera cases detected near Mahanadi river areas. Drink only boiled/treated water. Use ORS for diarrhoea. Seek immediate care.', type: 'outbreak', severity: 'high', regionCode: 'OR_BHU', affectedRegions: ['OR_BHU'], active: true, expiresAt: daysFromNow(14), createdAt: daysAgo(1) },
  { pk: 'alr_006', alertId: 'alr_006', title: 'Heatwave Alert — Rajasthan', message: 'Extreme heat wave forecast for Rajasthan. Stay hydrated, avoid outdoor activity 12–4 PM, watch for heat stroke symptoms.', type: 'weather', severity: 'high', regionCode: 'RJ_JAI', affectedRegions: ['RJ_JAI'], active: true, expiresAt: daysFromNow(5), createdAt: daysAgo(0) },
];

// Outbreaks — use `cases`, `trend`, `description`, `source`, `active` matching frontend type
const OUTBREAKS = [
  { pk: 'out_001', outbreakId: 'out_001', disease: 'Dengue Fever', regionCode: 'KA_BLR', cases: 342, severity: 'high', trend: 'up', description: 'Aedes mosquito-borne viral illness. Spike in cases in Whitefield, Marathahalli, BTM Layout, Jayanagar.', source: 'BBMP Health Department', reportedAt: daysAgo(3), active: true, affectedRegions: ['KA_BLR'], preventionMeasures: ['Eliminate stagnant water', 'Use mosquito nets', 'Wear full-sleeve clothing'] },
  { pk: 'out_002', outbreakId: 'out_002', disease: 'Seasonal Influenza (H3N2)', regionCode: 'MH_MUM', cases: 1280, severity: 'medium', trend: 'stable', description: 'H3N2 influenza strain circulating in Mumbai and Pune. Peak in dense residential areas.', source: 'Maharashtra Health Department', reportedAt: daysAgo(5), active: true, affectedRegions: ['MH_MUM', 'MH_PUN'], preventionMeasures: ['Annual flu vaccination', 'Hand hygiene', 'Avoid crowded spaces'] },
  { pk: 'out_003', outbreakId: 'out_003', disease: 'Cholera', regionCode: 'OR_BHU', cases: 89, severity: 'high', trend: 'up', description: 'Waterborne cholera cases near Mahanadi river slum areas. Linked to contaminated water supply.', source: 'Odisha State Health Department', reportedAt: daysAgo(2), active: true, affectedRegions: ['OR_BHU'], preventionMeasures: ['Boil drinking water', 'Proper sanitation', 'ORS for dehydration'] },
  { pk: 'out_004', outbreakId: 'out_004', disease: 'Malaria (P. falciparum)', regionCode: 'WB_KOL', cases: 210, severity: 'medium', trend: 'up', description: 'Plasmodium falciparum malaria cases in West Bengal, primarily in peri-urban areas near water bodies.', source: 'West Bengal Health Department', reportedAt: daysAgo(4), active: true, affectedRegions: ['WB_KOL'], preventionMeasures: ['Use insecticide-treated bed nets', 'Indoor residual spraying', 'Rapid diagnostic testing'] },
  { pk: 'out_005', outbreakId: 'out_005', disease: 'Leptospirosis', regionCode: 'MH_MUM', cases: 56, severity: 'medium', trend: 'up', description: 'Post-monsoon leptospirosis surge in flood-affected Mumbai areas. Linked to contaminated floodwater.', source: 'BMC Health Department', reportedAt: daysAgo(2), active: true, affectedRegions: ['MH_MUM'], preventionMeasures: ['Avoid wading in floodwater', 'Protective footwear', 'Early antibiotic treatment'] },
  { pk: 'out_006', outbreakId: 'out_006', disease: 'Typhoid Fever', regionCode: 'UP_LKN', cases: 178, severity: 'medium', trend: 'stable', description: 'Enteric fever cases linked to contaminated water supply in Lucknow\'s older urban areas.', source: 'UP State Health Department', reportedAt: daysAgo(6), active: true, affectedRegions: ['UP_LKN'], preventionMeasures: ['Typhoid vaccination', 'Safe water and food', 'Proper hand hygiene'] },
  { pk: 'out_007', outbreakId: 'out_007', disease: 'Scrub Typhus', regionCode: 'RJ_JAI', cases: 43, severity: 'low', trend: 'stable', description: 'Mite-borne rickettsial illness reported in Jaipur\'s rural outskirts. Responds well to doxycycline.', source: 'Rajasthan Health Department', reportedAt: daysAgo(7), active: true, affectedRegions: ['RJ_JAI'], preventionMeasures: ['Avoid scrub vegetation', 'Protective clothing', 'Insect repellent'] },
];

// Vaccination Drives — use `location`, `date`, `registeredCount`, `active` matching frontend type
const VAX_DRIVES = [
  { pk: 'drv_001', driveId: 'drv_001', name: 'Pulse Polio Immunization Day', vaccines: ['OPV', 'Vitamin A'], regionCode: 'KA_BLR', location: 'All Anganwadi Centers — Bengaluru', address: 'Multiple locations across Bengaluru', date: daysFromNow(5).slice(0, 10), time: '08:00–17:00', capacity: 5000, registeredCount: 1243, organizer: 'BBMP Immunization Program', active: true, createdAt: daysAgo(2) },
  { pk: 'drv_002', driveId: 'drv_002', name: 'COVID-19 & Influenza Booster Camp', vaccines: ['COVID-19 Booster', 'Influenza (Seasonal)'], regionCode: 'MH_MUM', location: 'BMC Ward Offices & Urban Health Centers — Mumbai', address: 'All 24 Ward Offices, Mumbai', date: daysFromNow(12).slice(0, 10), time: '09:00–18:00', capacity: 10000, registeredCount: 3870, organizer: 'BMC Health Department', active: true, createdAt: daysAgo(3) },
  { pk: 'drv_003', driveId: 'drv_003', name: 'School Immunization Drive', vaccines: ['TT', 'Vitamin A'], regionCode: 'KA_BLR', location: 'Government Primary Schools — Bengaluru Urban', address: 'All Govt. Primary Schools, Bengaluru', date: daysFromNow(8).slice(0, 10), time: '09:00–14:00', capacity: 8000, registeredCount: 2100, organizer: 'Karnataka State Immunization Program', active: true, createdAt: daysAgo(1) },
  { pk: 'drv_004', driveId: 'drv_004', name: 'Measles-Rubella Campaign', vaccines: ['MR (Measles-Rubella)'], regionCode: 'DL_DEL', location: 'All Primary Health Centres — Delhi', address: 'PHCs across all 11 Districts, Delhi', date: daysFromNow(15).slice(0, 10), time: '09:00–17:00', capacity: 15000, registeredCount: 5230, organizer: 'Delhi Health Department', active: true, createdAt: daysAgo(4) },
  { pk: 'drv_005', driveId: 'drv_005', name: 'BCG & Hepatitis B Birth Dose Camp', vaccines: ['BCG', 'Hepatitis B'], regionCode: 'TN_CHE', location: 'Government Maternity Hospitals — Chennai', address: 'IESH, Egmore & other Govt Maternity Hospitals', date: daysFromNow(3).slice(0, 10), time: '08:00–16:00', capacity: 2000, registeredCount: 890, organizer: 'Tamil Nadu Health & FW Department', active: true, createdAt: daysAgo(1) },
];

// Users
const USERS = [
  { pk: 'usr_demo001', userId: 'usr_demo001', phoneNumber: '+919619658633', preferredLanguage: 'en', channels: ['sms', 'whatsapp'], location: { latitude: 12.9716, longitude: 77.5946, regionCode: 'KA_BLR' }, privacySettings: { shareLocation: true, allowAlerts: true }, onboardingComplete: true, createdAt: daysAgo(30), lastActive: daysAgo(0) },
  { pk: 'usr_demo002', userId: 'usr_demo002', phoneNumber: '+919876543210', preferredLanguage: 'hi', channels: ['whatsapp'], location: { latitude: 19.0042, longitude: 72.8413, regionCode: 'MH_MUM' }, privacySettings: { shareLocation: true, allowAlerts: true }, onboardingComplete: true, createdAt: daysAgo(25), lastActive: daysAgo(1) },
  { pk: 'usr_demo003', userId: 'usr_demo003', phoneNumber: '+919845012345', preferredLanguage: 'kn', channels: ['sms'], location: { latitude: 12.9299, longitude: 77.5833, regionCode: 'KA_BLR' }, privacySettings: { shareLocation: false, allowAlerts: true }, onboardingComplete: true, createdAt: daysAgo(20), lastActive: daysAgo(2) },
  { pk: 'usr_demo004', userId: 'usr_demo004', phoneNumber: '+919731234567', preferredLanguage: 'te', channels: ['whatsapp'], location: { latitude: 17.3850, longitude: 78.4867, regionCode: 'TS_HYD' }, privacySettings: { shareLocation: true, allowAlerts: true }, onboardingComplete: true, createdAt: daysAgo(15), lastActive: daysAgo(0) },
  { pk: 'usr_demo005', userId: 'usr_demo005', phoneNumber: '+918765432109', preferredLanguage: 'en', channels: ['web', 'sms'], location: { latitude: 20.1444, longitude: 85.7144, regionCode: 'OR_BHU' }, privacySettings: { shareLocation: true, allowAlerts: true }, onboardingComplete: true, createdAt: daysAgo(10), lastActive: daysAgo(0) },
  { pk: 'usr_demo006', userId: 'usr_demo006', phoneNumber: '+917654321098', preferredLanguage: 'hi', channels: ['voice', 'sms'], location: { latitude: 26.8467, longitude: 80.9462, regionCode: 'UP_LKN' }, privacySettings: { shareLocation: true, allowAlerts: true }, onboardingComplete: true, createdAt: daysAgo(8), lastActive: daysAgo(1) },
];

// Queries — 30+ spread over 30 days with varied channels, languages, intents
const CHANNELS = ['whatsapp', 'sms', 'web', 'voice'];
const LANGS    = ['en', 'hi', 'kn', 'te'];
const INTENTS  = ['health_question', 'vaccination_info', 'facility_search', 'health_question', 'health_question', 'emergency'];
const TEXTS = {
  en: ['What are dengue symptoms?', 'How to prevent malaria?', 'Child vaccination schedule', 'Nearest hospital?', 'Fever and cough treatment', 'COVID booster details', 'How to treat dehydration?', 'Signs of typhoid fever', 'What is ORS?'],
  hi: ['डेंगू के लक्षण क्या हैं?', 'मलेरिया से बचाव कैसे करें?', 'बच्चे का टीकाकरण', 'बुखार का इलाज', 'निकटतम अस्पताल कहां है?'],
  kn: ['ಡೆಂಗ್ಯೂ ಲಕ್ಷಣಗಳು ಏನು?', 'ಮಲೇರಿಯಾ ತಡೆಗಟ್ಟಲು ಏನು ಮಾಡಬೇಕು', 'ಮಕ್ಕಳ ಲಸಿಕೆ ವೇಳಾಪಟ್ಟಿ'],
  te: ['డెంగీ లక్షణాలు ఏమిటి?', 'మలేరియా నివారణ ఎలా?', 'పిల్లల టీకా షెడ్యూల్'],
};

function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function generateQueries() {
  const queries = [];
  // Spread 45 queries over last 30 days
  for (let i = 0; i < 45; i++) {
    const dayOffset = Math.floor(Math.random() * 30);
    const ts = new Date(Date.now() - dayOffset * 86400000 - Math.random() * 3600000 * 8).toISOString();
    const lang = pickRandom(LANGS);
    const channel = pickRandom(CHANNELS);
    const intent = pickRandom(INTENTS);
    const texts = TEXTS[lang];
    const text = pickRandom(texts);
    const userId = pickRandom(USERS).userId;
    const qId = `qry_seed${String(i).padStart(3, '0')}`;
    queries.push({
      pk: userId,
      sk: `${ts}#${qId}`,
      queryId: qId,
      userId,
      channel,
      originalText: text,
      language: lang,
      intent,
      safetyFlags: intent === 'emergency' ? ['emergency'] : [],
      timestamp: ts,
      responsePreview: `SwasthyaAI response to: ${text.slice(0, 80)}`,
    });
  }
  return queries;
}

const NEWS = [
  { pk: 'nws_001', newsId: 'nws_001', title: 'India Reports 12% Decline in Malaria Cases in 2024', summary: 'India achieved a 12% reduction in malaria cases in 2024, attributed to expanded net distribution and indoor residual spraying programs.', content: 'The Ministry of Health & Family Welfare reported a significant decline in malaria incidence across high-burden states including Odisha, Jharkhand, and Chhattisgarh.', source: 'MoHFW India', category: 'disease_control', language: 'en', publishedAt: daysAgo(2), isActive: true, tags: ['malaria', 'prevention'] },
  { pk: 'nws_002', newsId: 'nws_002', title: 'WHO Updates Dengue Vaccination Guidelines', summary: 'WHO recommends Dengvaxia vaccine for seropositive individuals aged 9-45 in high-endemic areas.', content: 'Updated recommendations from WHO\'s SAGE on Immunization emphasize pre-vaccination screening to identify seropositive individuals.', source: 'WHO', category: 'vaccination', language: 'en', publishedAt: daysAgo(3), isActive: true, tags: ['dengue', 'vaccination'] },
  { pk: 'nws_003', newsId: 'nws_003', title: 'UIP Now Covers 12 Vaccine-Preventable Diseases', summary: 'Universal Immunization Programme expanded nationwide with PCV and rotavirus vaccines free at all government facilities.', content: 'India\'s UIP has expanded coverage with pneumococcal conjugate vaccine (PCV) and rotavirus vaccine nationwide.', source: 'MoHFW India', category: 'vaccination', language: 'en', publishedAt: daysAgo(1), isActive: true, tags: ['immunization', 'UIP', 'children'] },
  { pk: 'nws_004', newsId: 'nws_004', title: 'Monsoon Disease Alert: Leptospirosis Rise in Coastal Areas', summary: 'Health authorities report rising leptospirosis cases in coastal Karnataka and Kerala. Avoid wading in floodwater.', content: 'Monsoon-linked leptospirosis surge in flood-affected areas. Early antibiotic treatment is effective.', source: 'NCDC', category: 'disease_alert', language: 'en', publishedAt: daysAgo(1), isActive: true, tags: ['leptospirosis', 'monsoon'] },
  { pk: 'nws_005', newsId: 'nws_005', title: 'Ayushman Bharat: 500 Million Beneficiaries Enrolled', summary: 'PM-JAY has enrolled over 500 million beneficiaries, providing ₹5 lakh annual health coverage.', content: 'Ayushman Bharat PM-JAY crossed 500 million enrollment milestone. Coverage: ₹5 lakh per family per year for hospitalization.', source: 'NHA India', category: 'health_policy', language: 'en', publishedAt: daysAgo(4), isActive: true, tags: ['ayushman', 'insurance'] },
  { pk: 'nws_006', newsId: 'nws_006', title: 'ICMR Launches Long-COVID Study in Rural India', summary: 'Nationwide study across 12 states to understand post-COVID impact on rural populations with limited healthcare access.', content: 'ICMR initiated study across 12 states on long-COVID prevalence in rural India, assessing burden on primary healthcare.', source: 'ICMR', category: 'research', language: 'en', publishedAt: daysAgo(0), isActive: true, tags: ['COVID', 'research', 'rural'] },
];

const KNOWLEDGE_DOCS = [
  { key: 'who/dengue-prevention-en.txt', content: `WHO DENGUE PREVENTION GUIDELINES\nSource: WHO 2024\n\nDengue is spread by Aedes mosquitoes.\n\nSymptoms: High fever (40°C), severe headache, eye pain, muscle/joint pain, nausea, rash.\n\nPrevention:\n1. Eliminate stagnant water weekly\n2. Use DEET-based repellents\n3. Wear long-sleeved clothing\n4. Use mosquito nets\n\nSeek care if: fever >2 days, severe abdominal pain, bleeding gums, rapid breathing.\n\nEMERGENCY: Call 108 for severe dengue.\n\nDISCLAIMER: Educational only. Consult a doctor for personal health concerns.` },
  { key: 'who/dengue-prevention-hi.txt', content: `डेंगू रोकथाम दिशानिर्देश — WHO 2024\n\nलक्षण: तेज बुखार, सिरदर्द, जोड़ों में दर्द, त्वचा पर चकत्ते\n\nरोकथाम:\n1. घर के आसपास पानी जमा न होने दें\n2. मच्छर भगाने वाली क्रीम का उपयोग करें\n3. पूरी बाहें वाले कपड़े पहनें\n4. मच्छरदानी का उपयोग करें\n\nआपातकाल: 108 पर कॉल करें\n\nअस्वीकरण: यह केवल शैक्षिक जानकारी है।` },
  { key: 'mohfw/immunization-schedule-en.txt', content: `INDIA NATIONAL IMMUNIZATION SCHEDULE — MoHFW 2024\n\nAT BIRTH: BCG, OPV-0, Hepatitis B\n6 WEEKS: OPV-1, Pentavalent-1, PCV-1, Rotavirus-1, fIPV-1\n10 WEEKS: OPV-2, Pentavalent-2, PCV-2, Rotavirus-2\n14 WEEKS: OPV-3, Pentavalent-3, PCV-3, Rotavirus-3, fIPV-2\n9-12 MONTHS: MR Dose 1, Vitamin A Dose 1\n16-24 MONTHS: MR Dose 2, OPV Booster, DPT Booster, PCV Booster\n5-6 YEARS: DPT Booster 2\n10 & 16 YEARS: TT\n\nAll vaccines FREE at government health centres.\nHelpline: 1800-180-1104 (toll-free)` },
  { key: 'who/malaria-prevention-en.txt', content: `WHO MALARIA PREVENTION — India\n\nVector Control:\n- Insecticide-treated bed nets (LLINs)\n- Indoor residual spraying\n- Eliminate breeding sites\n\nSymptoms: Cyclical fever with chills, headache, muscle aches, nausea\n\nDiagnosis: Free RDTs at all PHCs\nTreatment: ACT for P.falciparum, Chloroquine+Primaquine for P.vivax (free at govt facilities)\n\nEMERGENCY: Severe malaria with altered consciousness → Call 108 immediately` },
  { key: 'mohfw/maternal-health-en.txt', content: `MATERNAL HEALTH GUIDELINES — MoHFW India\n\nFREE ANC VISITS: 1st (≤12 wks), 2nd (14-26 wks), 3rd (28-34 wks), 4th (36+ wks)\n\nFREE UNDER JSSK: Delivery, medicines, diagnostics, blood transfusion, transport\n\nPMMVY: ₹5000 for first live birth (conditions apply)\n\nDANGER SIGNS → Hospital immediately:\n- Heavy bleeding\n- Severe headache/blurred vision  \n- High fever (>38°C)\n- Reduced fetal movements\n- Fits or convulsions\n\nMaternal Helpline: 104 (toll-free)` },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🚀 SwasthyaAI AWS Seed Script (v2 — correct field names)\n');

  console.log('📦 Step 1: Ensuring DynamoDB tables...');
  for (const def of TABLE_DEFS) await ensureTable(def);
  console.log('');

  console.log('🧹 Step 2: Clearing old seed data...');
  for (const name of [T.facilities, T.alerts, T.outbreaks, T.vaxDrives, T.news, T.users, T.queries]) {
    await clearTable(name);
    process.stdout.write(`  cleared ${name}\n`);
  }
  console.log('');

  console.log('🌱 Step 3: Seeding data...');
  await batchPut(T.facilities, FACILITIES);    console.log(`  ✓ ${FACILITIES.length} facilities`);
  await batchPut(T.alerts, ALERTS);            console.log(`  ✓ ${ALERTS.length} alerts`);
  await batchPut(T.outbreaks, OUTBREAKS);      console.log(`  ✓ ${OUTBREAKS.length} outbreaks`);
  await batchPut(T.vaxDrives, VAX_DRIVES);     console.log(`  ✓ ${VAX_DRIVES.length} vaccination drives`);
  await batchPut(T.news, NEWS);                console.log(`  ✓ ${NEWS.length} news articles`);
  await batchPut(T.users, USERS);              console.log(`  ✓ ${USERS.length} users`);
  const queries = generateQueries();
  await batchPut(T.queries, queries);          console.log(`  ✓ ${queries.length} queries (spread over 30 days)`);
  console.log('');

  console.log('🪣 Step 4: S3 buckets...');
  for (const bucket of [process.env.S3_KNOWLEDGE_BUCKET, process.env.S3_USERDATA_BUCKET]) {
    try {
      await s3.send(new HeadBucketCommand({ Bucket: bucket }));
      console.log(`  ✓ Exists: ${bucket}`);
    } catch {
      await s3.send(new CreateBucketCommand({ Bucket: bucket, CreateBucketConfiguration: { LocationConstraint: REGION } }));
      await s3.send(new PutPublicAccessBlockCommand({ Bucket: bucket, PublicAccessBlockConfiguration: { BlockPublicAcls: true, IgnorePublicAcls: true, BlockPublicPolicy: true, RestrictPublicBuckets: true } }));
      console.log(`  ✦ Created: ${bucket}`);
    }
  }
  console.log('');

  console.log('📚 Step 5: Uploading knowledge docs...');
  for (const doc of KNOWLEDGE_DOCS) {
    await s3.send(new PutObjectCommand({ Bucket: process.env.S3_KNOWLEDGE_BUCKET, Key: doc.key, Body: doc.content, ContentType: 'text/plain; charset=utf-8' }));
    console.log(`  ✓ ${doc.key}`);
  }
  console.log('');

  console.log('📣 Step 6: SNS topic...');
  const { TopicArn } = await sns.send(new CreateTopicCommand({ Name: 'swasthyaai-admin-alerts' }));
  console.log(`  ✓ ${TopicArn}`);
  const envPath = path.join(__dirname, '../.env');
  let envContent = fs.readFileSync(envPath, 'utf8');
  envContent = envContent.replace(/^SNS_ADMIN_TOPIC_ARN=.*$/m, `SNS_ADMIN_TOPIC_ARN=${TopicArn}`);
  fs.writeFileSync(envPath, envContent);
  console.log('  ✓ Updated .env\n');

  console.log('✅ Seed complete!\n');
}

main().catch((err) => {
  console.error('\n❌ Seed failed:', err.message);
  process.exit(1);
});
