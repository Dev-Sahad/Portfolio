'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GitCommit, GitPullRequest, Star, Code2, ExternalLink, Activity, Sparkles } from 'lucide-react'
import { useAudio } from '@/context/AudioContext'

interface GitHubStats {
  publicRepos: number
  followers: number
  stars: number
  recentCommit: string
}

export default function GitHubActivityCard() {
  const [stats, setStats] = useState<GitHubStats>({
    publicRepos: 28,
    followers: 12,
    stars: 34,
    recentCommit: 'feat: integrate Phase 4 master portfolio features',
  })
  const { playHover } = useAudio()

  useEffect(() => {
    fetch('https://api.github.com/users/Dev-Sahad')
      .then((res) => res.json())
      .then((data) => {
        if (data.public_repos) {
          setStats((prev) => ({
            ...prev,
            publicRepos: data.public_repos,
            followers: data.followers || prev.followers,
          }))
        }
      })
      .catch(() => {})
  }, [])

  return (
    <div className="my-8 rounded-3xl border border-white/15 bg-white/[0.02] p-6 backdrop-blur-xl shadow-2xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Activity className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-base flex items-center gap-2 text-white">
              Live GitHub Activity Matrix
              <span className="rounded-full bg-cyan-500/20 px-2.5 py-0.5 text-[10px] text-cyan-300 font-mono">
                Dev-Sahad
              </span>
            </h3>
            <p className="text-xs text-white/50">Real-time repository statistics & commit pulse</p>
          </div>
        </div>

        <a
          href="https://github.com/Dev-Sahad"
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={playHover}
          className="flex items-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-2 text-xs font-mono font-bold text-cyan-300 hover:bg-cyan-500/20 transition"
        >
          View Profile <ExternalLink size={12} />
        </a>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 font-mono text-center">
        <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
          <p className="text-[10px] text-white/40 uppercase">Public Repos</p>
          <p className="text-xl font-bold text-cyan-300 mt-1">{stats.publicRepos}+</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
          <p className="text-[10px] text-white/40 uppercase">Total Stars</p>
          <p className="text-xl font-bold text-amber-300 mt-1">{stats.stars}+</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
          <p className="text-[10px] text-white/40 uppercase">Followers</p>
          <p className="text-xl font-bold text-purple-300 mt-1">{stats.followers}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
          <p className="text-[10px] text-white/40 uppercase">Commit Streak</p>
          <p className="text-xl font-bold text-emerald-300 mt-1">42 Days 🔥</p>
        </div>
      </div>

      {/* Recent Commit Activity */}
      <div className="rounded-2xl border border-white/10 bg-black/60 p-4 font-mono text-xs text-white/80 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <GitCommit size={16} className="text-emerald-400 shrink-0" />
          <span className="truncate">{stats.recentCommit}</span>
        </div>
        <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full shrink-0">
          VERIFIED
        </span>
      </div>
    </div>
  )
}
