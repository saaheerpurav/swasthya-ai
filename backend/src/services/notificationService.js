/**
 * Notification service — Twilio WhatsApp/SMS + Amazon SNS.
 * Logs to console in development when Twilio is not configured.
 */

const TWILIO_CONFIGURED = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN;
const SNS_CONFIGURED = process.env.SNS_REGION && process.env.SNS_ADMIN_TOPIC_ARN;

let twilioClient = null;
const getTwilio = () => {
  if (!twilioClient && TWILIO_CONFIGURED) {
    const twilio = require('twilio');
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
  return twilioClient;
};

/**
 * Send a WhatsApp message via Twilio.
 */
const sendWhatsApp = async (to, body) => {
  const client = getTwilio();
  if (!client) {
    console.log(`[notif] WhatsApp (stub) → ${to}: ${body.slice(0, 80)}...`);
    return { success: true, messageId: `stub_${Date.now()}` };
  }
  try {
    const msg = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${to}`,
      body,
    });
    return { success: true, messageId: msg.sid };
  } catch (err) {
    console.error('[notif] WhatsApp send error:', err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Send an SMS via Twilio.
 */
const sendSMS = async (to, body) => {
  const client = getTwilio();
  if (!client) {
    console.log(`[notif] SMS (stub) → ${to}: ${body.slice(0, 80)}...`);
    return { success: true, messageId: `stub_${Date.now()}` };
  }
  try {
    // Split messages over 1600 chars
    const chunks = [];
    for (let i = 0; i < body.length; i += 1600) chunks.push(body.slice(i, i + 1600));
    const results = [];
    for (const chunk of chunks) {
      const msg = await client.messages.create({
        from: process.env.TWILIO_SMS_NUMBER,
        to,
        body: chunk,
      });
      results.push(msg.sid);
    }
    return { success: true, messageIds: results };
  } catch (err) {
    console.error('[notif] SMS send error:', err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Publish an SNS alert to the admin topic.
 */
const publishSNS = async (subject, message) => {
  if (!SNS_CONFIGURED) {
    console.log(`[notif] SNS (stub): ${subject}`);
    return { success: true };
  }
  const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');
  const client = new SNSClient({ region: process.env.SNS_REGION });
  try {
    await client.send(
      new PublishCommand({
        TopicArn: process.env.SNS_ADMIN_TOPIC_ARN,
        Subject: subject,
        Message: message,
      })
    );
    return { success: true };
  } catch (err) {
    console.error('[notif] SNS error:', err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Send a push notification to a user via their preferred channel.
 */
const notifyUser = async (user, message) => {
  if (user.channels?.includes('whatsapp') && user.phoneNumber) {
    return sendWhatsApp(user.phoneNumber, message);
  }
  if (user.channels?.includes('sms') && user.phoneNumber) {
    return sendSMS(user.phoneNumber, message);
  }
  console.log(`[notif] No channel for user ${user.userId}`);
  return { success: false, error: 'No delivery channel' };
};

module.exports = { sendWhatsApp, sendSMS, publishSNS, notifyUser };
