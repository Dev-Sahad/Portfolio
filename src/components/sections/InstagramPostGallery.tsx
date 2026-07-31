'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Instagram, CheckCircle2, ExternalLink, Pin, Play, Copy, Heart, MessageCircle, Grid, Bookmark, Link as LinkIcon, MapPin, Eye } from 'lucide-react'
import { useAudio } from '@/context/AudioContext'

interface GridPost {
  id: string
  image: string
  postUrl: string
  isPinned?: boolean
  isReel?: boolean
  isCarousel?: boolean
  likes: string
  comments: string
  views?: string
  caption: string
  location?: string
}

const PROFILE_PIC = "https://instagram.ftol2-1.fna.fbcdn.net/v/t51.82787-19/683766249_18314607391302713_2744361709957459017_n.jpg?stp=dst-jpg_s320x320_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=instagram.ftol2-1.fna.fbcdn.net&_nc_cat=105&_nc_oc=Q6cZ2gFXfQEBWUPSonp4Zc8HBcKe6MPXymNJUCOiPMzbKDIY_3U58_eOffYnzRrxwhFe49Y&_nc_ohc=7er7oOWxIUMQ7kNvwHm_vc9&_nc_gid=Mw_U8uEw_i_rtg9ufznuLA&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AQCgoLtY3m0U-NXraGid3wG-VPky9eilQv7ON4ostgG3yA&oe=6A549859&_nc_sid=8b3546"

