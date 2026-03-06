/**
 * AI service — uses OpenAI for health query responses.
 * Used by WhatsApp/SMS/voice pipeline.
 * (Mobile app calls OpenAI directly.)
 */

const OpenAI = require('openai');
const { classifyIntent, applyFilters } = require('./safetyService');
const { detectScript, normalizeLanguage } = require('../utils/language');
const { generateId } = require('../utils/crypto');
const { buildRagContext } = require('./knowledgeService');

let openai = null;
const getClient = () => {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      return null; // use stub
    }
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
};

const SYSTEM_PROMPTS = {
  en: `You are SwasthyaAI, a public health education assistant for rural India.
Rules:
- Provide ONLY preventive healthcare education and general health information.
- NEVER diagnose any condition or prescribe medications.
- If asked for a diagnosis, say you cannot provide one and recommend seeing a doctor.
- If emergency symptoms are described (chest pain, difficulty breathing, loss of consciousness, severe bleeding, stroke signs), respond with ONLY: "EMERGENCY: Please call 108 or go to the nearest hospital immediately."
- Always end with: "⚠️ This is health education only — not a substitute for professional medical advice. Please consult a qualified doctor for personal health concerns."
- Keep responses under 200 words. Use simple language.
- Source from WHO and MoHFW guidelines only.
- Respond in English.`,

  hi: `आप SwasthyaAI हैं, भारत के ग्रामीण क्षेत्रों के लिए एक सार्वजनिक स्वास्थ्य शिक्षा सहायक।
नियम:
- केवल निवारक स्वास्थ्य देखभाल और सामान्य स्वास्थ्य जानकारी प्रदान करें।
- किसी भी बीमारी का निदान या दवाएं न बताएं।
- आपातकालीन लक्षणों पर केवल यह कहें: "आपातकाल: तुरंत 108 पर कॉल करें।"
- हमेशा जोड़ें: "⚠️ यह केवल स्वास्थ्य शिक्षा है — पेशेवर चिकित्सा सलाह का विकल्प नहीं।"
- 200 शब्दों से कम में उत्तर दें। हिंदी में जवाब दें।`,

  kn: `ನೀವು SwasthyaAI, ಭಾರತದ ಗ್ರಾಮೀಣ ಪ್ರದೇಶಗಳಿಗಾಗಿ ಸಾರ್ವಜನಿಕ ಆರೋಗ್ಯ ಶಿಕ್ಷಣ ಸಹಾಯಕ.
ನಿಯಮಗಳು:
- ಕೇವಲ ತಡೆಗಟ್ಟುವ ಆರೋಗ್ಯ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಮಾನ್ಯ ಆರೋಗ್ಯ ಮಾಹಿತಿ ನೀಡಿ.
- ರೋಗ ನಿರ್ಣಯ ಅಥವಾ ಔಷಧಿ ಶಿಫಾರಸು ಮಾಡಬೇಡಿ.
- ತುರ್ತು ಲಕ್ಷಣಗಳಿಗೆ: "ತುರ್ತು: ತಕ್ಷಣ 108 ಗೆ ಕರೆ ಮಾಡಿ."
- ಕೊನೆಯಲ್ಲಿ ಸೇರಿಸಿ: "⚠️ ಇದು ಆರೋಗ್ಯ ಶಿಕ್ಷಣ ಮಾತ್ರ — ವೈದ್ಯಕೀಯ ಸಲಹೆಯ ಪರ್ಯಾಯ ಅಲ್ಲ."
- 200 ಪದಗಳ ಒಳಗೆ ಕನ್ನಡದಲ್ಲಿ ಉತ್ತರಿಸಿ.`,

  te: `మీరు SwasthyaAI, భారత గ్రామీణ ప్రాంతాలకు ప్రజారోగ్య విద్య సహాయకులు.
నిబంధనలు:
- కేవలం నివారణ ఆరోగ్య విద్య మరియు సాధారణ ఆరోగ్య సమాచారం మాత్రమే అందించండి.
- వ్యాధి నిర్ధారణ లేదా మందులు సూచించవద్దు.
- అత్యవసర లక్షణాలకు: "అత్యవసరం: వెంటనే 108కి కాల్ చేయండి."
- చివరిలో చేర్చండి: "⚠️ ఇది ఆరోగ్య విద్య మాత్రమే — వైద్య సలహాకు ప్రత్యామ్నాయం కాదు."
- 200 పదాల్లోపు తెలుగులో సమాధానమివ్వండి.`,
};

const FALLBACK_RESPONSE = {
  en: "I'm currently unable to process your request due to a technical issue. Please try again in a moment. For urgent health concerns, please call 108 or visit your nearest healthcare facility.",
  hi: "तकनीकी समस्या के कारण मैं अभी आपके अनुरोध को संसाधित नहीं कर सकता। कृपया बाद में पुनः प्रयास करें।",
  kn: "ತಾಂತ್ರಿಕ ಸಮಸ್ಯೆಯಿಂದಾಗಿ ನಿಮ್ಮ ವಿನಂತಿಯನ್ನು ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಲು ಸಾಧ್ಯವಾಗುತ್ತಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
  te: "సాంకేతిక సమస్య కారణంగా మీ అభ్యర్థనను ప్రాసెస్ చేయలేకపోతున్నాను. దయచేసి మళ్ళీ ప్రయత్నించండి.",
};

/**
 * Generate a health education response for a text query.
 * Used by WhatsApp, SMS, and voice pipelines.
 */
const generateHealthResponse = async ({ message, language, locationContext, history = [] }) => {
  const lang = normalizeLanguage(language || detectScript(message));
  const intent = classifyIntent(message);
  const responseId = generateId('resp_');

  const client = getClient();

  let rawContent;
  if (!client) {
    // Stub: no OpenAI key configured
    rawContent = `[STUB] Health education response for: "${message}". Please configure OPENAI_API_KEY for real responses.`;
  } else {
    try {
      // RAG: inject relevant health knowledge context
      const ragContext = buildRagContext(message);
      const systemPrompt = ragContext
        ? `${SYSTEM_PROMPTS[lang] || SYSTEM_PROMPTS.en}\n\n${ragContext}`
        : (SYSTEM_PROMPTS[lang] || SYSTEM_PROMPTS.en);

      const messages = [
        { role: 'system', content: systemPrompt },
        ...history.slice(-6), // keep last 3 exchanges
        { role: 'user', content: message },
      ];

      const completion = await client.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages,
        max_tokens: 400,
        temperature: 0.2,
      });

      rawContent = completion.choices[0].message.content;
    } catch (err) {
      console.error('[aiService] OpenAI error:', err.message);
      rawContent = FALLBACK_RESPONSE[lang] || FALLBACK_RESPONSE.en;
    }
  }

  const safety = applyFilters({ content: rawContent, query: message, intent, language: lang });

  return {
    responseId,
    content: safety.content,
    language: lang,
    detectedLanguage: lang,
    intent,
    sources: [{ name: 'WHO Health Guidelines', url: 'https://www.who.int', type: 'WHO' }],
    disclaimers: safety.disclaimers,
    escalationRequired: safety.escalationRequired,
    emergencyDetected: safety.emergencyDetected,
    safetyFlags: safety.safetyFlags,
    suggestedActions: [],
  };
};

/**
 * Detect language from text (simple heuristic + optional OpenAI).
 */
const detectLanguage = (text) => {
  return detectScript(text);
};

module.exports = { generateHealthResponse, detectLanguage };
