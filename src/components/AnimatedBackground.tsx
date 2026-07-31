'use client'

import dynamic from 'next/dynamic'

const BackgroundScene = dynamic(
  () => import('@/components/three/BackgroundScene'),
  { ssr: false, loading: () => null },
)

export default function AnimatedBackground() {
  return (
    <div
      aria-hidden="true"
      data-heavy-visual="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#07070a]"
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 18% 18%, rgba(34,211,238,0.09), transparent 30%), radial-gradient(circle at 82% 30%, rgba(139,92,246,0.12), transparent 34%), radial-gradient(circle at 52% 86%, rgba(217,70,239,0.07), transparent 32%)',
        }}
      />

      <div className="absolute inset-0">
        <BackgroundScene />
      </div>

      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage:
            'linear-gradient(to bottom, transparent, black 18%, black 82%, transparent)',
          WebkitMaskImage:
            'linear-gradient(to bottom, transparent, black 18%, black 82%, transparent)',
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at center, transparent 25%, rgba(7,7,10,0.34) 68%, rgba(7,7,10,0.82) 100%), linear-gradient(to bottom, rgba(7,7,10,0.1), rgba(7,7,10,0.5))',
        }}
      />
    </div>
  )
}