const INSTAGRAM_GRID: GridPost[] = [
  {
    id: 'post-1',
    image: 'https://instagram.ftol2-1.fna.fbcdn.net/v/t51.82787-15/708254652_18132984598598775_7865932475014215820_n.jpg?stp=dst-jpg_e15_tt6&_nc_ht=instagram.ftol2-1.fna.fbcdn.net&_nc_cat=103&_nc_oc=Q6cZ2gFXfQEBWUPSonp4Zc8HBcKe6MPXymNJUCOiPMzbKDIY_3U58_eOffYnzRrxwhFe49Y&_nc_ohc=74wwzpVMtFsQ7kNvwFz62t8&_nc_gid=Mw_U8uEw_i_rtg9ufznuLA&edm=AOQ1c0wBAAAA&ccb=7-5&ig_cache_key=MzkwNzAyOTY5NDg1MzMwOTU0Mw%3D%3D.3-ccb7-5&oh=00_AQDf6FpketoCXi-cjYRucna2Oq9MzmiMbsJh52AWzRcUcw&oe=6A54B95A&_nc_sid=8b3546',
    postUrl: 'https://www.instagram.com/p/DY4j9GnCFnZ0QBSJoDQL3O8AZKfQbM5YeGD6L00/',
    isPinned: true,
    isCarousel: true,
    likes: '100+',
    comments: '5',
    caption: 'Different day, different drip. ☕️🖤 #menwithstyle #streetwear #eidmubarak #lifestyle #fashiongram',
    location: 'Safari Mall Sharjah 📍',
  },
  {
    id: 'post-2',
    image: 'https://instagram.ftol2-1.fna.fbcdn.net/v/t51.82787-15/710405211_18132984607598775_152351731615104826_n.jpg?stp=dst-jpg_e35_p1080x1080_sh2.08_tt6&_nc_ht=instagram.ftol2-1.fna.fbcdn.net&_nc_cat=103&_nc_oc=Q6cZ2gFXfQEBWUPSonp4Zc8HBcKe6MPXymNJUCOiPMzbKDIY_3U58_eOffYnzRrxwhFe49Y&_nc_ohc=Lnr0tIEQs0EQ7kNvwG0ialX&_nc_gid=Mw_U8uEw_i_rtg9ufznuLA&edm=AOQ1c0wBAAAA&ccb=7-5&ig_cache_key=MzkwNzAyOTcwMDQ0ODYxMzY4MA%3D%3D.3-ccb7-5&oh=00_AQDIJKM9Qpu-ldTf5Rddx7uqT6UT4OQNdRun__JMa2pYaQ&oe=6A5497E1&_nc_sid=8b3546',
    postUrl: 'https://www.instagram.com/p/DY4j9GnCFnZ0QBSJoDQL3O8AZKfQbM5YeGD6L00/',
    isPinned: true,
    isCarousel: true,
    likes: '100+',
    comments: '5',
    caption: 'Mirror selfie fit post. Safari Mall Sharjah 🚗🔥',
    location: 'Safari Mall Sharjah 📍',
  },
  {
    id: 'post-3',
    image: 'https://instagram.ftol2-1.fna.fbcdn.net/v/t51.71878-15/491433335_1843696379758860_6861718011608796917_n.jpg?stp=dst-jpg_e15_tt6&_nc_ht=instagram.ftol2-1.fna.fbcdn.net&_nc_cat=100&_nc_oc=Q6cZ2gFXfQEBWUPSonp4Zc8HBcKe6MPXymNJUCOiPMzbKDIY_3U58_eOffYnzRrxwhFe49Y&_nc_ohc=xToX8b_6LLoQ7kNvwHpdRUP&_nc_gid=Mw_U8uEw_i_rtg9ufznuLA&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AQARe_Jou9qGJw9T3AsvBUvjt-FXGgze3IAey0IwruxvYQ&oe=6A54AB84&_nc_sid=8b3546',
    postUrl: 'https://www.instagram.com/p/C4mdQp5RMmX/',
    isReel: true,
    likes: '488',
    comments: '30',
    views: '11,125',
    caption: '🧸🥹 #fy #fyp #trendingreels #instagram #trendingreels',
    location: 'Kasaragod, Kerala, India 📍',
  },
  {
    id: 'post-4',
    image: '/hero-cyber-portrait.jpg',
    postUrl: 'https://www.instagram.com/sahad_____sha/',
    isCarousel: true,
    likes: '2,150',
    comments: '128',
    caption: 'Cyberpunk avatar portrait showcase. ⚡ #nextjs #webgl #react',
    location: 'Dubai, UAE 📍',
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
  const [activeTab, setActiveTab] = useState<'posts' | 'reels' | 'saved'>('posts')
  const { playClick, playHover } = useAudio()
  const profileUrl = 'https://www.instagram.com/sahad_____sha/'

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
                src={PROFILE_PIC}
                onError={(e: any) => { e.currentTarget.src = '/hero-cyber-portrait.jpg' }}
                alt="Sahad Sha profile picture"
                className="h-full w-full rounded-full object-cover border-4 border-[#0a0a0c]"
              />
            </div>
          </div>

          {/* Profile Bio Details */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-3">
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">sahad_____sha</h2>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={playClick}
                  onMouseEnter={playHover}
                  className="rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-5 py-2 text-xs font-bold text-white shadow-lg hover:brightness-110 transition flex items-center gap-1.5"
                >
                  <Instagram size={14} /> Follow on Instagram
                </a>
                <a
                  href="https://guns.lol/sxhd_sha"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl bg-white/10 border border-white/15 px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/20 transition flex items-center gap-1"
                >
                  Guns.lol <ExternalLink size={12} />
                </a>
              </div>
            </div>

            {/* Full Name & Role */}
            <p className="text-sm font-bold text-white mb-1">Sahad Sha</p>
            <p className="text-xs text-white/60 font-mono mb-3">Web Designer</p>

            {/* Stats Row */}
            <div className="flex justify-center md:justify-start gap-6 text-sm font-sans mb-4 border-y border-white/10 py-2.5">
              <div><strong className="text-white font-bold">4</strong> <span className="text-white/60">posts</span></div>
              <div><strong className="text-white font-bold">11,355</strong> <span className="text-white/60">followers</span></div>
              <div><strong className="text-white font-bold">459</strong> <span className="text-white/60">following</span></div>
            </div>

            {/* Exact Bio Lines from Crawled JSON */}
            <div className="text-xs sm:text-sm text-white/90 space-y-1.5 leading-relaxed font-mono">
              <p className="text-cyan-300 font-bold">𝚠𝚑𝚒𝚕𝚎(𝚝𝚛𝚞𝚎)&#123; 𝚋𝚞𝚒𝚕𝚍(); 𝚜𝚌𝚊𝚕𝚎(); &#125;</p>
              <p>Developer 💻</p>
              <p>Fix Broken Code👨🏻💻, Not Heart’❤️🩹</p>
              <p className="text-pink-300">PvtStuff: @sxhd_sha 🫴🏻</p>

              {/* External Links */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
                <a
                  href="https://guns.lol/sxhd_sha"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:underline font-bold"
                >
                  <LinkIcon size={12} /> Guns.lol
                </a>
                <span className="text-white/30">•</span>
                <a
                  href="https://sahad.is-a.dev/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-pink-400 hover:underline font-bold"
                >
                  <LinkIcon size={12} /> My Portfolio 📝 (sahad.is-a.dev)
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Highlights Bar */}
        <div className="flex gap-4 overflow-x-auto py-5 no-scrollbar border-b border-white/10">
          {HIGHLIGHTS.map((hl) => (
            <div key={hl.name} className="flex flex-col items-center gap-2 shrink-0 cursor-pointer group">
              <div className={`flex h-14 w-14 items-center justify-center rounded-full border-2 p-1 font-bold text-xs shadow-lg transition-transform group-hover:scale-105 ${hl.color}`}>
                {hl.label}
              </div>
              <span className="text-[11px] font-mono text-white/60">{hl.name}</span>
            </div>
          ))}
        </div>

        {/* Tab Switcher (Posts / Reels / Saved) */}
        <div className="flex justify-center gap-8 border-b border-white/10 text-xs font-mono tracking-widest uppercase">
          <button
            type="button"
            onClick={() => { playClick(); setActiveTab('posts'); }}
            className={`py-4 flex items-center gap-2 border-t-2 transition ${activeTab === 'posts' ? 'border-white text-white font-bold' : 'border-transparent text-white/40 hover:text-white'
              }`}
          >
            <Grid size={14} /> POSTS (4)
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

        {/* Real Post Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {INSTAGRAM_GRID.map((post) => (
            <a
              key={post.id}
              href={post.postUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={playClick}
              className="group relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-black/60 cursor-pointer shadow-lg"
            >
              <img
                src={post.image}
                onError={(e: any) => { e.currentTarget.src = '/hero-cyber-portrait.jpg' }}
                alt={post.caption}
                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 opacity-90 group-hover:opacity-100"
              />

              {/* Badges */}
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

              {/* Hover Overlay with Real Captions, Likes, Views */}
              <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-between text-white">
                <div className="flex flex-col items-center justify-center gap-2 my-auto font-mono text-xs font-bold text-center">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1"><Heart size={16} className="fill-white text-pink-500" /> {post.likes}</span>
                    <span className="flex items-center gap-1"><MessageCircle size={16} className="fill-white" /> {post.comments}</span>
                  </div>
                  {post.views && (
                    <span className="flex items-center gap-1 text-cyan-300"><Eye size={14} /> {post.views} views</span>
                  )}
                </div>

                <div className="text-[11px] font-sans text-white/90 leading-snug">
                  {post.location && <p className="text-[10px] font-mono text-cyan-300 mb-0.5">{post.location}</p>}
                  <p className="line-clamp-2">{post.caption}</p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
