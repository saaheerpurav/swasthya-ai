import type { Language } from '../types'
import { cn } from '../lib/utils'

interface Props {
  language: Language
}

const label: Record<Language, string> = {
  en: 'English',
  hi: 'हिन्दी',
  kn: 'ಕನ್ನಡ',
  te: 'తెలుగు',
}

export function LanguageBadge({ language }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-slate-700 bg-slate-900/70 px-2 py-0.5 text-[10px] text-slate-200',
      )}
    >
      {label[language]}
    </span>
  )
}

