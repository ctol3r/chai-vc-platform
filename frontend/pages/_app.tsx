import type { AppProps } from 'next/app'

import '@/styles/globals.css'

import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <Component {...pageProps} />
      <Toaster />
    </ThemeProvider>
  )
}
