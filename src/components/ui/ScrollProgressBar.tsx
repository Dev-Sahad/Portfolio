'use client'

import { motion, useScroll, useSpring } from 'framer-motion'

export default function ScrollProgressBar() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 30,
    restDelta: 0.001,
  })

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-1 z-[10000] origin-left bg-gradient-to-r from-cyan-400 via-violet-500 to-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.7)]"
    />
  )
}
