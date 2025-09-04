'use client';

import "./globals.css";
import { AuthProvider } from '@/lib/contexts/AuthContext';
import { LocaleProvider } from '@/lib/contexts/LocaleContext';

export default function RootLayout({ children }) {
  return (
    <html lang="fr" data-scroll-behavior="smooth">
      <body 
        className="antialiased"
        suppressHydrationWarning={true}
      >
        <AuthProvider>
          <LocaleProvider>
            {children}
          </LocaleProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
