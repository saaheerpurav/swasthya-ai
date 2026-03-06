import 'package:flutter/material.dart';

class EducationTopic {
  final String id;
  final String titleKey;
  final IconData icon;
  /// Optional image URL for the topic card (e.g. Unsplash). Used with web-safe image on education screen.
  final String imageUrl;

  const EducationTopic({
    required this.id,
    required this.titleKey,
    required this.icon,
    required this.imageUrl,
  });
}

const List<EducationTopic> EDUCATION_TOPICS = [
  EducationTopic(id: 'preventive', titleKey: 'preventive_healthcare', icon: Icons.shield, imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=300&fit=crop'),
  EducationTopic(id: 'diet', titleKey: 'healthy_diet', icon: Icons.restaurant, imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop'),
  EducationTopic(id: 'exercise', titleKey: 'exercise_fitness', icon: Icons.fitness_center, imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=300&fit=crop'),
  EducationTopic(id: 'mental', titleKey: 'mental_health', icon: Icons.psychology, imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&fit=crop'),
  EducationTopic(id: 'sleep', titleKey: 'sleep_hygiene', icon: Icons.bedtime, imageUrl: 'https://images.unsplash.com/photo-1541783245831-57d6fb0926d3?w=400&h=300&fit=crop'),
  EducationTopic(id: 'checkups', titleKey: 'health_checkups', icon: Icons.medical_services, imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&h=300&fit=crop'),
  EducationTopic(id: 'hydration', titleKey: 'hydration', icon: Icons.water_drop, imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&h=300&fit=crop'),
  EducationTopic(id: 'cessation', titleKey: 'smoking_alcohol', icon: Icons.smoke_free, imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop'),
  EducationTopic(id: 'hygiene', titleKey: 'hand_hygiene', icon: Icons.clean_hands, imageUrl: 'https://images.unsplash.com/photo-1584483766114-2cea6facdf57?w=400&h=300&fit=crop'),
];

const Map<String, String> EDUCATION_CONTENT_EN = {
  'preventive': '''
# Preventive Healthcare

Preventive healthcare means taking steps to avoid illness before it starts.

## Key practices
- **Vaccination**: Stay up to date with recommended vaccines for you and your family.
- **Screening**: Get regular checkups (blood pressure, blood sugar, etc.) as advised by your doctor.
- **Healthy lifestyle**: Eat a balanced diet, stay active, and get enough sleep.
- **Hygiene**: Wash hands with soap, use clean water, and maintain a clean environment.

Source: WHO and MoHFW guidelines. This is education only — consult a doctor for personal advice.
''',
  'diet': '''
# Healthy Diet & Nutrition

A balanced diet helps your body fight disease and stay strong.

## Tips
- Eat a variety of fruits and vegetables every day.
- Include whole grains, pulses, and legumes.
- Limit sugar, salt, and fried foods.
- Drink plenty of clean, safe water.
- Breastfeed infants exclusively for the first 6 months where possible.

Consult a doctor or nutritionist for personalised advice.
''',
  'exercise': '''
# Exercise & Fitness

Regular physical activity improves heart health, mood, and energy.

## Recommendations
- Aim for at least 30 minutes of moderate activity most days (e.g. walking, cycling).
- Start slowly if you are new to exercise.
- Choose activities you enjoy so you can stay consistent.
- If you have any health condition, ask your doctor before starting a new exercise routine.
''',
  'mental': '''
# Mental Health & Wellbeing

Mental health is as important as physical health.

## What helps
- Talk to someone you trust when you feel stressed or low.
- Stay connected with family and friends.
- Get enough sleep and rest.
- Limit alcohol and avoid substance use.
- If you have persistent sadness, anxiety, or thoughts of self-harm, please see a doctor or counsellor.

You are not alone. Seeking help is a sign of strength.
''',
  'sleep': '''
# Sleep Hygiene

Good sleep helps your body repair and your mind stay sharp.

## Tips
- Try to sleep and wake at similar times each day.
- Keep your sleeping area dark, quiet, and cool.
- Avoid screens (phone, TV) for at least an hour before bed.
- Limit caffeine in the afternoon and evening.
- If you have ongoing sleep problems, discuss with a doctor.
''',
  'checkups': '''
# Regular Health Checkups

Regular checkups help catch problems early.

## What to get checked
- Blood pressure (especially from age 30).
- Blood sugar (for diabetes risk).
- Eye and dental checkups.
- Cancer screenings as recommended for your age and gender (e.g. cervical, breast).

Your doctor can suggest a schedule based on your age and family history.
''',
  'hydration': '''
# Hydration & Water

Clean, safe water is essential for health.

## Why it matters
- Water helps digestion, temperature control, and removing waste.
- Drink plenty of clean water throughout the day (about 8 glasses if medically appropriate).
- In hot weather or when active, drink more.
- Use boiled or filtered water if tap water is not safe.
- Store water in clean, covered containers.
''',
  'cessation': '''
# Smoking & Alcohol Cessation

Quitting tobacco and limiting alcohol greatly improve health.

## Tobacco
- Quitting at any age has benefits. Ask your doctor for support or cessation programmes.
- Avoid second-hand smoke.

## Alcohol
- If you drink, do so in moderation. No alcohol is safest during pregnancy.
- Heavy drinking increases risk of liver disease, cancer, and accidents.
- If you find it hard to cut down, seek help from a doctor or counsellor.
''',
  'hygiene': '''
# Hand Hygiene & Sanitation

Clean hands and safe sanitation prevent many infections.

## Hand washing
- Wash hands with soap and water for at least 20 seconds.
- Key times: before eating, after using the toilet, after touching waste or animals.

## Sanitation
- Use toilets or latrines; avoid open defecation.
- Keep drinking water separate from waste water.
- Keep surroundings clean to reduce flies and pests.

These steps reduce diarrhoea, respiratory infections, and other illnesses.
''',
};

const Map<String, String> EDUCATION_CONTENT_HI = {
  'preventive': '''
# निवारक स्वास्थ्य देखभाल

निवारक स्वास्थ्य देखभाल का अर्थ है बीमारी होने से पहले उसे रोकने के उपाय करना।

## मुख्य अभ्यास
- **टीकाकरण**: अपने और अपने परिवार के लिए अनुशंसित टीके समय पर लगवाएं।
- **स्क्रीनिंग**: डॉक्टर की सलाह पर नियमित जांच (रक्तचाप, रक्त शर्करा) कराएं।
- **स्वस्थ जीवनशैली**: संतुलित आहार लें, सक्रिय रहें और पर्याप्त नींद लें।
- **स्वच्छता**: साबुन से हाथ धोएं, स्वच्छ पानी का उपयोग करें।

स्रोत: WHO और MoHFW दिशानिर्देश। यह केवल शिक्षा है — व्यक्तिगत सलाह के लिए डॉक्टर से परामर्श करें।
''',
  'diet': '''
# स्वस्थ आहार और पोषण

संतुलित आहार आपके शरीर को बीमारियों से लड़ने और मजबूत रहने में मदद करता है।

## सुझाव
- हर दिन विभिन्न फल और सब्जियां खाएं।
- साबुत अनाज, दाल और फलियां शामिल करें।
- चीनी, नमक और तले हुए खाद्य पदार्थों को सीमित करें।
- स्वच्छ, सुरक्षित पानी पर्याप्त मात्रा में पिएं।
- जहां संभव हो, शिशुओं को पहले 6 माह तक केवल स्तनपान कराएं।

व्यक्तिगत सलाह के लिए डॉक्टर या पोषण विशेषज्ञ से परामर्श करें।
''',
  'exercise': '''
# व्यायाम और फिटनेस

नियमित शारीरिक गतिविधि हृदय स्वास्थ्य, मनोदशा और ऊर्जा में सुधार करती है।

## अनुशंसाएं
- अधिकांश दिनों में कम से कम 30 मिनट की मध्यम गतिविधि (जैसे चलना, साइकिल चलाना) करें।
- यदि आप नए हैं तो धीरे-धीरे शुरू करें।
- ऐसी गतिविधियां चुनें जो आपको पसंद हों ताकि आप नियमित रह सकें।
- यदि कोई स्वास्थ्य स्थिति है, तो नया व्यायाम शुरू करने से पहले डॉक्टर से पूछें।
''',
  'mental': '''
# मानसिक स्वास्थ्य और कल्याण

मानसिक स्वास्थ्य शारीरिक स्वास्थ्य जितना ही महत्वपूर्ण है।

## क्या मदद करता है
- जब आप तनाव में हों तो किसी विश्वसनीय व्यक्ति से बात करें।
- परिवार और दोस्तों के साथ जुड़े रहें।
- पर्याप्त नींद और आराम लें।
- शराब सीमित करें और नशीली दवाओं से बचें।
- यदि लगातार उदासी, चिंता, या आत्मघाती विचार हों, तो डॉक्टर से मिलें।

आप अकेले नहीं हैं। मदद मांगना ताकत की निशानी है।
''',
  'sleep': '''
# नींद की स्वच्छता

अच्छी नींद आपके शरीर को ठीक करने और मन को तेज रखने में मदद करती है।

## सुझाव
- हर दिन एक ही समय पर सोने और जागने की कोशिश करें।
- सोने की जगह अंधेरी, शांत और ठंडी रखें।
- सोने से कम से कम एक घंटे पहले स्क्रीन (फोन, टीवी) से बचें।
- दोपहर और शाम को कैफीन सीमित करें।
- यदि नींद की समस्या बनी रहे तो डॉक्टर से बात करें।
''',
  'checkups': '''
# नियमित स्वास्थ्य जांच

नियमित जांच से समस्याओं का जल्दी पता चलता है।

## क्या जांचें
- रक्तचाप (विशेष रूप से 30 वर्ष की आयु से)।
- रक्त शर्करा (मधुमेह के जोखिम के लिए)।
- आंख और दांत की जांच।
- आयु और लिंग के अनुसार कैंसर स्क्रीनिंग (जैसे गर्भाशय ग्रीवा, स्तन)।

आपके डॉक्टर आपकी आयु और पारिवारिक इतिहास के आधार पर कार्यक्रम सुझा सकते हैं।
''',
  'hydration': '''
# जलयोजन और पानी

स्वच्छ, सुरक्षित पानी स्वास्थ्य के लिए आवश्यक है।

## यह क्यों महत्वपूर्ण है
- पानी पाचन, तापमान नियंत्रण और अपशिष्ट निकालने में मदद करता है।
- पूरे दिन पर्याप्त स्वच्छ पानी पिएं (लगभग 8 गिलास)।
- गर्म मौसम में या सक्रिय होने पर अधिक पिएं।
- यदि नल का पानी सुरक्षित न हो तो उबला या फ़िल्टर किया हुआ पानी उपयोग करें।
- पानी साफ, ढके बर्तनों में संग्रहित करें।
''',
  'cessation': '''
# धूम्रपान और शराब छोड़ना

तंबाकू छोड़ना और शराब सीमित करना स्वास्थ्य में बड़ा सुधार लाता है।

## तंबाकू
- किसी भी उम्र में छोड़ने के फायदे हैं। डॉक्टर से सहायता या छोड़ने के कार्यक्रमों के बारे में पूछें।
- सेकेंड-हैंड धुएं से बचें।

## शराब
- यदि पीते हैं, तो सीमित मात्रा में। गर्भावस्था में कोई शराब सुरक्षित नहीं।
- अधिक शराब पीने से लिवर रोग, कैंसर और दुर्घटनाओं का खतरा बढ़ता है।
- यदि कम करना मुश्किल लगे, तो डॉक्टर या परामर्शदाता से मदद लें।
''',
  'hygiene': '''
# हाथ की स्वच्छता और स्वच्छता

साफ हाथ और सुरक्षित स्वच्छता कई संक्रमणों को रोकती है।

## हाथ धोना
- साबुन और पानी से कम से कम 20 सेकंड तक हाथ धोएं।
- महत्वपूर्ण समय: खाने से पहले, शौचालय के बाद, कचरे या जानवरों को छूने के बाद।

## स्वच्छता
- शौचालय या लैट्रिन का उपयोग करें; खुले में शौच से बचें।
- पेयजल को अपशिष्ट जल से अलग रखें।
- मक्खियों और कीटों को कम करने के लिए आसपास साफ रखें।

ये उपाय दस्त, श्वसन संक्रमण और अन्य बीमारियों को कम करते हैं।
''',
};

const Map<String, String> EDUCATION_CONTENT_KN = {
  'preventive': '''
# ತಡೆಗಟ್ಟುವ ಆರೋಗ್ಯ ರಕ್ಷಣೆ

ತಡೆಗಟ್ಟುವ ಆರೋಗ್ಯ ರಕ್ಷಣೆ ಎಂದರೆ ಅನಾರೋಗ್ಯ ಪ್ರಾರಂಭವಾಗುವ ಮೊದಲೇ ಅದನ್ನು ತಡೆಯಲು ಕ್ರಮ ತೆಗೆದುಕೊಳ್ಳುವುದು.

## ಮುಖ್ಯ ಅಭ್ಯಾಸಗಳು
- **ಲಸಿಕೆ**: ನಿಮಗೆ ಮತ್ತು ನಿಮ್ಮ ಕುಟುಂಬಕ್ಕೆ ಶಿಫಾರಸು ಮಾಡಿದ ಲಸಿಕೆಗಳನ್ನು ಸಮಯಕ್ಕೆ ಹಾಕಿಸಿ.
- **ಸ್ಕ್ರೀನಿಂಗ್**: ವೈದ್ಯರ ಸಲಹೆಯ ಮೇರೆಗೆ ನಿಯಮಿತ ತಪಾಸಣೆ (ರಕ್ತದೊತ್ತಡ, ರಕ್ತದ ಸಕ್ಕರೆ) ಮಾಡಿಸಿ.
- **ಆರೋಗ್ಯಕರ ಜೀವನಶೈಲಿ**: ಸಮತೋಲಿತ ಆಹಾರ ತಿನ್ನಿ, ಸಕ್ರಿಯರಾಗಿರಿ, ಸಾಕಷ್ಟು ನಿದ್ದೆ ಮಾಡಿ.
- **ಶುಚಿತ್ವ**: ಸೋಪಿನಿಂದ ಕೈ ತೊಳೆಯಿರಿ, ಸ್ವಚ್ಛ ನೀರು ಬಳಸಿ.

ಮೂಲ: WHO ಮತ್ತು MoHFW ಮಾರ್ಗದರ್ಶಿಗಳು. ಇದು ಕೇವಲ ಶಿಕ್ಷಣ — ವೈಯಕ್ತಿಕ ಸಲಹೆಗಾಗಿ ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ.
''',
  'diet': '''
# ಆರೋಗ್ಯಕರ ಆಹಾರ ಮತ್ತು ಪೋಷಣೆ

ಸಮತೋಲಿತ ಆಹಾರ ನಿಮ್ಮ ದೇಹಕ್ಕೆ ರೋಗಗಳನ್ನು ಎದುರಿಸಲು ಮತ್ತು ಬಲಶಾಲಿಯಾಗಿರಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ.

## ಸಲಹೆಗಳು
- ಪ್ರತಿದಿನ ವಿವಿಧ ಹಣ್ಣುಗಳು ಮತ್ತು ತರಕಾರಿಗಳನ್ನು ತಿನ್ನಿ.
- ಧಾನ್ಯಗಳು, ಬೇಳೆ ಮತ್ತು ದ್ವಿದಳ ಧಾನ್ಯಗಳನ್ನು ಸೇರಿಸಿ.
- ಸಕ್ಕರೆ, ಉಪ್ಪು ಮತ್ತು ಕರಿದ ಆಹಾರವನ್ನು ಮಿತಗೊಳಿಸಿ.
- ಸ್ವಚ್ಛ, ಸುರಕ್ಷಿತ ನೀರನ್ನು ಸಾಕಷ್ಟು ಕುಡಿಯಿರಿ.
- ಸಾಧ್ಯವಾದಲ್ಲಿ ಶಿಶುಗಳಿಗೆ ಮೊದಲ 6 ತಿಂಗಳು ಮಾತ್ರ ಎದೆ ಹಾಲು ಕೊಡಿ.

ವ್ಯಕ್ತಿಗತ ಸಲಹೆಗಾಗಿ ವೈದ್ಯರು ಅಥವಾ ಪೋಷಣಾ ತಜ್ಞರನ್ನು ಸಂಪರ್ಕಿಸಿ.
''',
  'exercise': '''
# ವ್ಯಾಯಾಮ ಮತ್ತು ದೈಹಿಕ ಸಾಮರ್ಥ್ಯ

ನಿಯಮಿತ ದೈಹಿಕ ಚಟುವಟಿಕೆ ಹೃದಯ ಆರೋಗ್ಯ, ಮನಸ್ಸು ಮತ್ತು ಶಕ್ತಿಯನ್ನು ಸುಧಾರಿಸುತ್ತದೆ.

## ಶಿಫಾರಸುಗಳು
- ಹೆಚ್ಚಿನ ದಿನಗಳಲ್ಲಿ ಕನಿಷ್ಠ 30 ನಿಮಿಷ ಮಧ್ಯಮ ಚಟುವಟಿಕೆ (ನಡಿಗೆ, ಸೈಕ್ಲಿಂಗ್) ಮಾಡಿ.
- ಹೊಸಬರಾಗಿದ್ದರೆ ನಿಧಾನವಾಗಿ ಪ್ರಾರಂಭಿಸಿ.
- ನಿಮಗೆ ಇಷ್ಟವಾದ ಚಟುವಟಿಕೆಗಳನ್ನು ಆರಿಸಿ ಆಗ ನಿರಂತರವಾಗಿ ಮಾಡಬಹುದು.
- ಯಾವುದಾದರೂ ಆರೋಗ್ಯ ಸಮಸ್ಯೆ ಇದ್ದರೆ ಹೊಸ ವ್ಯಾಯಾಮ ಪ್ರಾರಂಭಿಸುವ ಮೊದಲು ವೈದ್ಯರನ್ನು ಕೇಳಿ.
''',
  'mental': '''
# ಮಾನಸಿಕ ಆರೋಗ್ಯ ಮತ್ತು ಕ್ಷೇಮ

ಮಾನಸಿಕ ಆರೋಗ್ಯ ದೈಹಿಕ ಆರೋಗ್ಯದಷ್ಟೇ ಮುಖ್ಯ.

## ಯಾವುದು ಸಹಾಯ ಮಾಡುತ್ತದೆ
- ಒತ್ತಡ ಅಥವಾ ದುಃಖ ಅನಿಸಿದಾಗ ನಂಬಿಕಸ್ಥ ವ್ಯಕ್ತಿಯೊಂದಿಗೆ ಮಾತನಾಡಿ.
- ಕುಟುಂಬ ಮತ್ತು ಸ್ನೇಹಿತರೊಂದಿಗೆ ಸಂಪರ್ಕದಲ್ಲಿರಿ.
- ಸಾಕಷ್ಟು ನಿದ್ದೆ ಮತ್ತು ವಿಶ್ರಾಂತಿ ತೆಗೆದುಕೊಳ್ಳಿ.
- ಮದ್ಯಪಾನ ಮಿತಗೊಳಿಸಿ ಮತ್ತು ಮಾದಕ ದ್ರವ್ಯ ಸೇವನೆ ತಪ್ಪಿಸಿ.
- ನಿರಂತರ ದುಃಖ, ಆತಂಕ ಅಥವಾ ಆತ್ಮಹತ್ಯೆ ಯೋಚನೆ ಇದ್ದರೆ ವೈದ್ಯರನ್ನು ಭೇಟಿ ಮಾಡಿ.

ನೀವು ಒಂಟಿಯಲ್ಲ. ಸಹಾಯ ಕೇಳುವುದು ಶಕ್ತಿಯ ಚಿಹ್ನೆ.
''',
  'sleep': '''
# ನಿದ್ದೆಯ ಶುಚಿತ್ವ

ಉತ್ತಮ ನಿದ್ದೆ ನಿಮ್ಮ ದೇಹವನ್ನು ದುರಸ್ತಿ ಮಾಡಲು ಮತ್ತು ಮನಸ್ಸನ್ನು ತೀಕ್ಷ್ಣವಾಗಿರಿಸಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ.

## ಸಲಹೆಗಳು
- ಪ್ರತಿದಿನ ಒಂದೇ ಸಮಯಕ್ಕೆ ಮಲಗಲು ಮತ್ತು ಎಚ್ಚರಗೊಳ್ಳಲು ಪ್ರಯತ್ನಿಸಿ.
- ಮಲಗುವ ಜಾಗವನ್ನು ಕತ್ತಲೆ, ಶಾಂತ ಮತ್ತು ತಂಪಾಗಿ ಇಡಿ.
- ಮಲಗುವ ಮೊದಲು ಕನಿಷ್ಠ ಒಂದು ಗಂಟೆ ಸ್ಕ್ರೀನ್ (ಫೋನ್, ಟಿವಿ) ತಪ್ಪಿಸಿ.
- ಮಧ್ಯಾಹ್ನ ಮತ್ತು ಸಂಜೆ ಕೆಫೀನ್ ಮಿತಗೊಳಿಸಿ.
- ನಿರಂತರ ನಿದ್ದೆ ಸಮಸ್ಯೆ ಇದ್ದರೆ ವೈದ್ಯರೊಂದಿಗೆ ಮಾತನಾಡಿ.
''',
  'checkups': '''
# ನಿಯಮಿತ ಆರೋಗ್ಯ ತಪಾಸಣೆ

ನಿಯಮಿತ ತಪಾಸಣೆ ಸಮಸ್ಯೆಗಳನ್ನು ಬೇಗ ಪತ್ತೆಹಚ್ಚಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ.

## ಏನು ತಪಾಸಣೆ ಮಾಡಿಸಬೇಕು
- ರಕ್ತದೊತ್ತಡ (ವಿಶೇಷವಾಗಿ 30 ವರ್ಷ ವಯಸ್ಸಿನಿಂದ).
- ರಕ್ತದ ಸಕ್ಕರೆ (ಮಧುಮೇಹ ಅಪಾಯಕ್ಕಾಗಿ).
- ಕಣ್ಣು ಮತ್ತು ಹಲ್ಲಿನ ತಪಾಸಣೆ.
- ನಿಮ್ಮ ವಯಸ್ಸು ಮತ್ತು ಲಿಂಗಕ್ಕೆ ಅನುಗುಣವಾಗಿ ಕ್ಯಾನ್ಸರ್ ಸ್ಕ್ರೀನಿಂಗ್.

ನಿಮ್ಮ ವೈದ್ಯರು ವಯಸ್ಸು ಮತ್ತು ಕುಟುಂಬ ಇತಿಹಾಸದ ಆಧಾರದ ಮೇಲೆ ವೇಳಾಪಟ್ಟಿ ಸೂಚಿಸಬಹುದು.
''',
  'hydration': '''
# ಜಲಸಂಚಯ ಮತ್ತು ನೀರು

ಸ್ವಚ್ಛ, ಸುರಕ್ಷಿತ ನೀರು ಆರೋಗ್ಯಕ್ಕೆ ಅತ್ಯಗತ್ಯ.

## ಇದು ಏಕೆ ಮುಖ್ಯ
- ನೀರು ಜೀರ್ಣಕ್ರಿಯೆ, ತಾಪಮಾನ ನಿಯಂತ್ರಣ ಮತ್ತು ತ್ಯಾಜ್ಯ ತೆಗೆದುಹಾಕಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ.
- ದಿನವಿಡೀ ಸಾಕಷ್ಟು ಸ್ವಚ್ಛ ನೀರು ಕುಡಿಯಿರಿ (ಸುಮಾರು 8 ಗ್ಲಾಸ್).
- ಬಿಸಿ ವಾತಾವರಣದಲ್ಲಿ ಅಥವಾ ಚಟುವಟಿಕೆಯಲ್ಲಿದ್ದಾಗ ಹೆಚ್ಚು ಕುಡಿಯಿರಿ.
- ನಲ್ಲಿ ನೀರು ಸುರಕ್ಷಿತವಲ್ಲದಿದ್ದರೆ ಕುದಿಸಿದ ಅಥವಾ ಶೋಧಿಸಿದ ನೀರು ಬಳಸಿ.
- ನೀರನ್ನು ಸ್ವಚ್ಛ, ಮುಚ್ಚಿದ ಪಾತ್ರೆಗಳಲ್ಲಿ ಸಂಗ್ರಹಿಸಿ.
''',
  'cessation': '''
# ಧೂಮಪಾನ ಮತ್ತು ಮದ್ಯಪಾನ ತ್ಯಜಿಸುವುದು

ತಂಬಾಕು ತ್ಯಜಿಸುವುದು ಮತ್ತು ಮದ್ಯಪಾನ ಮಿತಗೊಳಿಸುವುದು ಆರೋಗ್ಯವನ್ನು ಹೆಚ್ಚು ಸುಧಾರಿಸುತ್ತದೆ.

## ತಂಬಾಕು
- ಯಾವ ವಯಸ್ಸಿನಲ್ಲಾದರೂ ತ್ಯಜಿಸುವುದರ ಪ್ರಯೋಜನಗಳಿವೆ. ಸಹಾಯಕ್ಕಾಗಿ ವೈದ್ಯರನ್ನು ಕೇಳಿ.
- ಎರಡನೇ ಹಸ್ತದ ಹೊಗೆಯಿಂದ ದೂರ ಇರಿ.

## ಮದ್ಯಪಾನ
- ಕುಡಿದರೆ ಮಿತವಾಗಿ ಕುಡಿಯಿರಿ. ಗರ್ಭಾವಸ್ಥೆಯಲ್ಲಿ ಯಾವುದೇ ಮದ್ಯ ಸುರಕ್ಷಿತವಲ್ಲ.
- ಅತಿಯಾದ ಮದ್ಯಪಾನ ಯಕೃತ್ತಿನ ಕಾಯಿಲೆ, ಕ್ಯಾನ್ಸರ್ ಮತ್ತು ಅಪಘಾತಗಳ ಅಪಾಯ ಹೆಚ್ಚಿಸುತ್ತದೆ.
- ಕಡಿಮೆ ಮಾಡಲು ಕಷ್ಟವಾದರೆ ವೈದ್ಯರ ಸಹಾಯ ಪಡೆಯಿರಿ.
''',
  'hygiene': '''
# ಕೈ ಶುಚಿತ್ವ ಮತ್ತು ನೈರ್ಮಲ್ಯ

ಸ್ವಚ್ಛ ಕೈಗಳು ಮತ್ತು ಸುರಕ್ಷಿತ ನೈರ್ಮಲ್ಯ ಅನೇಕ ಸೋಂಕುಗಳನ್ನು ತಡೆಯುತ್ತದೆ.

## ಕೈ ತೊಳೆಯುವುದು
- ಕನಿಷ್ಠ 20 ಸೆಕೆಂಡ್ ಸೋಪು ಮತ್ತು ನೀರಿನಿಂದ ಕೈ ತೊಳೆಯಿರಿ.
- ಮುಖ್ಯ ಸಮಯಗಳು: ತಿನ್ನುವ ಮೊದಲು, ಶೌಚಾಲಯ ಬಳಸಿದ ನಂತರ, ತ್ಯಾಜ್ಯ ಅಥವಾ ಪ್ರಾಣಿಗಳನ್ನು ಮುಟ್ಟಿದ ನಂತರ.

## ನೈರ್ಮಲ್ಯ
- ಶೌಚಾಲಯ ಅಥವಾ ಲ್ಯಾಟ್ರಿನ್ ಬಳಸಿ; ಬಯಲು ಶೌಚ ತಪ್ಪಿಸಿ.
- ಕುಡಿಯುವ ನೀರನ್ನು ತ್ಯಾಜ್ಯ ನೀರಿನಿಂದ ಪ್ರತ್ಯೇಕಿಸಿ ಇರಿ.
- ನೊಣಗಳು ಮತ್ತು ಕೀಟಗಳನ್ನು ಕಡಿಮೆ ಮಾಡಲು ಸುತ್ತಮುತ್ತ ಸ್ವಚ್ಛವಾಗಿ ಇರಿ.

ಈ ಕ್ರಮಗಳು ಅತಿಸಾರ, ಉಸಿರಾಟದ ಸೋಂಕುಗಳು ಮತ್ತು ಇತರ ಕಾಯಿಲೆಗಳನ್ನು ಕಡಿಮೆ ಮಾಡುತ್ತವೆ.
''',
};

const Map<String, String> EDUCATION_CONTENT_TE = {
  'preventive': '''
# నివారణ ఆరోగ్య సంరక్షణ

నివారణ ఆరోగ్య సంరక్షణ అంటే అనారోగ్యం ప్రారంభం కాకముందే దాన్ని నివారించడానికి చర్యలు తీసుకోవడం.

## ముఖ్యమైన అభ్యాసాలు
- **టీకాలు**: మీకు మరియు మీ కుటుంబానికి సిఫారసు చేసిన టీకాలు సమయానికి వేయించుకోండి.
- **స్క్రీనింగ్**: డాక్టర్ సూచన మేరకు నియమిత తనిఖీలు (రక్తపోటు, రక్తంలో చక్కర) చేయించుకోండి.
- **ఆరోగ్యకరమైన జీవనశైలి**: సమతుల్య ఆహారం తినండి, చురుకుగా ఉండండి, తగినంత నిద్ర పొందండి.
- **పరిశుభ్రత**: సబ్బుతో చేతులు కడగండి, శుభ్రమైన నీరు వాడండి.

మూలం: WHO మరియు MoHFW మార్గదర్శకాలు. ఇది విద్య మాత్రమే — వ్యక్తిగత సలహా కోసం డాక్టర్‌ను సంప్రదించండి.
''',
  'diet': '''
# ఆరోగ్యకరమైన ఆహారం మరియు పోషణ

సమతుల్య ఆహారం మీ శరీరానికి వ్యాధులతో పోరాడటానికి మరియు బలంగా ఉండటానికి సహాయపడుతుంది.

## చిట్కాలు
- ప్రతిరోజు వివిధ రకాల పండ్లు మరియు కూరగాయలు తినండి.
- తృణధాన్యాలు, పప్పులు మరియు చిక్కుళ్ళు చేర్చండి.
- చక్కర, ఉప్పు మరియు వేయించిన ఆహారాలను పరిమితంగా తీసుకోండి.
- శుభ్రమైన, సురక్షితమైన నీరు సరిపడా తాగండి.
- సాధ్యమైతే శిశువులకు మొదటి 6 నెలలు మాత్రమే తల్లిపాలు ఇవ్వండి.

వ్యక్తిగత సలహా కోసం డాక్టర్ లేదా పోషకాహార నిపుణుడిని సంప్రదించండి.
''',
  'exercise': '''
# వ్యాయామం మరియు ఫిట్‌నెస్

నియమిత శారీరక కార్యకలాపాలు హృదయ ఆరోగ్యం, మూడ్ మరియు శక్తిని మెరుగుపరుస్తాయి.

## సిఫారసులు
- చాలా రోజులు కనీసం 30 నిమిషాల మితమైన కార్యకలాపాలు (నడక, సైక్లింగ్) చేయండి.
- కొత్తగా ప్రారంభిస్తే నెమ్మదిగా మొదలుపెట్టండి.
- మీకు నచ్చిన కార్యకలాపాలను ఎంచుకోండి, అప్పుడు నిరంతరంగా చేయవచ్చు.
- ఏదైనా ఆరోగ్య సమస్య ఉంటే కొత్త వ్యాయామం ప్రారంభించే ముందు డాక్టర్‌ను అడగండి.
''',
  'mental': '''
# మానసిక ఆరోగ్యం మరియు సంక్షేమం

మానసిక ఆరోగ్యం శారీరక ఆరోగ్యంలా ముఖ్యమైనది.

## ఏది సహాయపడుతుంది
- ఒత్తిడి లేదా దుఃఖంగా అనిపించినప్పుడు నమ్మకమైన వ్యక్తితో మాట్లాడండి.
- కుటుంబం మరియు స్నేహితులతో అనుసంధానంగా ఉండండి.
- తగినంత నిద్ర మరియు విశ్రాంతి తీసుకోండి.
- మద్యపానం పరిమితం చేయండి మరియు మాదక ద్రవ్యాలను నివారించండి.
- నిరంతర దుఃఖం, ఆందోళన, లేదా ఆత్మహత్య ఆలోచనలు వస్తే డాక్టర్‌ను చూడండి.

మీరు ఒంటరిగా లేరు. సహాయం కోరడం బలానికి సంకేతం.
''',
  'sleep': '''
# నిద్ర పరిశుభ్రత

మంచి నిద్ర మీ శరీరాన్ని నయం చేయడానికి మరియు మనసును తీక్షణంగా ఉంచడానికి సహాయపడుతుంది.

## చిట్కాలు
- ప్రతిరోజు ఒకే సమయంలో పడుకోవడానికి మరియు లేవడానికి ప్రయత్నించండి.
- పడుకునే గదిని చీకటిగా, నిశ్శబ్దంగా మరియు చల్లగా ఉంచండి.
- పడుకునే ముందు కనీసం ఒక గంట స్క్రీన్‌లు (ఫోన్, టీవీ) వాడకండి.
- మధ్యాహ్నం మరియు సాయంత్రం కెఫీన్‌ను పరిమితం చేయండి.
- నిరంతర నిద్ర సమస్యలు ఉంటే డాక్టర్‌తో మాట్లాడండి.
''',
  'checkups': '''
# నియమిత ఆరోగ్య తనిఖీలు

నియమిత తనిఖీలు సమస్యలను ముందే గుర్తించడంలో సహాయపడతాయి.

## ఏమి తనిఖీ చేయాలి
- రక్తపోటు (ముఖ్యంగా 30 సంవత్సరాల వయసు నుండి).
- రక్తంలో చక్కర (మధుమేహ ప్రమాదం కోసం).
- కంటి మరియు దంత తనిఖీలు.
- వయసు మరియు లింగానికి అనుగుణంగా క్యాన్సర్ స్క్రీనింగ్.

మీ డాక్టర్ మీ వయసు మరియు కుటుంబ చరిత్ర ఆధారంగా షెడ్యూల్‌ను సూచించగలరు.
''',
  'hydration': '''
# హైడ్రేషన్ మరియు నీరు

శుభ్రమైన, సురక్షితమైన నీరు ఆరోగ్యానికి అవసరం.

## ఇది ఎందుకు ముఖ్యమో
- నీరు జీర్ణక్రియ, ఉష్ణోగ్రత నియంత్రణ మరియు వ్యర్థాలను తొలగించడానికి సహాయపడుతుంది.
- రోజంతా తగినంత శుభ్రమైన నీరు తాగండి (దాదాపు 8 గ్లాసులు).
- వేడి వాతావరణంలో లేదా చురుకుగా ఉన్నప్పుడు ఎక్కువ తాగండి.
- కుళాయి నీరు సురక్షితం కాకపోతే మరిగించిన లేదా వడగట్టిన నీరు వాడండి.
- నీటిని శుభ్రమైన, మూతపెట్టిన పాత్రలలో నిల్వ చేయండి.
''',
  'cessation': '''
# ధూమపానం మరియు మద్యపానం మానడం

పొగాకు మానడం మరియు మద్యపానం తగ్గించడం ఆరోగ్యాన్ని బాగా మెరుగుపరుస్తాయి.

## పొగాకు
- ఏ వయసులోనైనా మానడం వల్ల ప్రయోజనాలు ఉన్నాయి. డాక్టర్‌ను సహాయం కోసం అడగండి.
- సెకండ్-హ్యాండ్ పొగ నుండి దూరంగా ఉండండి.

## మద్యపానం
- తాగితే మితంగా తాగండి. గర్భధారణ సమయంలో ఏ మద్యం సురక్షితం కాదు.
- అధిక మద్యపానం కాలేయ వ్యాధి, క్యాన్సర్ మరియు ప్రమాదాల ప్రమాదాన్ని పెంచుతుంది.
- తగ్గించడం కష్టంగా అనిపిస్తే డాక్టర్ సహాయం తీసుకోండి.
''',
  'hygiene': '''
# చేతుల పరిశుభ్రత మరియు స్వచ్ఛత

శుభ్రమైన చేతులు మరియు సురక్షితమైన పారిశుధ్యం అనేక సంక్రమణాలను నివారిస్తాయి.

## చేతులు కడగడం
- కనీసం 20 సెకండ్లు సబ్బు మరియు నీటితో చేతులు కడగండి.
- ముఖ్యమైన సమయాలు: తినే ముందు, మరుగుదొడ్డి వాడిన తర్వాత, చెత్త లేదా జంతువులను తాకిన తర్వాత.

## పారిశుధ్యం
- మరుగుదొడ్లు లేదా లెట్రిన్‌లు వాడండి; బహిరంగ మలవిసర్జన నివారించండి.
- తాగే నీటిని వ్యర్థ నీటి నుండి వేరుగా ఉంచండి.
- ఈగలు మరియు తెగుళ్ళను తగ్గించడానికి చుట్టుపక్కల శుభ్రంగా ఉంచండి.

ఈ చర్యలు అతిసారం, శ్వాసకోశ సంక్రమణాలు మరియు ఇతర వ్యాధులను తగ్గిస్తాయి.
''',
};
