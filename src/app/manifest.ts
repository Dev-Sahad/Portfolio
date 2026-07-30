import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Muhammad Sahad Portfolio',
    short_name: 'Sahad',
    description: 'Frontend developer portfolio, case studies, and developer notes.',
    start_url: '/',
    display: 'standalone',
    background_color: '#080808',
    theme_color: '#080808',
    icons: [{ src: '/assets/PP.png', sizes: '512x512', type: 'image/png' }],
  }
}
