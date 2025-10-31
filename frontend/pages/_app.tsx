import React from 'react';
import type { AppProps } from 'next/app';
import CommandPalette from '../components/CommandPalette';
import '../styles/globals.css';

// Define AppProps if not available (for compatibility)
interface MyAppProps {
  Component: React.ComponentType<any>;
  pageProps: any;
}

function MyApp({ Component, pageProps }: MyAppProps) {
  return (
    <>
      <Component {...pageProps} />
      <CommandPalette />
    </>
  );
}

export default MyApp;
