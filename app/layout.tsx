import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import AppWrapper from '@/components/AppWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MediaGrab - Social Media Downloader',
  description: 'Download videos, audio, and images from social media platforms',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppWrapper>{children}</AppWrapper>
      </body>
    </html>
  );
}