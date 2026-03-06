const express = require('express');
const multer = require('multer');
const { z } = require('zod');
const { requireAuth } = require('../middleware/auth');
const { success, error } = require('../utils/response');
const { transcribeAudio, synthesizeSpeech } = require('../services/voiceService');
const { generateHealthResponse } = require('../services/aiService');
const { generateId } = require('../utils/crypto');
const db = require('../db/client');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['audio/mp4', 'audio/m4a', 'audio/mpeg', 'audio/wav', 'audio/aac', 'audio/webm'];
    if (allowed.includes(file.mimetype) || file.originalname.match(/\.(m4a|mp3|wav|aac|mp4|webm)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported audio format'));
    }
  },
});

// POST /v1/voice/transcribe
router.post('/transcribe', requireAuth, upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) return error(res, 'VALIDATION_ERROR', 'No audio file provided', 400);
    const language = req.body.language || 'en';
    const result = await transcribeAudio(req.file.buffer, language);
    return success(res, result);
  } catch (err) {
    console.error('[voice] transcribe error:', err);
    if (err.message?.includes('unclear')) {
      return error(res, 'VOICE_UNCLEAR', 'Audio was unclear. Please speak slowly and clearly.', 422);
    }
    return error(res, 'VOICE_ERROR', 'Transcription failed', 503);
  }
});

// POST /v1/voice/synthesize
router.post('/synthesize', requireAuth, async (req, res) => {
  try {
    const { text, language } = req.body;
    if (!text) return error(res, 'VALIDATION_ERROR', 'text is required', 400);
    const result = await synthesizeSpeech(text.slice(0, 3000), language || 'en');
    return success(res, result);
  } catch (err) {
    console.error('[voice] synthesize error:', err);
    return error(res, 'VOICE_ERROR', 'Speech synthesis failed', 503);
  }
});

// POST /v1/voice/query  — full round-trip: audio → transcript → AI → TTS
router.post('/query', requireAuth, upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) return error(res, 'VALIDATION_ERROR', 'No audio file provided', 400);
    const language = req.body.language || 'en';
    const locationContext = req.body.locationContext ? JSON.parse(req.body.locationContext) : undefined;

    // Step 1: Transcribe
    const { transcript, detectedLanguage, confidence } = await transcribeAudio(req.file.buffer, language);

    if (!transcript || confidence < 0.3) {
      return error(res, 'VOICE_UNCLEAR', 'Audio was too unclear to transcribe. Please speak slowly or type your question.', 422);
    }

    // Step 2: AI response
    const aiResponse = await generateHealthResponse({
      message: transcript,
      language: detectedLanguage,
      locationContext,
    });

    // Step 3: Save query
    const queryId = generateId('qry_');
    db.saveQuery({
      queryId,
      userId: req.userId,
      channel: 'voice',
      originalText: transcript,
      language: detectedLanguage,
      intent: aiResponse.intent,
      safetyFlags: aiResponse.safetyFlags,
      timestamp: new Date().toISOString(),
      responsePreview: aiResponse.content.slice(0, 200),
    });

    // Step 4: TTS
    let audioResult = null;
    try {
      audioResult = await synthesizeSpeech(aiResponse.content, detectedLanguage);
    } catch {
      // TTS failure is non-fatal — return response without audio
    }

    return success(res, {
      transcript,
      detectedLanguage,
      response: {
        responseId: aiResponse.responseId,
        content: aiResponse.content,
        language: aiResponse.language,
        sources: aiResponse.sources,
        disclaimers: aiResponse.disclaimers,
        escalationRequired: aiResponse.escalationRequired,
        emergencyDetected: aiResponse.emergencyDetected,
      },
      audioUrl: audioResult?.audioUrl || null,
      audioDurationSeconds: audioResult?.durationSeconds || null,
    });
  } catch (err) {
    console.error('[voice] query error:', err);
    return error(res, 'VOICE_ERROR', 'Voice query processing failed', 503);
  }
});

module.exports = router;
