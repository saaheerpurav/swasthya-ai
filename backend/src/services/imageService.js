/**
 * Image analysis service — Amazon Rekognition + AI description.
 * Stub returns mock data when AWS is not configured.
 */

const { generateHealthResponse } = require('./aiService');
const { generateId } = require('../utils/crypto');

const AWS_CONFIGURED = process.env.REKOGNITION_REGION && process.env.AWS_ACCESS_KEY_ID;

const STUB_ANALYSIS = {
  labels: [
    { Name: 'Skin', Confidence: 98.5 },
    { Name: 'Rash', Confidence: 84.2 },
    { Name: 'Dermatitis', Confidence: 71.0 },
  ],
};

/**
 * Analyze an image file using Rekognition, then generate health education response.
 * @param {Buffer|string} imageInput - file buffer or file path
 * @param {string} language
 * @param {string} description - optional user text description
 */
const analyzeImage = async (imageInput, language = 'en', description = '') => {
  const analysisId = generateId('img_');

  let labels = [];

  if (!AWS_CONFIGURED) {
    console.log('[imageService] Rekognition stub — AWS not configured');
    labels = STUB_ANALYSIS.labels;
  } else {
    const { RekognitionClient, DetectLabelsCommand } = require('@aws-sdk/client-rekognition');
    const client = new RekognitionClient({ region: process.env.REKOGNITION_REGION });

    const imageBytes =
      typeof imageInput === 'string'
        ? require('fs').readFileSync(imageInput)
        : imageInput;

    const result = await client.send(
      new DetectLabelsCommand({
        Image: { Bytes: imageBytes },
        MaxLabels: 10,
        MinConfidence: 60,
      })
    );
    labels = result.Labels || [];
  }

  // Build a prompt from detected labels + user description
  const labelNames = labels.map((l) => l.Name).join(', ');
  const prompt = description
    ? `Image shows: ${labelNames}. User description: ${description}. Provide health education about these visible signs.`
    : `Image shows: ${labelNames}. Provide general health education about these visible signs and when to seek medical care.`;

  let aiResponse;
  try {
    aiResponse = await generateHealthResponse({ message: prompt, language });
  } catch {
    aiResponse = {
      content: 'Unable to analyze this image at this time. Please describe your symptoms in text.',
      disclaimers: ['Visual assessment cannot replace professional medical diagnosis.'],
      emergencyDetected: false,
      escalationRequired: false,
    };
  }

  // Check image quality from Rekognition labels
  const qualityIssue = labels.some((l) => l.Name === 'Blur' || l.Name === 'Dark')
    ? 'Image quality may be insufficient for accurate analysis. Please take a clearer photo in good lighting.'
    : null;

  return {
    analysisId,
    educationalInfo: aiResponse.content,
    detectedLabels: labels.map((l) => ({ name: l.Name, confidence: l.Confidence })),
    similarConditions: buildConditions(labels),
    concerningSymptoms: aiResponse.emergencyDetected,
    recommendations: buildRecommendations(labels),
    disclaimers: [
      'Visual assessment CANNOT replace professional medical diagnosis. Please consult a qualified doctor.',
      ...aiResponse.disclaimers,
    ],
    escalationRequired: aiResponse.escalationRequired,
    imageQualityIssue: qualityIssue,
  };
};

const buildConditions = (labels) => {
  const conditions = [];
  for (const l of labels) {
    if (l.Name === 'Rash' || l.Name === 'Dermatitis') {
      conditions.push({
        name: 'Contact Dermatitis',
        description: 'Skin reaction from contact with irritants or allergens.',
        whenToSeekCare: 'If rash spreads, blisters form, or breathing is affected.',
      });
    }
    if (l.Name === 'Wound' || l.Name === 'Cut') {
      conditions.push({
        name: 'Skin Wound',
        description: 'An open wound that may require cleaning and dressing.',
        whenToSeekCare: 'If wound is deep, heavily bleeding, or shows signs of infection.',
      });
    }
  }
  return conditions;
};

const buildRecommendations = (labels) => {
  const recs = ['Consult a qualified doctor for proper diagnosis.'];
  const hasRash = labels.some((l) => l.Name === 'Rash');
  if (hasRash) {
    recs.push('Avoid scratching the affected area.', 'Apply a cool compress for relief.');
  }
  return recs;
};

module.exports = { analyzeImage };
