import "./globals.css";
import RefreshRedirect from '@/components/RefreshRedirect'
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL('https://sahad.is-a.dev'),
  title: {
    default: 'Muhammad Sahad — Frontend Developer',
    template: '%s | Muhammad Sahad',
  },
  description: 'Frontend developer creating modern, responsive, and thoughtfully animated web experiences.',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    title: 'Muhammad Sahad — Frontend Developer',
    description: 'Explore selected projects, case studies, certificates, and developer notes.',
    siteName: 'Muhammad Sahad Portfolio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Muhammad Sahad — Frontend Developer',
    description: 'Explore selected projects, case studies, certificates, and developer notes.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#080808',
  colorScheme: 'dark',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-black">
          Skip to main content
        </a>
        <RefreshRedirect />
        {children}
        <SpeedInsights />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'ProfilePage',
              mainEntity: {
                '@type': 'Person',
                name: 'Muhammad Sahad',
                alternateName: 'Dev-Sahad',
                url: 'https://sahad.is-a.dev',
                image: 'https://sahad.is-a.dev/assets/PP.png',
                jobTitle: 'Frontend Developer',
                sameAs: [
                  'https://github.com/Dev-Sahad',
                  'https://www.linkedin.com/in/muhammad--sahad',
                ],
              },
            }),
          }}
        />
      </body>
    </html>
  );
}
