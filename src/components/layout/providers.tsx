'use client';

import { SessionProvider } from 'next-auth/react';
import React from 'react';
import { ActiveThemeProvider } from '../themes/active-theme';
import { ThemeProvider } from 'next-themes';

export default function Providers({
  activeThemeValue,
  children
}: {
  activeThemeValue: string;
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <ActiveThemeProvider initialTheme={activeThemeValue}>
          {children}
        </ActiveThemeProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
