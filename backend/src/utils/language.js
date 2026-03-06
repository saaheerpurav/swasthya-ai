// Maps our language codes to AWS service codes
const LANGUAGE_CODES = {
  en: { transcribe: 'en-IN', polly: 'en-IN', pollyVoice: 'Aditi', comprehend: 'en' },
  hi: { transcribe: 'hi-IN', polly: 'hi-IN', pollyVoice: 'Aditi', comprehend: 'hi' },
  kn: { transcribe: 'kn-IN', polly: 'kn-IN', pollyVoice: 'Aditi', comprehend: null },
  te: { transcribe: 'te-IN', polly: 'te-IN', pollyVoice: 'Aditi', comprehend: null },
};

const SUPPORTED_LANGUAGES = ['en', 'hi', 'kn', 'te'];

const mapToTranscribeCode = (lang) => LANGUAGE_CODES[lang]?.transcribe || 'en-IN';
const mapToPollyCode = (lang) => LANGUAGE_CODES[lang]?.polly || 'en-IN';
const mapToPollyVoice = (lang) => LANGUAGE_CODES[lang]?.pollyVoice || 'Aditi';

// Naive script-based language detection (pre-API fallback)
const detectScript = (text) => {
  if (!text) return 'en';
  const devanagari = /[\u0900-\u097F]/;
  const kannada = /[\u0C80-\u0CFF]/;
  const telugu = /[\u0C00-\u0C7F]/;
  if (kannada.test(text)) return 'kn';
  if (telugu.test(text)) return 'te';
  if (devanagari.test(text)) return 'hi';
  return 'en';
};

const isValidLanguage = (lang) => SUPPORTED_LANGUAGES.includes(lang);

const normalizeLanguage = (lang) => {
  if (!lang) return 'en';
  const l = lang.toLowerCase().slice(0, 2);
  return SUPPORTED_LANGUAGES.includes(l) ? l : 'en';
};

module.exports = {
  SUPPORTED_LANGUAGES,
  mapToTranscribeCode,
  mapToPollyCode,
  mapToPollyVoice,
  detectScript,
  isValidLanguage,
  normalizeLanguage,
};
