import { useState, useRef, useEffect } from 'react'
import type { FormEvent } from 'react'
import { useHealthChat } from './useHealthChat'
import type { Language } from './useHealthChat'

function isEmergency(content: string) {
  const upper = content.toUpperCase()
  return upper.includes('EMERGENCY:') || upper.includes('CALL 108') || upper.includes('108')
}

const languageLabels: Record<Language, string> = {
  en: 'EN',
  hi: 'हिं',
  kn: 'ಕನ್',
  te: 'తె',
}

function LiveDemoWidget() {
  const [language, setLanguage] = useState<Language>('en')
  const { messages, loading, sendMessage } = useHealthChat(language)
  const [input, setInput] = useState('')
  const messagesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = messagesRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, loading])

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    void sendMessage(input)
    setInput('')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-50">
            Try SwasthyaAI Right Now
          </h2>
          <p className="text-xs text-slate-400">
            Ask a real health question in any supported language.
          </p>
        </div>
        <div className="inline-flex rounded-full bg-slate-900 p-1 text-xs">
          {(Object.keys(languageLabels) as Language[]).map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => setLanguage(lang)}
              className={`px-2 py-0.5 rounded-full ${
                language === lang
                  ? 'bg-green-500 text-black'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {languageLabels[lang]}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3">
        <div className="mb-3 flex items-center justify-between text-[11px] text-slate-400">
          <span>Live demo · no login required</span>
          <span className="inline-flex items-center gap-1 text-[10px]">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
            Online
          </span>
        </div>
        <div className="grid gap-3">
          <div ref={messagesRef} className="max-h-64 space-y-2 overflow-y-auto pr-1">
            {messages.map((m, idx) => {
              const emergency = m.role === 'assistant' && isEmergency(m.content)
              return (
                <div key={idx} className="flex flex-col gap-1">
                  <div className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs ${
                        m.role === 'user'
                          ? 'bg-green-500 text-black'
                          : emergency
                          ? 'bg-red-900/60 text-red-100 border border-red-500/50'
                          : 'bg-slate-800 text-slate-50'
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                  {emergency && (
                    <div className="flex justify-start">
                      <div className="flex items-center gap-1.5 rounded-lg bg-red-500/15 border border-red-500/40 px-2.5 py-1 text-[10px] font-semibold text-red-400">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
                        EMERGENCY DETECTED — Call 108 immediately
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
            {loading && (
              <div className="flex justify-start">
                <div className="flex max-w-[80%] items-center gap-1 rounded-2xl bg-slate-800 px-3 py-2 text-xs text-slate-400">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-500" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-500 [animation-delay:120ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-500 [animation-delay:240ms]" />
                </div>
              </div>
            )}
          </div>

          <form onSubmit={onSubmit} className="flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your health..."
              className="h-9 flex-1 rounded-full border border-slate-700 bg-slate-900 px-3 text-xs text-slate-100 placeholder:text-slate-500 focus:border-green-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="inline-flex h-9 items-center rounded-full bg-green-500 px-3 text-xs font-semibold text-black hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Send
            </button>
          </form>
        </div>
        <p className="mt-3 text-[10px] text-slate-500">
          Responses are for health education only and are not a substitute for
          professional medical advice.
        </p>
        <p className="mt-1 text-[10px] text-slate-500">
          Powered by OpenAI + AWS Bedrock (demo).
        </p>
      </div>
    </div>
  )
}

export default LiveDemoWidget

