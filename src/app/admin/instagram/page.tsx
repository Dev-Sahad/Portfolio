'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Instagram, Plus, Trash2, Edit3, Heart, MessageCircle, ExternalLink, CheckCircle2, Sparkles, RefreshCw, Save } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface InstagramPost {
  id: string
  image_url: string
  caption: string
  likes_count: number
  comments_count: number
  post_url: string
}

export default function AdminInstagramPage() {
  const [posts, setPosts] = useState<InstagramPost[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  // New Post Form
  const [imageUrl, setImageUrl] = useState('')
  const [caption, setCaption] = useState('')
  const [likes, setLikes] = useState(450)
  const [comments, setComments] = useState(32)
  const [postUrl, setPostUrl] = useState('https://www.instagram.com/sahad_____sha/')

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.from('instagram_posts').select('*').order('created_at', { ascending: false })
      if (!error && data) {
        setPosts(data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  const handleAddPost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!imageUrl.trim()) return
    setSaving(true)
    setMessage('')

    try {
      const { data, error } = await supabase.from('instagram_posts').insert([
        {
          image_url: imageUrl.trim(),
          caption: caption.trim() || 'Official Instagram Post @sahad_____sha',
          likes_count: Number(likes),
          comments_count: Number(comments),
          post_url: postUrl.trim(),
        },
      ]).select()

      if (error) {
        setMessage(`Error: ${error.message}`)
      } else {
        setMessage('✅ Instagram Post successfully added to database!')
        setImageUrl('')
        setCaption('')
        fetchPosts()
      }
    } catch (e: any) {
      setMessage(`Error: ${e.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleDeletePost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this Instagram post entry?')) return
    try {
      const { error } = await supabase.from('instagram_posts').delete().eq('id', id)
      if (!error) {
        setPosts(posts.filter((p) => p.id !== id))
        setMessage('🗑️ Post deleted.')
      }
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 text-white p-2">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-2.5">
            <Instagram className="text-pink-400" size={28} /> Instagram Feed Admin Manager
          </h1>
          <p className="text-xs sm:text-sm text-white/60 font-mono mt-1">
            Manage live Instagram feed cards (@sahad_____sha), captions, like counts, and permalinks stored in Supabase.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchPosts}
          className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold hover:bg-white/10 transition"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Data
        </button>
      </div>

      {message && (
        <div className="rounded-xl border border-pink-500/30 bg-pink-500/10 p-4 text-xs font-mono text-pink-300">
          {message}
        </div>
      )}

      {/* Form: Add New Instagram Post */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/15 bg-black/40 p-6 backdrop-blur-xl shadow-xl space-y-4"
      >
        <h2 className="text-lg font-bold flex items-center gap-2 text-pink-300">
          <Plus size={18} /> Add New Instagram Post Entry
        </h2>

        <form onSubmit={handleAddPost} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-mono text-white/70">Image / Thumbnail URL</label>
            <input
              type="text"
              required
              placeholder="https://... or /hero-cyber-portrait.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs text-white placeholder:text-white/30 focus:border-pink-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-mono text-white/70">Post Caption</label>
            <textarea
              rows={2}
              placeholder="Enter post caption & hashtags..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs text-white placeholder:text-white/30 focus:border-pink-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono text-white/70">Likes Count</label>
            <input
              type="number"
              value={likes}
              onChange={(e) => setLikes(Number(e.target.value))}
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs text-white placeholder:text-white/30 focus:border-pink-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono text-white/70">Comments Count</label>
            <input
              type="number"
              value={comments}
              onChange={(e) => setComments(Number(e.target.value))}
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs text-white placeholder:text-white/30 focus:border-pink-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-mono text-white/70">Instagram Post Permalink URL</label>
            <input
              type="text"
              required
              value={postUrl}
              onChange={(e) => setPostUrl(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs text-white placeholder:text-white/30 focus:border-pink-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-3 text-xs font-extrabold text-white shadow-lg hover:brightness-110 transition w-full sm:w-auto"
            >
              <Save size={16} /> {saving ? 'Saving Post...' : 'Save Instagram Post'}
            </button>
          </div>
        </form>
      </motion.div>

      {/* Grid of Existing Posts */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Sparkles className="text-cyan-400" size={18} /> Active Supabase Instagram Feed Entries ({posts.length})
        </h2>

        {loading ? (
          <div className="p-8 text-center text-xs font-mono text-white/50">Loading Instagram database entries...</div>
        ) : posts.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-white/50 border border-dashed border-white/15 rounded-2xl">
            No posts found in database. Add a new post above or execute /api/setup-db.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {posts.map((post) => (
              <div key={post.id} className="rounded-2xl border border-white/15 bg-black/40 overflow-hidden flex flex-col justify-between">
                <div className="aspect-video overflow-hidden relative">
                  <img
                    src={post.image_url}
                    onError={(e: any) => { e.currentTarget.src = '/hero-cyber-portrait.jpg' }}
                    alt={post.caption}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 flex items-center gap-2 bg-black/80 px-2.5 py-1 rounded-full text-[10px] font-mono">
                    <Heart size={12} className="text-pink-400 fill-pink-400" /> {post.likes_count}
                    <MessageCircle size={12} className="text-cyan-400 fill-cyan-400" /> {post.comments_count}
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <p className="text-xs text-white/80 line-clamp-2 font-mono">{post.caption}</p>
                  <a
                    href={post.post_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-pink-400 hover:underline flex items-center gap-1 font-mono"
                  >
                    Open Instagram Link <ExternalLink size={12} />
                  </a>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleDeletePost(post.id)}
                      className="flex items-center gap-1 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/20 transition"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
