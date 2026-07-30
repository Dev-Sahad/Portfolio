'use client'

import { useEffect, useRef } from 'react'

type PointerParallaxOptions = {
  smoothing?: number
}

export function usePointerParallax<T extends HTMLElement>({
  smoothing = 0.075,
}: PointerParallaxOptions = {}) {
  const elementRef = useRef<T>(null)

  useEffect(() => {
    const element = elementRef.current
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const finePointer = window.matchMedia('(pointer: fine)')

    if (!element || reducedMotion.matches || !finePointer.matches) return

    let targetX = 0
    let targetY = 0
    let currentX = 0
    let currentY = 0
    let animationFrame = 0

    const updateProperties = () => {
      currentX += (targetX - currentX) * smoothing
      currentY += (targetY - currentY) * smoothing

      element.style.setProperty('--pointer-x-small', `${(currentX * 7).toFixed(2)}px`)
      element.style.setProperty('--pointer-y-small', `${(currentY * 7).toFixed(2)}px`)
      element.style.setProperty('--pointer-x-medium', `${(currentX * 15).toFixed(2)}px`)
      element.style.setProperty('--pointer-y-medium', `${(currentY * 15).toFixed(2)}px`)
      element.style.setProperty('--pointer-x-large', `${(currentX * 28).toFixed(2)}px`)
      element.style.setProperty('--pointer-y-large', `${(currentY * 28).toFixed(2)}px`)
      element.style.setProperty('--pointer-x-reverse', `${(currentX * -10).toFixed(2)}px`)
      element.style.setProperty('--pointer-y-reverse', `${(currentY * -10).toFixed(2)}px`)
      element.style.setProperty('--pointer-rotate-x', `${(currentY * -7).toFixed(2)}deg`)
      element.style.setProperty('--pointer-rotate-y', `${(currentX * 9).toFixed(2)}deg`)
      element.style.setProperty('--pointer-spot-x', `${(50 + currentX * 24).toFixed(2)}%`)
      element.style.setProperty('--pointer-spot-y', `${(50 + currentY * 20).toFixed(2)}%`)

      animationFrame = window.requestAnimationFrame(updateProperties)
    }

    const handlePointerMove = (event: PointerEvent) => {
      targetX = (event.clientX / window.innerWidth - 0.5) * 2
      targetY = (event.clientY / window.innerHeight - 0.5) * 2
    }

    const resetPointer = () => {
      targetX = 0
      targetY = 0
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', resetPointer)
    window.addEventListener('blur', resetPointer)
    animationFrame = window.requestAnimationFrame(updateProperties)

    return () => {
      window.cancelAnimationFrame(animationFrame)
      window.removeEventListener('pointermove', handlePointerMove)
      document.documentElement.removeEventListener('pointerleave', resetPointer)
      window.removeEventListener('blur', resetPointer)
    }
  }, [smoothing])

  return elementRef
}
