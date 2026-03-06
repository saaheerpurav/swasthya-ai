/**
 * Medical safety enforcement.
 * Applied to every AI response before it is returned.
 */

const DISCLAIMER =
  'This is health education information only and is not a substitute for professional medical advice, diagnosis, or treatment. Please consult a qualified healthcare provider for personal medical concerns.';

const EMERGENCY_KEYWORDS = [
  'chest pain', 'difficulty breathing', 'breathlessness', 'loss of consciousness',
  'unconscious', 'severe bleeding', 'cannot breathe', 'heart attack', 'stroke',
  'paralysis', 'seizure', 'convulsion', 'choking', 'poisoning', 'overdose',
  'suicidal', 'saans nahi', 'sans nahi', 'dil ka dauraa', 'behosh',
];

const DIAGNOSTIC_KEYWORDS = [
  'do i have', 'am i suffering from', 'diagnose me', 'what disease do i have',
  'is this cancer', 'is this diabetes', 'tell me my disease', 'what is wrong with me',
  'mujhe kya bimari hai', 'mera diagnosis', 'mujhe kya hua hai',
];

const EMERGENCY_RESPONSE = {
  en: '🚨 EMERGENCY: Based on what you described, please call 108 (ambulance) or go to the nearest hospital immediately. Do not wait.',
  hi: '🚨 आपातकाल: आपके लक्षणों के आधार पर, कृपया तुरंत 108 (एम्बुलेंस) पर कॉल करें या नजदीकी अस्पताल जाएं।',
  kn: '🚨 ತುರ್ತು: ನಿಮ್ಮ ಲಕ್ಷಣಗಳ ಆಧಾರದ ಮೇಲೆ, ದಯವಿಟ್ಟು ತಕ್ಷಣ 108 ಗೆ ಕರೆ ಮಾಡಿ ಅಥವಾ ಹತ್ತಿರದ ಆಸ್ಪತ್ರೆಗೆ ಹೋಗಿ.',
  te: '🚨 అత్యవసరం: మీ లక్షణాల ఆధారంగా, దయచేసి వెంటనే 108కి కాల్ చేయండి లేదా సమీప ఆస్పత్రికి వెళ్ళండి.',
};

const DIAGNOSTIC_BLOCK_RESPONSE = {
  en: 'I can provide general health education, but I am not able to diagnose medical conditions. Please consult a qualified doctor for a proper diagnosis. If you are experiencing severe symptoms, call 108 or visit your nearest hospital.',
  hi: 'मैं सामान्य स्वास्थ्य जानकारी दे सकता हूं, लेकिन मैं बीमारियों का निदान नहीं कर सकता। कृपया उचित निदान के लिए एक योग्य डॉक्टर से परामर्श करें।',
  kn: 'ನಾನು ಸಾಮಾನ್ಯ ಆರೋಗ್ಯ ಮಾಹಿತಿ ನೀಡಬಲ್ಲೆ, ಆದರೆ ರೋಗಗಳನ್ನು ನಿರ್ಣಯಿಸಲು ನನಗೆ ಸಾಧ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ.',
  te: 'నేను సాధారణ ఆరోగ్య సమాచారం అందించగలను, కానీ వ్యాధులను నిర్ధారించలేను. దయచేసి అర్హత కలిగిన డాక్టర్‌ని సంప్రదించండి.',
};

const checkEmergency = (text) => {
  const lower = text.toLowerCase();
  return EMERGENCY_KEYWORDS.some((kw) => lower.includes(kw));
};

const checkDiagnosticRequest = (text) => {
  const lower = text.toLowerCase();
  return DIAGNOSTIC_KEYWORDS.some((kw) => lower.includes(kw));
};

/**
 * Classifies the intent of a health query.
 */
const classifyIntent = (text) => {
  const lower = text.toLowerCase();
  if (checkEmergency(lower)) return 'emergency';
  if (checkDiagnosticRequest(lower)) return 'diagnostic_request';
  if (/hospital|clinic|phc|doctor|near|nearby|location|address|where/.test(lower)) return 'facility_search';
  if (/vaccine|vaccination|immunization|टीका|ಲಸಿಕೆ|టీకా/.test(lower)) return 'vaccination_info';
  return 'health_question';
};

/**
 * Applies all safety rules to an AI-generated response.
 * Returns enriched response object.
 */
const applyFilters = ({ content, query, intent, language = 'en', confidenceScore = 1.0 }) => {
  const lang = ['en', 'hi', 'kn', 'te'].includes(language) ? language : 'en';
  const safetyFlags = [];
  let finalContent = content;
  let emergencyDetected = false;
  let escalationRequired = false;

  // Check for emergency in query or response
  if (intent === 'emergency' || checkEmergency(query || '') || checkEmergency(content || '')) {
    emergencyDetected = true;
    escalationRequired = true;
    safetyFlags.push('emergency_symptoms');
    finalContent = EMERGENCY_RESPONSE[lang];
  }

  // Block diagnostic requests
  else if (intent === 'diagnostic_request' || checkDiagnosticRequest(query || '')) {
    safetyFlags.push('diagnostic_request');
    finalContent = DIAGNOSTIC_BLOCK_RESPONSE[lang];
    escalationRequired = false;
  }

  // Low confidence → escalate
  if (confidenceScore < 0.4) escalationRequired = true;

  return {
    content: finalContent,
    disclaimers: [DISCLAIMER],
    safetyFlags,
    emergencyDetected,
    escalationRequired,
  };
};

module.exports = { applyFilters, checkEmergency, checkDiagnosticRequest, classifyIntent, DISCLAIMER };
