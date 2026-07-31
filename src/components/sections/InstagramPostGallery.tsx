'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Instagram, CheckCircle2, ExternalLink, Sparkles, Image as ImageIcon, Camera } from 'lucide-react'
import { useAudio } from '@/context/AudioContext'

export default function InstagramPostGallery() {
  const { playClick, playHover } = useAudio()
  const profileUrl = 'https://www.instagram.com/sahad_____sha/'

  return (
    <section className="my-16 max-w-6xl mx-auto px-4">
      {/* Official Instagram Live Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative overflow-hidden rounded-3xl border border-pink-500/40 bg-gradient-to-br from-[#140c1d] via-[#0d0e1a] to-[#070914] p-6 sm:p-8 backdrop-blur-2xl shadow-[0_0_50px_rgba(236,72,153,0.2)]"
      >
        {/* Top Glow Halo */}
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-pink-500/20 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 p-1 shadow-2xl">
              <img
                src="/hero-cyber-portrait.jpg"
                alt="Muhammad Sahad Official Instagram Profile"
                className="h-full w-full rounded-full object-cover border-2 border-black"
              />
            </div>

            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <h3 className="font-extrabold text-2xl text-white tracking-tight">sahad_____sha</h3>
                <CheckCircle2 size={20} className="text-pink-400 fill-pink-400/20" />
              </div>
              <p className="text-xs text-white/70 font-mono mb-2">Muhammad Sahad • Front-End Developer & UI Specialist</p>
              <p className="text-xs text-white/50 max-w-md">
                Official Instagram feed & creative design updates. Follow for Next.js 15, WebGL 3D experience reels, and UI showcases.
              </p>
            </div>
          </div>

          {/* Action Button */}
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={playClick}
            onMouseEnter={playHover}
            className="flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 px-6 py-3.5 text-xs font-extrabold text-white shadow-xl hover:brightness-110 hover:scale-105 transition duration-300 shrink-0"
          >
            <Instagram size={18} /> View @sahad_____sha on Instagram <ExternalLink size={14} />
          </a>
        </div>

        {/* Live Instagram Post Cards Showcase */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8 pt-6 border-t border-white/10">
          {/* Post 1 */}
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={playClick}
            onMouseEnter={playHover}
            className="group relative flex flex-col rounded-2xl border border-white/15 bg-black/40 overflow-hidden hover:border-pink-500/50 transition duration-300"
          >
            <div className="aspect-video overflow-hidden relative">
              <img
                src="/hero-cyber-portrait.jpg"
                alt="Sahad Cyberpunk Avatar Post"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-4 flex items-end">
                <span className="text-xs font-mono text-pink-300 flex items-center gap-1.5">
                  <Camera size={14} /> View Latest Cyberpunk Portrait Post
                </span>
              </div>
            </div>
            <div className="p-4 flex items-center justify-between text-xs font-mono text-white/80 bg-[#0a0c16]">
              <span>@sahad_____sha</span>
              <span className="text-pink-400 font-bold flex items-center gap-1">Open Post <ExternalLink size={12} /></span>
            </div>
          </a>

          {/* Post 2 */}
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={playClick}
            onMouseEnter={playHover}
            className="group relative flex flex-col rounded-2xl border border-white/15 bg-black/40 overflow-hidden hover:border-pink-500/50 transition duration-300"
          >
            <div className="aspect-video overflow-hidden relative">
              <img
                src="/hero-anime-portrait.jpg"
                alt="Sahad Anime Visor Edition Post"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-4 flex items-end">
                <span className="text-xs font-mono text-pink-300 flex items-center gap-1.5">
                  <Sparkles size={14} /> View Anime Visor Edition Post
                </span>
              </div>
            </div>
            <div className="p-4 flex items-center justify-between text-xs font-mono text-white/80 bg-[#0a0c16]">
              <span>@sahad_____sha</span>
              <span className="text-pink-400 font-bold flex items-center gap-1">Open Post <ExternalLink size={12} /></span>
            </div>
          </a>
        </div>
      </motion.div>
    </section>
  )
}
