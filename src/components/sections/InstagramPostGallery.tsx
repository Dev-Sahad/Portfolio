'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, MessageCircle, Share2, Instagram, CheckCircle2, Bookmark, Grid, Sparkles, ExternalLink } from 'lucide-react'
import { useAudio } from '@/context/AudioContext'

interface InstagramPost {
  id: string
  image: string
  likes: number
  comments: number
  caption: string
  date: string
}

const INSTAGRAM_POSTS: InstagramPost[] = [
  {
    id: 'post-1',
    image: '/hero-cyber-portrait.jpg',
    likes: 428,
    comments: 34,
    caption: 'Cyberpunk Cyber Eye Spec Avatar setup ⚡ Building Next.js 15 & WebGL 3D experience apps. #frontend #developer #cyberpunk',
    date: '2 DAYS AGO',
  },
  {
    id: 'post-2',
    image: '/hero-anime-portrait.jpg',
    likes: 512,
    comments: 48,
    caption: 'Anime Visor edition 🚀 Designing high-performance interactive portfolio systems and telemetry dashboards. #react19 #threejs #webdev',
    date: '5 DAYS AGO',
  },
  {
    id: 'post-3',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop',
    likes: 389,
    comments: 29,
    caption: 'Late night coding sessions & 3D particle shader experimentation 💻✨ @sahad_____sha #ui #ux #javascript',
    date: '1 WEEK AGO',
  },
  {
    id: 'post-4',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop',
    likes: 640,
    comments: 52,
    caption: 'Full-stack Supabase RLS & Next.js edge deployment pipeline complete 🔥 #buildinpublic #fullstack',
    date: '2 WEEKS AGO',
  },
]

export default function InstagramPostGallery() {
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({})
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>(() =>
    INSTAGRAM_POSTS.reduce((acc, p) => ({ ...acc, [p.id]: p.likes }), {})
  )
  const { playClick, playHover, playSuccess } = useAudio()

  const handleLike = (id: string) => {
    playClick()
    setLikedPosts((prev) => {
      const isLiked = !prev[id]
      if (isLiked) playSuccess()
      setLikeCounts((c) => ({
        ...c,
        [id]: isLiked ? c[id] + 1 : c[id] - 1,
      }))
      return { ...prev, [id]: isLiked }
    })
  }

  return (
    <section className="my-16 max-w-6xl mx-auto px-4">
      {/* Instagram Header Banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between rounded-3xl border border-pink-500/30 bg-[#0e0c1a]/90 p-6 backdrop-blur-2xl shadow-[0_0_40px_rgba(236,72,153,0.15)] mb-8">
        <div className="flex items-center gap-4 mb-4 sm:mb-0">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 p-[3px] shadow-lg">
            <img
              src="/hero-cyber-portrait.jpg"
              alt="Muhammad Sahad Instagram Profile"
              className="h-full w-full rounded-full object-cover border-2 border-black"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-lg text-white">sahad_____sha</h3>
              <CheckCircle2 size={16} className="text-cyan-400 fill-cyan-400/20" />
            </div>
            <p className="text-xs text-white/60 font-mono">Muhammad Sahad • Front-End Developer & UI Specialist</p>
            <div className="flex items-center gap-4 text-xs font-mono text-pink-300 mt-1">
              <span><strong>4</strong> posts</span>
              <span><strong>1.2k</strong> followers</span>
              <span><strong>340</strong> following</span>
            </div>
          </div>
        </div>

        <a
          href="https://www.instagram.com/sahad_____sha/"
          target="_blank"
          rel="noopener noreferrer"
          onClick={playClick}
          onMouseEnter={playHover}
          className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg hover:brightness-110 transition"
        >
          <Instagram size={16} /> Follow on Instagram
        </a>
      </div>

      {/* Title */}
      <div className="flex items-center gap-2 font-mono text-xs text-pink-400 uppercase tracking-widest mb-4">
        <Grid size={14} /> Official Instagram Posts Feed (@sahad_____sha)
      </div>

      {/* 4-Post Interactive Photo Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {INSTAGRAM_POSTS.map((post) => {
          const isLiked = likedPosts[post.id]
          const currentLikes = likeCounts[post.id]

          return (
            <motion.div
              key={post.id}
              whileHover={{ y: -6 }}
              className="rounded-3xl border border-white/15 bg-[#0b0c16]/95 overflow-hidden shadow-2xl backdrop-blur-xl flex flex-col group"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between p-3 border-b border-white/10 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-pink-500 animate-pulse" />
                  <span className="font-bold text-white">sahad_____sha</span>
                </div>
                <span className="text-[10px] text-white/40">{post.date}</span>
              </div>

              {/* Photo Area */}
              <div className="relative aspect-square overflow-hidden bg-black/60">
                <img
                  src={post.image}
                  alt={post.caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex items-end">
                  <p className="text-[11px] text-white/90 font-sans line-clamp-3 leading-snug">
                    {post.caption}
                  </p>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-3 bg-[#0c0d18] border-t border-white/10 space-y-2">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleLike(post.id)}
                      className="hover:scale-110 transition"
                      title="Like Post"
                    >
                      <Heart
                        size={18}
                        className={isLiked ? 'fill-pink-500 text-pink-500' : 'text-white/70 hover:text-pink-400'}
                      />
                    </button>
                    <span className="flex items-center gap-1 text-xs text-white/70 font-mono">
                      <MessageCircle size={16} /> {post.comments}
                    </span>
                  </div>
                  <Bookmark size={16} className="text-white/40 hover:text-white" />
                </div>

                <div className="text-xs font-mono text-white/80 font-bold">
                  {currentLikes} likes
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
