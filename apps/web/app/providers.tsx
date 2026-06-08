'use client'

import { useEffect } from 'react'
import { SessionProvider } from 'next-auth/react'

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const applyTheme = (theme: 'dark' | 'light') => {
      document.documentElement.dataset.theme = theme
    }

    const storedTheme = window.localStorage.getItem('signhere-theme')
    if (storedTheme === 'dark' || storedTheme === 'light') {
      applyTheme(storedTheme)
      return
    }

    const media = window.matchMedia('(prefers-color-scheme: light)')
    applyTheme(media.matches ? 'light' : 'dark')

    const handleChange = (event: MediaQueryListEvent) => {
      if (!window.localStorage.getItem('signhere-theme')) {
        applyTheme(event.matches ? 'light' : 'dark')
      }
    }

    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }, [])

  return (
    <SessionProvider refetchInterval={5 * 60} refetchOnWindowFocus>
      {children}
    </SessionProvider>
  )
}
