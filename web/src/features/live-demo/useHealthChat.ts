import { useState, useEffect } from 'react'
import { bootstrapSession } from '../../lib/api'

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

export function useHealthChat(language: Language) {
  const [messages, setMessages] = useState<DemoMessage[]>([
    { role: 'assistant', content: GREETING[language] },
  ])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    bootstrapSession().catch(() => {})
  }, [])

  useEffect(() => {
    setMessages([{ role: 'assistant', content: GREETING[language] }])
  }, [language])

  async function sendMessage(userText: string) {
    if (!userText.trim()) return

    setMessages((prev) => [...prev, { role: 'user', content: userText }])
    setLoading(true)

    try {
      await bootstrapSession()
      const token = localStorage.getItem('session_token')

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ message: userText, language }),
        }
      )
      const data = await response.json()
      const reply: string = data.data?.content ?? 'Sorry, something went wrong.'
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

