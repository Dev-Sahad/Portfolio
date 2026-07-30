import { ImageResponse } from 'next/og'

export const alt = 'Muhammad Sahad — Frontend Developer'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 72, color: 'white', background: 'linear-gradient(135deg,#050505,#151515)' }}>
      <div style={{ display: 'flex', fontSize: 24, letterSpacing: 4, color: '#a1a1aa' }}>DEV-SAHAD</div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', fontSize: 76, fontWeight: 800 }}>Frontend Developer</div>
        <div style={{ display: 'flex', marginTop: 22, fontSize: 28, color: '#a1a1aa' }}>Case studies · Projects · Developer notes</div>
      </div>
      <div style={{ display: 'flex', fontSize: 22, color: '#71717a' }}>sahad.is-a.dev</div>
    </div>,
    size,
  )
}
