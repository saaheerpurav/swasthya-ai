'use strict';

/**
 * Local development server — NOT used in Lambda.
 * Run: npm run dev
 */

require('dotenv').config();

const app = require('./app');

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`\n🚀 SwasthyaAI backend running at http://localhost:${PORT}`);
  console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`);
  console.log(`   DB mode     : ${process.env.NODE_ENV === 'production' ? 'DynamoDB' : 'in-memory mock'}`);
  console.log(`   OpenAI      : ${process.env.OPENAI_API_KEY ? 'configured' : 'STUB (set OPENAI_API_KEY)'}`);
  console.log(`   Twilio      : ${process.env.TWILIO_ACCOUNT_SID ? 'configured' : 'STUB (logs to console)'}`);
  console.log(`\nEndpoints:`);
  console.log(`   GET  http://localhost:${PORT}/health`);
  console.log(`   POST http://localhost:${PORT}/v1/auth/session`);
  console.log(`   POST http://localhost:${PORT}/v1/chat`);
  console.log(`   GET  http://localhost:${PORT}/v1/alerts`);
  console.log(`   GET  http://localhost:${PORT}/v1/admin/stats`);
  console.log(`   GET  http://localhost:${PORT}/v1/news\n`);
});
