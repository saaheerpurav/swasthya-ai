import { useEffect, useState } from 'react'

export function useAdminAuth() {
  const [adminKey, setAdminKey] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = window.localStorage.getItem('admin_key')
    setAdminKey(stored)
  }, [])

  const saveKey = (key: string) => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem('admin_key', key)
    setAdminKey(key)
  }

  const clearKey = () => {
    if (typeof window === 'undefined') return
    window.localStorage.removeItem('admin_key')
    setAdminKey(null)
  }

  return { adminKey, saveKey, clearKey }
}

