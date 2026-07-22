'use client'

import React, { useEffect, useMemo, useRef } from 'react'

const AnimatedBackground = () => {
  const particles = useMemo(() => Array.from({ length: 36 }, (_, i) => ({ left: (i * 47) % 100, top: (i * 71) % 100, delay: (i % 9) * 0.38, depth: 0.55 + (i % 5) * 0.12 })), [])
  const blobRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    let requestId: number

    const handleScroll = () => {
      const scroll = window.pageYOffset

      blobRefs.current.forEach((blob, index) => {
        if (!blob) return

        const xOffset =
          Math.sin(scroll / 120 + index * 0.6) * 100

        const yOffset =
          Math.cos(scroll / 120 + index * 0.6) * 35

        blob.style.transform = `translate(${xOffset}px, ${yOffset}px)`
        blob.style.transition = 'transform 1.2s ease-out'
      })

      requestId = requestAnimationFrame(handleScroll)
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      cancelAnimationFrame(requestId)
    }
  }, [])

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute inset-0">
        {/* top left */}
        <div
          ref={(ref) => {
            blobRefs.current[0] = ref
          }}
          className="absolute top-10 left-10 w-40 h-40 md:w-56 md:h-56 rounded-full bg-white blur-[90px] opacity-30"
        />

        {/* top right */}
        <div
          ref={(ref) => {
            blobRefs.current[1] = ref
          }}
          className="absolute top-10 right-10 w-40 h-40 md:w-56 md:h-56 rounded-full bg-zinc-300 blur-[100px] opacity-25"
        />

        {/* bottom left */}
        <div
          ref={(ref) => {
            blobRefs.current[2] = ref
          }}
          className="absolute bottom-10 left-10 w-44 h-44 md:w-60 md:h-60 rounded-full bg-zinc-400 blur-[110px] opacity-30"
        />

        {/* bottom right */}
        <div
          ref={(ref) => {
            blobRefs.current[3] = ref
          }}
          className="absolute bottom-10 right-10 w-40 h-40 md:w-56 md:h-56 rounded-full bg-white blur-[100px] opacity-20"
        />
      </div>

      <div className="absolute inset-0" style={{ perspective: '900px', transformStyle: 'preserve-3d' }}>{particles.map((particle, index) => <span key={index} className="absolute h-1 w-1 rounded-full bg-cyan-100/80 shadow-[0_0_14px_rgba(125,211,252,.9)]" style={{ left: particle.left + '%', top: particle.top + '%', animation: 'particleFloat 6s ease-in-out infinite', animationDelay: particle.delay + 's', transform: 'translateZ(' + (particle.depth * 120) + 'px)' }} />)}</div>
      <style jsx>{'@keyframes particleFloat { 0%,100% { transform: translate3d(0,0,0) scale(.7); opacity:.15 } 50% { transform: translate3d(18px,-34px,90px) scale(1.45); opacity:.85 } }'}</style>

      {/* GRID */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:26px_26px]" />
    </div>
  )
}

export default AnimatedBackground
