'use strict';

const express = require('express');
const { z } = require('zod');
const { requireAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { success, error } = require('../utils/response');
const { generateHealthResponse } = require('../services/aiService');
const { generateId } = require('../utils/crypto');
const db = require('../db/client');

const router = express.Router();

const ChatSchema = z.object({
  message:  z.string().min(1).max(2000),
  language: z.enum(['en', 'hi', 'kn', 'te']).optional(),
  locationContext: z.object({
    latitude:   z.number().optional(),
    longitude:  z.number().optional(),
    regionCode: z.string().optional(),
  }).optional(),
});

// POST /v1/chat
router.post('/', requireAuth, validate(ChatSchema), async (req, res) => {
  try {
    const { message, language, locationContext } = req.body;
    const userId = req.userId;

    // Fetch last 6 messages for context
    const historyResult = await db.getQueryHistory(userId, { limit: 6 });
    const historyItems = Array.isArray(historyResult) ? historyResult : (historyResult?.items ?? []);
    const history = historyItems.reverse().flatMap((q) => [
      { role: 'user',      content: q.originalText },
      { role: 'assistant', content: q.responsePreview || '' },
    ]);

    const aiResponse = await generateHealthResponse({ message, language, locationContext, history });

    const queryId = generateId('qry_');
    await db.saveQuery({
      queryId,
      userId,
      channel:         'mobile',
      originalText:    message,
      language:        aiResponse.language,
      intent:          aiResponse.intent,
      locationContext: locationContext || null,
      safetyFlags:     aiResponse.safetyFlags,
      timestamp:       new Date().toISOString(),
      responsePreview: aiResponse.content.slice(0, 200),
    });

    return success(res, {
      responseId:        aiResponse.responseId,
      queryId,
      content:           aiResponse.content,
      language:          aiResponse.language,
      detectedLanguage:  aiResponse.detectedLanguage,
      intent:            aiResponse.intent,
      sources:           aiResponse.sources,
      disclaimers:       aiResponse.disclaimers,
      escalationRequired: aiResponse.escalationRequired,
      emergencyDetected: aiResponse.emergencyDetected,
      suggestedActions:  aiResponse.suggestedActions,
    });
  } catch (err) {
    console.error('[chat] error:', err);
    return error(res, 'AI_SERVICE_ERROR', 'Failed to process query', 503);
  }
});

// GET /v1/chat/history
router.get('/history', requireAuth, async (req, res) => {
  try {
    const limit  = Math.min(parseInt(req.query.limit || '20', 10), 100);
    const before = req.query.before || null;

    const historyResult = await db.getQueryHistory(req.userId, { limit: limit * 2, before });
    const items   = Array.isArray(historyResult) ? historyResult : (historyResult?.items ?? []);
    const hasMore = historyResult?.hasMore ?? false;

    const messages = items.flatMap((q) => [
      { id: `${q.queryId}_user`, role: 'user',      content: q.originalText,     timestamp: q.timestamp, language: q.language },
      { id: `${q.queryId}_asst`, role: 'assistant', content: q.responsePreview || '', timestamp: q.timestamp, language: q.language, responseId: q.queryId },
    ]);

    return success(res, { messages: messages.slice(0, limit * 2), hasMore });
  } catch (err) {
    console.error('[chat/history] error:', err);
    return error(res, 'INTERNAL_ERROR', 'Failed to fetch history', 500);
  }
});

module.exports = router;
