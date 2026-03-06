/**
 * Knowledge base service — injects relevant WHO/MoHFW health context into AI prompts.
 * Implements simplified RAG: keyword-based retrieval from structured health knowledge.
 * Production: would use OpenSearch vector search against S3-stored embeddings.
 */

// Curated health knowledge chunks sourced from WHO and MoHFW guidelines.
const KNOWLEDGE_BASE = [
  {
    id: 'vax-schedule-india',
    topics: ['vaccine', 'vaccination', 'immunization', 'टीका', 'ಲಸಿಕೆ', 'టీకా'],
    source: 'MoHFW Universal Immunization Programme',
    content: `India UIP vaccine schedule: BCG at birth, OPV at birth/6/10/14 weeks/16-24 months, Hepatitis B at birth/6/10/14 weeks, Penta (DPT+HepB+Hib) at 6/10/14 weeks, Rota at 6/10/14 weeks, IPV at 6/14 weeks, PCV at 6/14 weeks/9 months, fIPV at 9-12 months, MR at 9-12 months and 16-24 months, JE in endemic districts at 9-12 months, Vitamin A at 9 months then every 6 months till age 5, DPT booster at 16-24 months and 5-6 years, TT at 10 and 16 years. Adults: Td for pregnant women (2 doses), annual influenza for high-risk groups.`,
  },
  {
    id: 'malaria-prevention',
    topics: ['malaria', 'mosquito', 'मलेरिया', 'ಮಲೇರಿಯಾ', 'మలేరియా', 'fever', 'बुखार'],
    source: 'WHO Malaria Guidelines / NVBDCP',
    content: `Malaria prevention in India: Use insecticide-treated bed nets (ITNs). Apply mosquito repellent. Wear long-sleeved clothing at dusk and dawn. Eliminate standing water around homes. Symptoms: high fever with chills, sweating, headache appearing in cycles. Seek care within 24 hours of fever onset. Diagnosis by RDT or microscopy. Treatment per NVBDCP protocol (chloroquine for P.vivax, artemisinin combination for P.falciparum). Do not self-medicate.`,
  },
  {
    id: 'tb-awareness',
    topics: ['tuberculosis', 'TB', 'tb', 'cough', 'खांसी', 'ಕ್ಷಯ', 'క్షయ'],
    source: 'MoHFW National TB Elimination Programme',
    content: `TB key facts for India: TB is curable. Symptoms: persistent cough >2 weeks, blood in sputum, fever, night sweats, weight loss. Anyone with symptoms should get tested at the nearest government health facility — free diagnosis and treatment under NTEP. Treatment lasts 6 months minimum. Do not stop early. TB is airborne — cover mouth while coughing. Family members should be screened. Nikshay Poshan Yojana provides nutritional support.`,
  },
  {
    id: 'diabetes-prevention',
    topics: ['diabetes', 'sugar', 'मधुमेह', 'ಮಧುಮೇಹ', 'మధుమేహం', 'blood sugar', 'रक्त शर्करा'],
    source: 'WHO / MoHFW NPCDCS Guidelines',
    content: `Diabetes prevention and management: Type 2 diabetes is largely preventable. Key risk factors: obesity, physical inactivity, family history, age >40, gestational diabetes history. Prevention: maintain healthy weight, 150 min moderate exercise/week, balanced diet low in refined carbs and sugar, no tobacco. Symptoms: excessive thirst, frequent urination, fatigue, blurred vision, slow wound healing. Screen with fasting blood glucose or HbA1c. If diabetic: regular monitoring, medication adherence, foot care, annual eye/kidney checks.`,
  },
  {
    id: 'hypertension',
    topics: ['hypertension', 'blood pressure', 'रक्तचाप', 'ಅಧಿಕ ರಕ್ತದೊತ್ತಡ', 'రక్తపోటు', 'heart'],
    source: 'WHO / MoHFW NPCDCS',
    content: `High blood pressure (hypertension): Normal BP <120/80 mmHg. Hypertension >=140/90 mmHg. Often no symptoms — "silent killer". Risk factors: excess salt, obesity, alcohol, smoking, stress, family history, age. Prevention: reduce salt to <5g/day, exercise, healthy weight, limit alcohol, no tobacco, manage stress. Treatment: lifestyle changes + medication if prescribed. Take medication consistently even if feeling well. Regular monitoring important.`,
  },
  {
    id: 'maternal-health',
    topics: ['pregnancy', 'maternal', 'गर्भावस्था', 'ಗರ್ಭಾವಸ್ಥೆ', 'గర్భం', 'antenatal', 'delivery', 'breastfeeding'],
    source: 'MoHFW Reproductive and Child Health Programme',
    content: `Maternal health India: Register pregnancy early for antenatal care (ANC). Minimum 4 ANC visits. Take iron-folic acid (IFA) tablets daily throughout pregnancy. TT vaccination 2 doses. Institutional delivery recommended — free under Janani Suraksha Yojana. Danger signs: heavy bleeding, severe headache, vision problems, fits, no fetal movement — go to hospital immediately. Exclusive breastfeeding for 6 months. Postnatal check at 48 hours, 7 days, 6 weeks.`,
  },
  {
    id: 'diarrhea-ors',
    topics: ['diarrhea', 'diarrhoea', 'loose stools', 'dehydration', 'दस्त', 'ಅತಿಸಾರ', 'అతిసారం', 'ORS'],
    source: 'WHO / UNICEF ORS Guidelines',
    content: `Diarrhea management: Give ORS (oral rehydration solution) immediately. Make ORS: 1 litre clean water + 6 teaspoons sugar + half teaspoon salt. Continue breastfeeding in infants. Give zinc supplements for 14 days in children <5 years (reduces severity and future episodes). Continue feeding. Danger signs requiring hospital: blood in stool, high fever, vomiting everything, sunken eyes, very dry mouth, not passing urine. Diarrhea prevention: handwashing, safe water, sanitation.`,
  },
  {
    id: 'nutrition-children',
    topics: ['nutrition', 'malnutrition', 'stunting', 'wasting', 'पोषण', 'ಪೋಷಣೆ', 'పోషణ', 'child growth', 'ICDS'],
    source: 'MoHFW / ICDS / WHO Child Growth Standards',
    content: `Child nutrition India: Initiate breastfeeding within 1 hour of birth. Exclusive breastfeeding 6 months. Complementary feeding from 6 months: mashed foods, gradually thicker, 2-3 times/day increasing to 5 times. ICDS anganwadi centres provide supplementary nutrition. SAM (severe acute malnutrition): MUAC <11.5 cm or weight-for-height <-3 SD — refer to NRC. Vitamin A supplements every 6 months age 9 months to 5 years. Watch for growth faltering with monthly weighing at anganwadi.`,
  },
  {
    id: 'hand-hygiene',
    topics: ['handwashing', 'hygiene', 'sanitation', 'हाथ धोना', 'ಕೈ ತೊಳೆಯುವುದು', 'చేతులు కడగడం', 'clean water', 'ODF'],
    source: 'WHO Hand Hygiene Guidelines / Swachh Bharat Mission',
    content: `Hand hygiene: Wash hands with soap and water for >=20 seconds. Critical moments: before eating/cooking, after toilet use, after handling waste/animals, before breastfeeding, after changing diapers. If no soap/water, use alcohol-based hand rub (>=60% alcohol). Swachh Bharat Mission promotes ODF villages. Safe water: boil, filter, or use chlorination. Store water in clean, covered containers. Open defecation causes diarrhea, typhoid, polio, hepatitis A.`,
  },
  {
    id: 'mental-health-india',
    topics: ['mental health', 'depression', 'anxiety', 'stress', 'मानसिक स्वास्थ्य', 'ಮಾನಸಿಕ ಆರೋಗ್ಯ', 'మానసిక ఆరోగ్యం', 'suicide', 'counselling'],
    source: 'MoHFW National Mental Health Programme',
    content: `Mental health India: 1 in 7 Indians affected by mental disorders. Common conditions: depression, anxiety, substance use disorders. Stigma is a barrier — mental illness is treatable. Services: community health centres have mental health OPDs. NIMHANS helpline 080-46110007. iCall: 9152987821. Vandrevala Foundation: 1860-2662-345 (24/7). Treatment includes counselling and medication. If someone expresses suicidal thoughts — take seriously, listen without judgment, connect to professional help. Mental health is a right.`,
  },
];

