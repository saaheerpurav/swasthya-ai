'use strict';

/**
 * AWS Lambda entry point.
 *
 * - HTTP traffic (API Gateway) → handled by the Express app via serverless-http
 * - Scheduled jobs (EventBridge) → dispatched to the scheduler handlers
 */

const serverlessHttp = require('serverless-http');
const app = require('./app');
const scheduler = require('./handlers/scheduler');

// Wrap Express app for API Gateway / ALB events
const httpHandler = serverlessHttp(app, {
  // Preserve raw body for Twilio signature verification
  request(request, event) {
    request.rawBody = event.body;
  },
});

/**
 * Main Lambda handler.
 *
 * EventBridge scheduled events have a `source` of "aws.events" and a
 * `detail-type` of "Scheduled Event". We dispatch on the rule ARN suffix
 * (last segment) so we don't need separate Lambda functions per job.
 *
 * Rule ARN suffix → handler mapping:
 *   swasthyaai-update-health-data        → updateHealthData
 *   swasthyaai-vaccination-reminders     → sendVaccinationReminders
 *   swasthyaai-expire-alerts             → expireAlertsJob
 *   swasthyaai-weekly-report             → generateReport
 */
module.exports.handler = async (event, context) => {
  // Scheduled event from EventBridge
  if (event.source === 'aws.events' && event['detail-type'] === 'Scheduled Event') {
    const arn = (event.resources || [])[0] || '';
    const ruleName = arn.split('/').pop() || '';

    console.log('[lambda] scheduled event, rule:', ruleName);

    if (ruleName.includes('update-health-data')) {
      return scheduler.updateHealthData(event, context);
    }
    if (ruleName.includes('vaccination-reminders')) {
      return scheduler.sendVaccinationReminders(event, context);
    }
    if (ruleName.includes('expire-alerts')) {
      return scheduler.expireAlertsJob(event, context);
    }
    if (ruleName.includes('weekly-report')) {
      return scheduler.generateReport(event, context);
    }

    console.warn('[lambda] unknown scheduled rule:', ruleName);
    return { statusCode: 200, body: 'Unknown rule — no-op' };
  }

  // All other events → HTTP handler (API Gateway / ALB)
  return httpHandler(event, context);
};
