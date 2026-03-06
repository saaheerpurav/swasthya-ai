import { formatDistanceToNowStrict, parseISO } from 'date-fns'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(value: number) {
  return Intl.NumberFormat('en-IN', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

export function relativeTime(timestamp: string) {
  const date = parseISO(timestamp)
  return formatDistanceToNowStrict(date, { addSuffix: true })
}

