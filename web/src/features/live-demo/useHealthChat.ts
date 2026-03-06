import { useState, useEffect } from 'react'

type Role = 'user' | 'assistant'

export type Language = 'en' | 'hi' | 'kn' | 'te'

export interface DemoMessage {
  role: Role
  content: string
}

const GREETING: Record<Language, string> = {
  en: "Hello! I'm SwasthyaAI. Ask me any health question.",
  hi: 'नमस्ते! मैं स्वास्थ्यAI हूँ। कोई भी स्वास्थ्य से जुड़ा प्रश्न पूछें।',
  kn: 'ನಮಸ್ಕಾರ! ನಾನು ಸ್ವಾಸ್ಥ್ಯAI. ಯಾವುದೇ ಆರೋಗ್ಯ ಪ್ರಶ್ನೆಯನ್ನು ಕೇಳಿ.',
  te: 'నమస్తే! నేను స్వాస్థ్యAI ని. ఏ ఆరోగ్య ప్రశ్ననైనా అడగండి.',
}

const HEALTH_SYSTEM_PROMPT: Record<Language, string> = {
  en: `You are SwasthyaAI, a public health education assistant for rural India.
Respond in English.
Follow strict safety rules: do not diagnose or prescribe, emphasise seeing a doctor, and detect emergencies as described in the mobile spec.`,
  hi: `आप SwasthyaAI हैं, ग्रामीण भारत के लिए सार्वजनिक स्वास्थ्य शिक्षा सहायक।
हिंदी में उत्तर दें।
नियम: कोई निदान नहीं, कोई दवा नहीं, आपातकाल में तुरंत 108 कॉल करने की सलाह दें।`,
  kn: `ನೀವು ಸ್ವಾಸ್ಥ್ಯAI, ಗ್ರಾಮೀಣ ಭಾರತದ ಸಾರ್ವಜನಿಕ ಆರೋಗ್ಯ ಶಿಕ್ಷಣ ಸಹಾಯಕ.
ಕನ್ನಡದಲ್ಲಿ ಉತ್ತರಿಸಿ.
ರೋಗ ನಿರ್ಣಯ ಮಾಡಬೇಡಿ, ಔಷಧಿ ಸೂಚಿಸಬೇಡಿ, ತುರ್ತು ಸಂದರ್ಭಗಳಲ್ಲಿ 108 ಗೆ ಕರೆ ಮಾಡಲು ತಿಳಿಸಿ.`,
  te: `మీరు స్వాస్థ్యAI, గ్రామీణ భారతానికి ప్రజారోగ్య విద్య సహాయకుడు.
తెలుగులో సమాధానం ఇవ్వండి.
రోగ నిర్ధారణ చేయకండి, మందులు సూచించకండి, అత్యవసర లక్షణాల్లో 108 కి కాల్ చేయమని చెప్పండి.`,
}

const NO_KEY_REPLY: Record<Language, string> = {
  en: 'Demo AI key not configured. Add VITE_OPENAI_API_KEY to your .env file to enable live responses.',
  hi: 'डेमो AI कुंजी कॉन्फ़िगर नहीं है। लाइव उत्तरों के लिए .env फ़ाइल में VITE_OPENAI_API_KEY जोड़ें।',
  kn: 'ಡೆಮೊ AI ಕೀ ಕಾನ್ಫಿಗರ್ ಆಗಿಲ್ಲ। ಲೈವ್ ಉತ್ತರಗಳಿಗೆ .env ಫೈಲ್‌ನಲ್ಲಿ VITE_OPENAI_API_KEY ಸೇರಿಸಿ.',
  te: 'డెమో AI కీ కాన్ఫిగర్ కాలేదు. లైవ్ సమాధానాలకు .env ఫైల్‌లో VITE_OPENAI_API_KEY జోడించండి.',
}

export function useHealthChat(language: Language) {
  const [messages, setMessages] = useState<DemoMessage[]>([
    { role: 'assistant', content: GREETING[language] },
  ])
  const [loading, setLoading] = useState(false)

  // Reset chat whenever language changes
  useEffect(() => {
    setMessages([{ role: 'assistant', content: GREETING[language] }])
  }, [language])

  async function sendMessage(userText: string) {
    if (!userText.trim()) return

    const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined

    setMessages((prev) => [...prev, { role: 'user', content: userText }])
    setLoading(true)

    if (!apiKey) {
      // Graceful fallback when key is missing
      await new Promise((r) => setTimeout(r, 400))
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: NO_KEY_REPLY[language] },
      ])
      setLoading(false)
      return
    }

    try {
      // Build conversation including the new user message for the API call
      const conversation: DemoMessage[] = [...messages, { role: 'user', content: userText }]

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: HEALTH_SYSTEM_PROMPT[language] },
            ...conversation.map((m) => ({ role: m.role as Role, content: m.content })),
          ],
          max_tokens: 300,
          temperature: 0.2,
        }),
      })
      const data = await response.json()
      const reply: string =
        data.choices?.[0]?.message?.content ??
        (data.error?.message ? `Error: ${data.error.message}` : 'Sorry, something went wrong.')
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, there was an error reaching the AI service.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  return { messages, loading, sendMessage }
}

