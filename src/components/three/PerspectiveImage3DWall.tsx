'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, Sparkles, Layers, ArrowUpRight } from 'lucide-react'
import { useAudio } from '@/context/AudioContext'

interface ShowcaseProject {
  id: string
  title: string
  category: string
  image: string
  url?: string
}

const SHOWCASE_ITEMS: ShowcaseProject[] = [
  { id: '1', title: 'Sahad Cyberpunk Persona Avatar', category: 'Instagram @sahad_____sha', image: '/hero-cyber-portrait.jpg', url: 'https://www.instagram.com/sahad_____sha/' },
  { id: '2', title: 'Sahad Anime Visor Edition', category: 'Instagram @sahad_____sha', image: '/hero-anime-portrait.jpg', url: 'https://www.instagram.com/sahad_____sha/' },
  { id: '3', title: 'Next.js 15 E-Commerce Dashboard', category: 'Web App', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop' },
  { id: '4', title: 'Cyberpunk WebGL 3D Portfolio', category: '3D Experience', image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop' },
  { id: '5', title: 'Realtime Supabase SaaS Hub', category: 'Full Stack', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop' },
  { id: '6', title: 'AI Assistant Co-Pilot Suite', category: 'AI Integration', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop' },
]

export default function PerspectiveImage3DWall() {
  const { playHover } = useAudio()

  return (
    <section className="my-16 overflow-hidden py-10 relative">
      <div className="text-center mb-8 px-4">
        <span className="font-mono text-xs text-cyan-400 uppercase tracking-widest block mb-1">
          * 3D PERSPECTIVE SHOWCASE THEATER
        </span>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white">Interactive 3D Project Showcase Wall</h2>
      </div>

      {/* 3D Perspective Container */}
      <div className="w-full [perspective:1200px] overflow-hidden py-6">
        {/* Row 1 - Rotating left */}
        <div className="flex gap-6 animate-marquee-slow [transform:rotateX(10deg)_rotateY(-12deg)_rotateZ(2deg)] hover:[transform:rotateX(0deg)_rotateY(0deg)_rotateZ(0deg)] transition-all duration-700 ease-out">
          {[...SHOWCASE_ITEMS, ...SHOWCASE_ITEMS].map((item, i) => (
            <motion.div
              key={`${item.id}-${i}`}
              onMouseEnter={playHover}
              whileHover={{ y: -12, scale: 1.08 }}
              className="shrink-0 w-72 h-44 rounded-3xl border border-white/20 bg-[#0d0e1b]/90 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-xl group relative cursor-pointer"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-4 flex flex-col justify-end">
                <span className="text-[10px] font-mono text-cyan-300 uppercase">{item.category}</span>
                <h4 className="font-bold text-sm text-white flex items-center justify-between">
                  {item.title}
                  <ArrowUpRight size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </h4>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Row 2 - Rotating right */}
        <div className="flex gap-6 animate-marquee-reverse-slow mt-6 [transform:rotateX(10deg)_rotateY(-12deg)_rotateZ(2deg)] hover:[transform:rotateX(0deg)_rotateY(0deg)_rotateZ(0deg)] transition-all duration-700 ease-out">
          {[...SHOWCASE_ITEMS, ...SHOWCASE_ITEMS].reverse().map((item, i) => (
            <motion.div
              key={`rev-${item.id}-${i}`}
              onMouseEnter={playHover}
              whileHover={{ y: -12, scale: 1.08 }}
              className="shrink-0 w-72 h-44 rounded-3xl border border-white/20 bg-[#0d0e1b]/90 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-xl group relative cursor-pointer"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-4 flex flex-col justify-end">
                <span className="text-[10px] font-mono text-purple-300 uppercase">{item.category}</span>
                <h4 className="font-bold text-sm text-white flex items-center justify-between">
                  {item.title}
                  <ArrowUpRight size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </h4>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
