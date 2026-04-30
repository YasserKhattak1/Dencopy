import type { Metadata, Viewport } from 'next';
import { Roboto } from 'next/font/google';
import './globals.css';

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  display: 'swap',
  variable: '--font-roboto',
});

export const metadata: Metadata = {
  title: 'Den',
  description:
    'The future of switches is coming. Sign up to the Den newsletter to be the first to know.',
  icons: {
    icon: '/den-logo.svg',
    shortcut: '/den-logo.svg',
    apple: '/den-logo.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={roboto.variable}>
      <body>{children}</body>
    </html>
  );
}
