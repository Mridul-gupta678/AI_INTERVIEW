// src/app/layout.tsx
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Providers } from '@/components/providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'InterviewAI — Ace Every Interview',
  description: 'AI-powered mock interview platform with real-time feedback, adaptive questioning, and comprehensive evaluation.',
  keywords: ['interview', 'AI', 'mock interview', 'technical interview', 'DSA', 'system design'],
  openGraph: {
    title: 'InterviewAI',
    description: 'Practice. Improve. Get Hired.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
