import "./globals.css";
import RefreshRedirect from '@/components/RefreshRedirect'
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata, Viewport } from 'next'
import { createClient } from '@/utils/supabase/server'
import AccessibilityLocaleDock from '@/components/AccessibilityLocaleDock'

const defaultMetadata: Metadata = {
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

export async function generateMetadata(): Promise<Metadata> {
  try {
    const database = await createClient()
    const { data } = await database.from('seo_settings').select('*').eq('id', 1).maybeSingle()
    if (!data) return defaultMetadata
    return {
      ...defaultMetadata,
      title: { default: data.site_title, template: '%s | Muhammad Sahad' },
      description: data.description,
      keywords: data.keywords,
      robots: data.allow_indexing ? { index: true, follow: true } : { index: false, follow: false },
      openGraph: { ...defaultMetadata.openGraph, title: data.social_title || data.site_title, description: data.social_description || data.description, images: data.og_image_url ? [data.og_image_url] : undefined },
      twitter: { ...defaultMetadata.twitter, title: data.social_title || data.site_title, description: data.social_description || data.description, images: data.og_image_url ? [data.og_image_url] : undefined },
    }
  } catch { return defaultMetadata }
}

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
        <AccessibilityLocaleDock />
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
