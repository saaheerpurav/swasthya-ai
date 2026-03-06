/**
 * Scheduled Lambda handlers — triggered by EventBridge cron rules.
 * No HTTP routes. Export named handler functions.
 */

const db = require('../db/client');
const { notifyUser } = require('../services/notificationService');
const { publishSNS } = require('../services/notificationService');
const { expireAlerts } = require('../db/client');

/**
 * Daily 02:00 UTC — Update health knowledge base from WHO/MoHFW feeds.
 * Production: fetch real feeds, generate embeddings, update OpenSearch.
 */
const updateHealthData = async (event, context) => {
  console.log('[scheduler] updateHealthData started');
  const https = require('https');
  const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

  const fetchUrl = (url) => new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'SwasthyaAI/1.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });

  try {
    const sources = [
      {
        name: 'WHO Disease Outbreak News',
        url: 'https://www.who.int/rss-feeds/news-releases.xml',
        type: 'outbreak',
      },
      {
        name: 'MoHFW Press Releases',
        url: 'https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3',
        type: 'health_news',
      },
    ];

    const s3 = new S3Client({ region: process.env.S3_REGION || 'ap-south-1' });
    const bucket = process.env.S3_KNOWLEDGE_BUCKET || 'swasthyaai-knowledge';
    const results = [];

    for (const source of sources) {
      try {
        console.log(`[scheduler] Fetching ${source.name}...`);
        const xml = await fetchUrl(source.url);

        // Extract items from RSS XML (simple regex parse — no external deps)
        const items = [];
        const itemRegex = /<item>([\s\S]*?)<\/item>/g;
        let match;
        while ((match = itemRegex.exec(xml)) !== null) {
          const block = match[1];
          const title = (block.match(/<title[^>]*>([\s\S]*?)<\/title>/) || [])[1] || '';
          const desc = (block.match(/<description[^>]*>([\s\S]*?)<\/description>/) || [])[1] || '';
          const link = (block.match(/<link[^>]*>([\s\S]*?)<\/link>/) || [])[1] || '';
          const pubDate = (block.match(/<pubDate>([\s\S]*?)<\/pubDate>/) || [])[1] || '';
          if (title) {
            items.push({
              title: title.replace(/<!\[CDATA\[|\]\]>/g, '').trim(),
              description: desc.replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<[^>]+>/g, '').trim().slice(0, 500),
              link: link.trim(),
              pubDate: pubDate.trim(),
              source: source.name,
              type: source.type,
              fetchedAt: new Date().toISOString(),
            });
          }
        }

        console.log(`[scheduler] ${source.name}: ${items.length} items fetched`);

        if (items.length > 0) {
          const key = `feeds/${source.type}/${new Date().toISOString().split('T')[0]}.json`;
          await s3.send(new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: JSON.stringify({ source: source.name, fetchedAt: new Date().toISOString(), items }),
            ContentType: 'application/json',
          }));
          results.push({ source: source.name, items: items.length, key });
          console.log(`[scheduler] Stored ${items.length} items to s3://${bucket}/${key}`);
        }
      } catch (srcErr) {
        console.warn(`[scheduler] Failed to fetch ${source.name}:`, srcErr.message);
        results.push({ source: source.name, error: srcErr.message });
      }
    }

    const summary = `Health data update complete. Sources: ${results.map(r => `${r.source}: ${r.items || 'error'}`).join(', ')}`;
    console.log(`[scheduler] ${summary}`);
    await publishSNS('SwasthyaAI: Health Data Updated', summary).catch(() => {});
    return { statusCode: 200, body: summary };
  } catch (err) {
    console.error('[scheduler] updateHealthData error:', err);
    await publishSNS('SwasthyaAI: Health Data Update Failed', err.message).catch(() => {});
    throw err;
  }
};

/**
 * Daily 02:30 UTC (08:00 IST) — Send vaccination reminders.
 */
const sendVaccinationReminders = async (event, context) => {
  console.log('[scheduler] sendVaccinationReminders started');
  try {
    const upcoming = db.getUpcomingVaccinations(7);
    let sent = 0;

    for (const { userId, vaccine } of upcoming) {
      const user = db.getUser(userId);
      if (!user) continue;

      const lang = user.preferredLanguage || 'en';
      const messages = {
        en: `SwasthyaAI Reminder: ${vaccine.vaccineName} is due on ${vaccine.dueDate}. Please visit your nearest vaccination centre. Stay healthy!`,
        hi: `SwasthyaAI अनुस्मारक: ${vaccine.vaccineName} की तारीख ${vaccine.dueDate} है। कृपया अपने नजदीकी टीकाकरण केंद्र पर जाएं।`,
        kn: `SwasthyaAI ಜ್ಞಾಪನೆ: ${vaccine.vaccineName} ${vaccine.dueDate} ರಂದು ಬರಬೇಕಿದೆ. ದಯವಿಟ್ಟು ನಿಕಟ ಲಸಿಕೆ ಕೇಂದ್ರಕ್ಕೆ ಭೇಟಿ ನೀಡಿ.`,
        te: `SwasthyaAI రిమైండర్: ${vaccine.vaccineName} ${vaccine.dueDate} నాటికి చేయించుకోవాలి. దయచేసి సమీప టీకా కేంద్రానికి వెళ్ళండి.`,
      };

      await notifyUser(user, messages[lang] || messages.en);
      sent++;
    }

    console.log(`[scheduler] Vaccination reminders sent: ${sent}`);
    return { statusCode: 200, body: `Reminders sent: ${sent}` };
  } catch (err) {
    console.error('[scheduler] sendVaccinationReminders error:', err);
    await publishSNS('SwasthyaAI: Vaccination Reminders Failed', err.message);
    throw err;
  }
};

/**
 * Every hour — Expire stale alerts.
 */
const expireAlertsJob = async (event, context) => {
  console.log('[scheduler] expireAlerts started');
  try {
    const count = db.expireAlerts();
    console.log(`[scheduler] Expired ${count} alerts`);
    return { statusCode: 200, body: `Expired: ${count}` };
  } catch (err) {
    console.error('[scheduler] expireAlerts error:', err);
    throw err;
  }
};

/**
 * Every Monday 06:00 UTC — Generate weekly analytics report.
 */
const generateReport = async (event, context) => {
  console.log('[scheduler] generateReport started');
  try {
    const stats = db.getStats();
    const report = [
      `SwasthyaAI Weekly Report`,
      `Total Users: ${stats.totalUsers}`,
      `Queries This Week: ${stats.totalQueries}`,
      `Emergency Events: ${stats.emergencyCount}`,
      `Escalations: ${stats.escalationCount}`,
    ].join('\n');

    await publishSNS('SwasthyaAI: Weekly Report', report);
    console.log('[scheduler] Weekly report generated');
    return { statusCode: 200, body: 'Report generated' };
  } catch (err) {
    console.error('[scheduler] generateReport error:', err);
    throw err;
  }
};

module.exports = { updateHealthData, sendVaccinationReminders, expireAlertsJob, generateReport };
