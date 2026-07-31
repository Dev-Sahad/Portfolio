'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Instagram, CheckCircle2, ExternalLink, Pin, Play, Copy, Heart, MessageCircle, Grid, Bookmark, UserCheck, Link as LinkIcon, MapPin } from 'lucide-react'
import { useAudio } from '@/context/AudioContext'

interface GridPost {
  id: string
  image: string
  postUrl?: string
  isPinned?: boolean
  isReel?: boolean
  isCarousel?: boolean
  likes: string
  comments: string
  caption: string
}

const INSTAGRAM_GRID: GridPost[] = [
  {
    id: 'post-1',
    image: '/hero-cyber-portrait.jpg',
    postUrl: 'https://www.instagram.com/sahad_____sha/',
    isPinned: true,
    likes: '1,420',
    comments: '84',
    caption: 'Standing tall outside. Blue jersey #10 style. #lifestyle #dubai',
  },
  {
    id: 'post-2',
    image: '/hero-anime-portrait.jpg',
    postUrl: 'https://www.instagram.com/sahad_____sha/',
    isPinned: true,
    likes: '2,150',
    comments: '128',
    caption: 'Traditional black kurta outfit with brother by the ride. 🚗🔥',
  },
  {
    id: 'post-3',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop',
    postUrl: 'https://www.instagram.com/sahad_____sha/',
    isReel: true,
    likes: '3,890',
    comments: '210',
    caption: 'Oversized brown streetwear fit in white flower garden 🌸',
  },
  {
    id: 'post-4',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop',
    postUrl: 'https://www.instagram.com/sahad_____sha/',
    isCarousel: true,
    likes: '4,520',
    comments: '340',
    caption: 'Gym session mirror selfie with headphones 🎧 No pain no gain. 💪',
  },
  {
    id: 'post-5',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop',
    postUrl: 'https://www.instagram.com/sahad_____sha/',
    isCarousel: true,
    likes: '1,890',
    comments: '95',
    caption: 'White graphic tee & blue denim streetwear wall pose. ⚡',
  },
  {
    id: 'post-6',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop',
    postUrl: 'https://www.instagram.com/sahad_____sha/',
    likes: '2,340',
    comments: '112',
    caption: 'Green collar sweater outfit leaning by the pillar. 🌿',
  },
  {
    id: 'post-7',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
    postUrl: 'https://www.instagram.com/sahad_____sha/',
    isReel: true,
    likes: '5,100',
    comments: '412',
    caption: 'Outdoor garden aesthetic portrait reel ✨',
  },
  {
    id: 'post-8',
    image: '/hero-cyber-portrait.jpg',
    postUrl: 'https://www.instagram.com/sahad_____sha/',
    isCarousel: true,
    likes: '1,780',
    comments: '88',
    caption: 'Plaid shirt casual look by the entrance door. 🚪',
  },
  {
    id: 'post-9',
    image: '/hero-anime-portrait.jpg',
    postUrl: 'https://www.instagram.com/sahad_____sha/',
    isCarousel: true,
    likes: '3,210',
    comments: '164',
    caption: 'Red & white hoodie combo with shades outdoors 🕶️🔥',
  },
]

const HIGHLIGHTS = [
  { name: 'SxHD', label: 'SxHD', color: 'bg-red-950 text-red-500 border-red-500/40' },
  { name: 'Music', label: '🎧', color: 'bg-zinc-900 text-white border-white/20' },
  { name: 'Glow', label: '✨', color: 'bg-pink-950 text-pink-400 border-pink-500/40' },
  { name: 'Mx', label: 'Mx', color: 'bg-slate-900 text-cyan-300 border-cyan-500/40' },
  { name: 'K', label: 'K...', color: 'bg-zinc-900 text-amber-300 border-amber-500/40' },
  { name: 'MINNAL', label: 'MINNAL', color: 'bg-rose-950 text-rose-400 border-rose-500/40' },
  { name: 'Cyber', label: '🔥', color: 'bg-cyan-950 text-cyan-400 border-cyan-500/40' },
]