/**
 * Retrieve relevant knowledge chunks for a query using keyword matching.
 * @param {string} query - User query text
 * @param {number} maxChunks - Maximum number of chunks to return
 * @returns {Array<{content: string, source: string}>}
 */
const retrieveKnowledge = (query, maxChunks = 2) => {
  if (!query) return [];
  const lower = query.toLowerCase();

  const scored = KNOWLEDGE_BASE.map(chunk => {
    let score = 0;
    for (const topic of chunk.topics) {
      if (lower.includes(topic.toLowerCase())) {
        score += topic.length > 4 ? 2 : 1; // longer keywords = higher confidence
      }
    }
    return { chunk, score };
  }).filter(({ score }) => score > 0);

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, maxChunks).map(({ chunk }) => ({
    content: chunk.content,
    source: chunk.source,
    id: chunk.id,
  }));
};

/**
 * Build a context-augmented prompt by injecting relevant knowledge.
 * @param {string} query
 * @returns {string|null} - Context string to prepend to system prompt, or null if no match
 */
const buildRagContext = (query) => {
  const chunks = retrieveKnowledge(query);
  if (chunks.length === 0) return null;

  const context = chunks.map(c => `[${c.source}]\n${c.content}`).join('\n\n');
  return `Relevant health knowledge from WHO and MoHFW guidelines:\n\n${context}\n\nUse the above information to provide accurate, grounded responses.`;
};

module.exports = { retrieveKnowledge, buildRagContext };
