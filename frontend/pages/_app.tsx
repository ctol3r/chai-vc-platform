import { useEffect, useState } from 'react'
import type { AppProps } from 'next/app'

import '@/styles/globals.css'

import { Toaster } from '@/components/ui/toaster'

type ThemeKey = 'clean' | 'dark' | 'neon' | 'glass'

const THEMES: Array<{ key: ThemeKey; label: string }> = [
  { key: 'clean', label: 'Hims' },
  { key: 'dark', label: 'Palantir' },
  { key: 'neon', label: 'Formless' },
  { key: 'glass', label: 'Jeton' },
]

export default function App({ Component, pageProps }: AppProps) {
  const [theme, setTheme] = useState<ThemeKey>('clean')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : theme)
  }, [theme])

  return (
    <>
      <div className="fixed top-4 right-4 z-50 flex gap-1 rounded-lg border border-white/10 bg-black/40 p-1 backdrop-blur">
        {THEMES.map((item) => (
          <button
            key={item.key}
            onClick={() => setTheme(item.key)}
            className={`px-3 py-1 text-sm transition ease-springy ${
              theme === item.key ? 'rounded-md border border-white/20 bg-white/10 text-white shadow-glow' : 'rounded-md text-white/70 hover:text-white'
            }`}
            aria-pressed={theme === item.key}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>
      <Component {...pageProps} />
      <Toaster />
    </>
  )
}