export default function InstagramPostGallery() {
  const [activeTab, setActiveTab] = useState<'posts' | 'reels' | 'saved' | 'tagged'>('posts')
  const { playClick, playHover } = useAudio()
  const profileUrl = 'https://instagram.com/sahad_____sha/'

  return (
    <section className="my-16 max-w-5xl mx-auto px-4 font-sans">
      {/* Instagram Profile Outer Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-3xl border border-white/15 bg-[#0a0a0c] p-6 sm:p-10 shadow-2xl text-white backdrop-blur-2xl"
      >
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 border-b border-white/10 pb-8">
          {/* Avatar Container with Ring */}
          <div className="relative shrink-0">
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 p-1 shadow-2xl">
              <img
                src="/hero-cyber-portrait.jpg"
                alt="sahad_____sha profile picture"
                className="h-full w-full rounded-full object-cover border-4 border-[#0a0a0c]"
              />
            </div>
            <div className="absolute top-0 right-0 bg-black/80 text-[10px] font-mono px-2 py-0.5 rounded-full border border-white/20 text-white/70">
              Note...
            </div>
          </div>

          {/* Profile Bio Details */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">sahad_____sha</h2>
                {/* Official Verified Blue Badge */}
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-500 text-white">
                  <CheckCircle2 size={14} className="fill-sky-500 text-black" />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={playClick}
                  onMouseEnter={playHover}
                  className="rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-2 text-xs font-bold text-white shadow-lg hover:brightness-110 transition"
                >
                  Follow on Instagram
                </a>
                <a
                  href={profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl bg-white/10 border border-white/15 px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/20 transition flex items-center gap-1"
                >
                  View Profile <ExternalLink size={12} />
                </a>
              </div>
            </div>

            {/* Sub-handle */}
            <p className="text-xs text-white/60 font-mono mb-3">
              ⚡ Sᴀʜᴀᴅ Sʜᴀ ɪɴ 🇦🇪 he/him
            </p>

            {/* Stats Row */}
            <div className="flex justify-center md:justify-start gap-6 text-sm font-sans mb-4 border-y border-white/10 py-3">
              <div><strong className="text-white font-bold">9</strong> <span className="text-white/60">posts</span></div>
              <div><strong className="text-white font-bold">11.3k</strong> <span className="text-white/60">followers</span></div>
              <div><strong className="text-white font-bold">475</strong> <span className="text-white/60">following</span></div>
            </div>

            {/* Bio Lines */}
            <div className="text-xs sm:text-sm text-white/80 space-y-1 leading-relaxed font-mono">
              <p className="text-white/50">Web designer</p>
              <p className="text-cyan-300 font-bold">while (true) &#123; build(); scale(); &#125;</p>
              <p>DEVELOPER 💻</p>
              <p>FIXING BROKEN CODE 💻 , NOT HEARTS 💗</p>
              <p className="text-pink-300">📍 @sxhd_sha</p>
              <a
                href={profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-cyan-400 hover:underline font-bold"
              >
                <LinkIcon size={12} /> sahad.is-a.dev and 1 more
              </a>
            </div>
          </div>
        </div>

        {/* Highlights Bar */}
        <div className="flex gap-4 overflow-x-auto py-6 no-scrollbar border-b border-white/10">
          {HIGHLIGHTS.map((hl) => (
            <div key={hl.name} className="flex flex-col items-center gap-2 shrink-0 cursor-pointer group">
              <div className={`flex h-16 w-16 items-center justify-center rounded-full border-2 p-1 font-bold text-xs shadow-lg transition-transform group-hover:scale-105 ${hl.color}`}>
                {hl.label}
              </div>
              <span className="text-[11px] font-mono text-white/60">{hl.name}</span>
            </div>
          ))}
        </div>

        {/* Tab Switcher (Posts / Reels / Saved / Tagged) */}
        <div className="flex justify-center gap-8 border-b border-white/10 text-xs font-mono tracking-widest uppercase">
          <button
            type="button"
            onClick={() => { playClick(); setActiveTab('posts'); }}
            className={`py-4 flex items-center gap-2 border-t-2 transition ${activeTab === 'posts' ? 'border-white text-white font-bold' : 'border-transparent text-white/40 hover:text-white'
              }`}
          >
            <Grid size={14} /> POSTS (9)
          </button>
          <button
            type="button"
            onClick={() => { playClick(); setActiveTab('reels'); }}
            className={`py-4 flex items-center gap-2 border-t-2 transition ${activeTab === 'reels' ? 'border-white text-white font-bold' : 'border-transparent text-white/40 hover:text-white'
              }`}
          >
            <Play size={14} /> REELS
          </button>
          <button
            type="button"
            onClick={() => { playClick(); setActiveTab('saved'); }}
            className={`py-4 flex items-center gap-2 border-t-2 transition ${activeTab === 'saved' ? 'border-white text-white font-bold' : 'border-transparent text-white/40 hover:text-white'
              }`}
          >
            <Bookmark size={14} /> SAVED
          </button>
        </div>

        {/* 3x3 Photo Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-6">
          {INSTAGRAM_GRID.map((post) => (
            <a
              key={post.id}
              href={post.postUrl || profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={playClick}
              className="group relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-black/60 cursor-pointer"
            >
              <img
                src={post.image}
                alt={post.caption}
                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 opacity-90 group-hover:opacity-100"
              />

              {/* Pin / Reel Badges */}
              <div className="absolute top-3 right-3 z-10 flex items-center gap-1">
                {post.isPinned && (
                  <span className="rounded-full bg-black/70 p-1.5 text-white backdrop-blur-md" title="Pinned Post">
                    <Pin size={12} className="fill-white" />
                  </span>
                )}
                {post.isReel && (
                  <span className="rounded-full bg-black/70 p-1.5 text-white backdrop-blur-md" title="Instagram Reel">
                    <Play size={12} className="fill-white" />
                  </span>
                )}
                {post.isCarousel && (
                  <span className="rounded-full bg-black/70 p-1.5 text-white backdrop-blur-md" title="Carousel Post">
                    <Copy size={12} />
                  </span>
                )}
              </div>

              {/* Hover Stats & Caption Overlay */}
              <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-between text-white">
                <div className="flex items-center justify-center gap-6 my-auto font-mono text-sm font-bold">
                  <span className="flex items-center gap-1.5"><Heart size={18} className="fill-white" /> {post.likes}</span>
                  <span className="flex items-center gap-1.5"><MessageCircle size={18} className="fill-white" /> {post.comments}</span>
                </div>
                <p className="text-[11px] font-sans text-white/90 line-clamp-2 leading-snug">
                  {post.caption}
                </p>
              </div>
            </a>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
