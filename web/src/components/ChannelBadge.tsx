import type { Channel } from '../types'
import { cn } from '../lib/utils'

interface Props {
  channel: Channel
}

export function ChannelBadge({ channel }: Props) {
  const color = {
    whatsapp: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
    sms: 'bg-slate-500/15 text-slate-200 border-slate-500/40',
    web: 'bg-blue-500/15 text-blue-300 border-blue-500/40',
    mobile: 'bg-purple-500/15 text-purple-300 border-purple-500/40',
    voice: 'bg-teal-500/15 text-teal-300 border-teal-500/40',
  }[channel]

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize',
        color,
      )}
    >
      {channel}
    </span>
  )
}

