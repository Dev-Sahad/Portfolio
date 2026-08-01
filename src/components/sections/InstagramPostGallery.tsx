'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Instagram, CheckCircle2, ExternalLink, Pin, Play, Copy, Heart, MessageCircle, Grid, Bookmark, Link as LinkIcon, MapPin, Eye } from 'lucide-react'
import { useAudio } from '@/context/AudioContext'
import { supabase } from '@/lib/supabase'

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

interface LiveInstagramAccount {
  username: string
  name: string | null
  biography: string | null
  website: string | null
  profile_picture_url: string | null
  followers_count: number
  follows_count: number
  media_count: number
}

interface LiveInstagramMedia {
  id: string
  media_type: string
  media_product_type: string
  media_url: string | null
  thumbnail_url: string | null
  permalink: string
  caption: string | null
  like_count: number
  comments_count: number
  posted_at?: string | null
}

interface InstagramPostGalleryProps {
  initialAccount?: LiveInstagramAccount | null
  initialMedia?: LiveInstagramMedia[]
}

const mapLiveMedia = (items: LiveInstagramMedia[]): GridPost[] => items.map((item) => ({
  id: item.id,
  image: item.thumbnail_url || item.media_url || '/hero-cyber-portrait.jpg',
  postUrl: item.permalink,
  isReel: item.media_product_type === 'REELS',
  isCarousel: item.media_type === 'CAROUSEL_ALBUM',
  likes: String(item.like_count || 0),
  comments: String(item.comments_count || 0),
  caption: item.caption || 'Instagram media',
}))

const PROFILE_PIC = "https://scontent.cdninstagram.com/v/t51.82787-19/683766249_18314607391302713_2744361709957459017_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_cat=102&ccb=7-5&_nc_sid=f7ccc5&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy4xMDgwLkMzIn0%3D&_nc_ohc=Sz5jW7y0jYwQ7kNvwEbTgId&_nc_oc=Adpf7AFfRTY1ZduD488bEFs_RaUxtREJuuZxQiTcQb5KgQdULpoUNqAZBDNNjOLu8Ig&_nc_zt=24&_nc_ht=scontent.cdninstagram.com&_nc_gid=BVxtCcXPgZ5lz3sdw1fR4w&_nc_ss=7b6a8&oh=00_AQEc9LGAmKVEjRI9A7x_u2cjSuYkS-Zj7j4YXS9xCVZ-QA&oe=6A72EAD9"

const INSTAGRAM_GRID: GridPost[] = [
  {
    id: 'post-1',
    image: 'https://instagram.ffjr1-3.fna.fbcdn.net/v/t51.82787-15/708254652_18132984598598775_7865932475014215820_n.jpg?stp=dst-jpg_e35_p480x480_tt6&_nc_cat=108&_nc_map=urlgen_bucketless&ig_cache_key=MzkwNzAyOTY5NDg1MzMwOTU0Mw%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6IkNBUk9VU0VMX0lURU0ueHBpZHMuMTAyMy5zZHIucmVndWxhcl9waG90by5DMyJ9&_nc_ohc=b0sic4aNwowQ7kNvwH_j4cU&_nc_oc=AdqoQ2C4NQ5-620EB7jNvSJBidqx9cvPEqje5akGU0msuTHJgOVnaoblDceyvW0hI7o&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=instagram.ffjr1-3.fna&_nc_gid=7OgIwLfIrzrkyULul0nVZg&_nc_ss=7a22e&oh=00_AQFupVHr8YZ9Kj96CCv1M0TsgXlEiLpu_ByRYGsCL8XUvg&oe=6A72D39A',
    postUrl: 'https://www.instagram.com/sxhd_sha/p/DY4j9GnCFnZ0QBSJoDQL3O8AZKfQbM5YeGD6L00/?hl=en',
    isPinned: true,
    isCarousel: true,
    likes: '100+',
    comments: '5',
    caption: 'Different day, different drip. ☕️🖤 #menwithstyle #streetwear #eidmubarak #lifestyle #fashiongram',
    location: 'Safari Mall Sharjah 📍',
  },
  {
    id: 'post-2',
    image: 'https://instagram.ffjr1-4.fna.fbcdn.net/v/t51.82787-15/625081274_18078888470215555_4106789207188025613_n.webp?stp=dst-webp_p480x480&_nc_cat=105&_nc_map=urlgen_bucketless&ig_cache_key=MzM6MTg6MjQ1NDIzMjM0MTUwMw%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6IkZFRUQueHBpZHMuMTA4MC5zZHIucmVndWxhcl9waG90by5DMyJ9&_nc_ohc=vHTKnyWiZmUQ7kNvwG2W-Fu&_nc_oc=Adq-5UyUASU1l8p3FKcJZ3u4mVUlS--XD-7T0OLfbuEjFmFkYqgBkfd7_PNPhlKAZ7g&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=instagram.ffjr1-4.fna&_nc_gid=7OgIwLfIrzrkyULul0nVZg&_nc_ss=7a22e&oh=00_AQGNeQQKXAdXosKoTeYbo_Ih--KCajFKdO5elYsLbK4joQ&oe=6A72EC36',
    postUrl: 'https://www.instagram.com/sxhd_sha/p/C6nvBcYPdv_aQyIi64IQb7MWFTnI8hmfpZQcgM0/?hl=en',
    isPinned: true,
    isCarousel: true,
    likes: '4,720',
    comments: '34',
    caption: 'Oversized streetwear drip & car vibes 🚗🔥',
    location: 'Sharjah, UAE 📍',
  },
  {
    id: 'reel-1',
    image: 'https://instagram.ffjr1-1.fna.fbcdn.net/v/t51.71878-15/501519752_1034357782130027_5631186158904034494_n.jpg?stp=dst-jpg_e15_p480x480_tt6&_nc_cat=105&_nc_map=urlgen_bucketless&ig_cache_key=MzMyNzg6MzA4MTI5NTI0Mzc0MA%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6IkNMSVBTLnhwaWRzLjIyNjguc2RyLnZpZGVvX2RlZmF1bHRfY292ZXJfZnJhbWUuQzMifQ%3D%3D&_nc_ohc=cpLOqojEtWEQ7kNvwFrOuam&_nc_oc=Ado8jvRRJW9zuxtIx-GL4UlZ4xXtDDTjZpRalS71Xt_wMkODLEiZk1aWAIHIhPeAbkA&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=instagram.ffjr1-1.fna&_nc_gid=7OgIwLfIrzrkyULul0nVZg&_nc_ss=7a22e&oh=00_AQGQfC2MovbWttQ7wKy_OiCgOoX6LbGloY0MICfaJ2vBow&oe=6A73026F',
    postUrl: 'https://www.instagram.com/sxhd_sha/reel/C4u8dc1vWncx7H542EdpjU-uwQh5E7I9gHVTBE0/?hl=en',
    isReel: true,
    likes: '8,950',
    comments: '64',
    views: '15,400',
    caption: 'Trending aesthetic reel vibes ✨ #reels #dubai',
    location: 'Dubai, UAE 📍',
  },
  {
    id: 'post-3',
    image: 'https://instagram.ffjr1-1.fna.fbcdn.net/v/t51.82787-15/551499801_18106688197598775_2867788868625513353_n.jpg?stp=dst-jpg_e35_p480x480_tt6&_nc_cat=109&_nc_map=urlgen_bucketless&ig_cache_key=MzcyNTQyNDY2Mzc7MTM4Mjc0Mw%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6IkNBUk9VU0VMX0lURU0ueHBpZHMuNzY4LnNkci5yZWd1bGFyX3Bob3RvLkMzIn0%3D&_nc_ohc=6f_Vi0D5KZYQ7kNvwE0-62U&_nc_oc=AdpU3xBU8FHMsMcagpFKETLVz_ePdFXWGqDamYVU-atZd9UzbFchm8v6ZIaluW1CMmM&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=instagram.ffjr1-1.fna&_nc_gid=7OgIwLfIrzrkyULul0nVZg&_nc_ss=7a22e&oh=00_AQE_vJZpbVcEPFyeS1DbMbmVBDVlfDu0D-OA-EdanuCftw&oe=6A730344',
    postUrl: 'https://www.instagram.com/sxhd_sha/p/DOzXgAwEojhaATRyy0PsQ2C9iwZ431Cj3yMkzc0/?hl=en',
    isCarousel: true,
    likes: '6,540',
    comments: '42',
    caption: 'Casual sunset photoshoot 📸🌅',
    location: 'Dubai, UAE 📍',
  },
  {
    id: 'post-4',
    image: 'https://instagram.ffjr8-1.fna.fbcdn.net/v/t51.82787-15/653511854_18083319182604989_6847857828392533047_n.jpg?stp=dst-jpg_e35_p480x480_tt6&_nc_cat=110&_nc_map=urlgen_bucketless&ig_cache_key=MzA6ODMxNzUxNTc4ODQ0MzUyNQ%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6IkNBUk9VU0VMX0lURU0ueHBpZHMuMTQ0MC5zZHIucmVndWxhcl9waG90by5DMyJ9&_nc_ohc=xn50ShMzMLMQ7kNvwELUQKA&_nc_oc=AdrSkCrqfU_27it2aFXA5eSAZCfDl0bpFUpKfzgBw4L6ZpaH1kapnSHc_TnnrFFUMkM&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=instagram.ffjr8-1.fna&_nc_gid=7OgIwLfIrzrkyULul0nVZg&_nc_ss=7a22e&oh=00_AQFuTGNOpfR2JJ_hxV4_0svaL42oHH7roOgBWlwKcMWJgg&oe=6A730222',
    postUrl: 'https://www.instagram.com/sahad_____sha/p/CqU2ob2rqRO/?hl=en',
    isCarousel: true,
    likes: '12,250',
    comments: '92',
    caption: 'White graphic tee & blue denim streetwear wall pose. ⚡',
    location: 'Dubai, UAE 📍',
  },
  {
    id: 'post-5',
    image: 'https://instagram.ffjr1-2.fna.fbcdn.net/v/t51.82787-15/638900458_18450972757096202_1595816522331517599_n.webp?stp=dst-webp_p480x480&_nc_cat=109&_nc_map=urlgen_bucketless&ig_cache_key=Mjk0NTcwODQ3MTQ1MDcxOTE3MQ%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6IkZFRUQueHBpZHMuMTA8MC5zZHIucmVndWxhcl9waG90by5DMyJ9&_nc_ohc=8fwpHtfTXPkQ7kNvwEFPrMk&_nc_oc=AdrIn3rYt6TXjYXOXg_jdS3PcrITjz3i0quqXUQOGrj6tQTP_4_B21UWWGmw2_mIC5c&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=instagram.ffjr1-2.fna&_nc_gid=7OgIwLfIrzrkyULul0nVZg&_nc_ss=7a22e&oh=00_AQGM3eaoumwK79IhTnC01ZgZvZ_MKNbzFkNauLBZ7kICbg&oe=6A72F9F1',
    postUrl: 'https://www.instagram.com/sahad_____sha/p/CjhQj9srdPD/?hl=en',
    isCarousel: true,
    likes: '1,890',
    comments: '110',
    caption: 'Autumn streetwear collection pose 🍁',
    location: 'Kerala, India 📍',
  },
  {
    id: 'reel-2',
    image: 'https://instagram.ffjr1-3.fna.fbcdn.net/v/t51.71878-15/491433335_1843696379758860_6861718011608796917_n.jpg?stp=dst-jpg_e15_p480x480_tt6&_nc_cat=103&_nc_map=urlgen_bucketless&ig_cache_key=MzMyNTQ3NDA2MjcwNDM2MzkyNw%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6IkNMSVBTLnhwaWRzLjcyMC5zZHIudmlkZW9fZGVmYXVsdF9jb3Zlcl9mcmFtZS5DMyJ9&_nc_ohc=AgsrYuRVOtgQ7kNvwHuuA5n&_nc_oc=AdrB3apX0-yg-pR1ydqduQOt11a_RdeELMjlS8uSahgl903iHdRveVkX_o95ATu0UA4&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=instagram.ffjr1-3.fna&_nc_gid=7OgIwLfIrzrkyULul0nVZg&_nc_ss=7a22e&oh=00_AQEs31_TJLONETYf27i1km8lk9y08UMyZ6V06gplrpGp8A&oe=6A72FE04',
    postUrl: 'https://www.instagram.com/sahad_____sha/reel/C4mdQp5RMmX/?hl=en',
    isReel: true,
    likes: '4,887',
    comments: '30',
    views: '11,125',
    caption: '🧸🥹 #fy #fyp #trendingreels #instagram #trendingreels',
    location: 'Kasaragod, Kerala, India 📍',
  },
  {
    id: 'post-6',
    image: 'https://instagram.ffjr1-1.fna.fbcdn.net/v/t51.82787-15/669896525_18116990392671883_404786775128994916_n.jpg?stp=dst-jpg_e35_p480x480_tt6&_nc_cat=107&_nc_map=urlgen_bucketless&ig_cache_key=MzA3MTA4Njc2OTg2NDY0ODgyOA%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6IkNBUk9VU0VMX0lURU0ueHBpZHMuMTQ0MC5zZHIucmVndWxhcl9waG90by5DMyJ9&_nc_ohc=__Z6vYziTbYQ7kNvwFmGUhH&_nc_oc=Adqv-3y9IUwBUuZpcW7tgrcv4yuhrpINjwCWfwejz8FxFhs2QWjo4UM4xwKI5abuPk8&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=instagram.ffjr1-1.fna&_nc_gid=7OgIwLfIrzrkyULul0nVZg&_nc_ss=7a22e&oh=00_AQHFBb9jLz-EPUoQFpvkEzcW3Z-6j3_2hMWoWJVFY82b4Q&oe=6A72EDE9',
    postUrl: 'https://www.instagram.com/sahad_____sha/p/CqesSZXLgj9/?hl=en',
    isCarousel: true,
    likes: '1,780',
    comments: '88',
    caption: 'Green collar sweater outfit leaning by the pillar. 🌿',
    location: 'Sharjah, UAE 📍',
  },
  {
    id: 'post-7',
    image: 'https://instagram.ffjr1-5.fna.fbcdn.net/v/t51.82787-15/628294200_18363212107160093_3442531180608265819_n.jpg?stp=dst-jpg_e35_p480x480_tt6&_nc_cat=111&_nc_map=urlgen_bucketless&ig_cache_key=MjY4OTExNTIzNTgyODE2NDczMQ%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6IkZFRUQueHBpZHMuMTQ0MC5zZHIucmVndWxhcl9waG90by5DMyJ9&_nc_ohc=phyJQiE3afUQ7kNvwFeT9sw&_nc_oc=AdrUKBBdTte-nMzwlQjJBNu73cWEYLsJuPBO5tqrD-Be0zm8CkoEvzH_n6dmxiPOLb8&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=instagram.ffjr1-5.fna&_nc_gid=7OgIwLfIrzrkyULul0nVZg&_nc_ss=7a22e&oh=00_AQE5nEmJfGl18ernatzUH-xW7nDGb4sipoc1AQdj-CS16w&oe=6A72DCCE',
    postUrl: 'https://www.instagram.com/sahad_____sha/p/CVRqA83oOh7/?hl=en',
    isCarousel: true,
    likes: '2,340',
    comments: '145',
    caption: 'Outdoor garden aesthetic portrait 🍃',
    location: 'Kerala, India 📍',
  },
  {
    id: 'post-8',
    image: 'https://instagram.ffjr1-2.fna.fbcdn.net/v/t51.82787-15/663195676_18124901605609064_383854183201678273_n.webp?stp=dst-webp_p480x480&_nc_cat=102&_nc_map=urlgen_bucketless&ig_cache_key=Mjk5ODEzNTUxOTE4MDUxMjQ5OQ%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6IkNBUk9VU0VMX0lURU0ueHBpZHMuMTA4MC5zZHIucmVndWxhcl9waG90by5DMyJ9&_nc_ohc=O1yy56SCKxkQ7kNvwHW_s-O&_nc_oc=AdpOdwc9yohOi5Y29WP9aI8uGGto6SAXNWiQKFQ5uaN6WFwx5psgSB6aACwJsmzSZLU&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=instagram.ffjr1-2.fna&_nc_gid=7OgIwLfIrzrkyULul0nVZg&_nc_ss=7a22e&oh=00_AQEZivxzKNryPKI6G41Zqq7VvjWJaET69a71tVNrhmnsdg&oe=6A72D631',
    postUrl: 'https://www.instagram.com/sahad_____sha/p/CmbhF_WPN0p/?hl=en',
    isCarousel: true,
    likes: '1,560',
    comments: '78',
    caption: 'Late night coding sessions & 3D particle shader experimentation 💻✨',
    location: 'Dubai, UAE 📍',
  },
  {
    id: 'post-9',
    image: 'https://instagram.ffjr1-6.fna.fbcdn.net/v/t51.82787-15/628719359_18438984640114466_6176946705586958827_n.jpg?stp=dst-jpg_e35_p480x480_tt6&_nc_cat=107&_nc_map=urlgen_bucketless&ig_cache_key=MjY4MTc3MTk3OTM1ODI3NTIzMw%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6IkZFRUQueHBpZHMuMTQ0MC5zZHIucmVndWxhcl9waG90by5DMyJ9&_nc_ohc=A_uMQ8h11N4Q7kNvwEs5pkg&_nc_oc=Adrqdn-N-P26O1Qrt7xoHUXFbjm5KBQ7ZS1LdDEFb4zsmu3xVnaN9qFuNR_yWoAS68I&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=instagram.ffjr1-6.fna&_nc_gid=7OgIwLfIrzrkyULul0nVZg&_nc_ss=7a22e&oh=00_AQGfuCZIOEBWB8gidw3I5uJlk98fKuKmdmWoYCqBCbWpXw&oe=6A72D04E',
    postUrl: 'https://www.instagram.com/sahad_____sha/p/CU3kWgWPwah/?hl=en',
    isCarousel: true,
    likes: '3,210',
    comments: '164',
    caption: 'Red & white hoodie combo with shades outdoors 🕶️🔥',
    location: 'Kerala, India 📍',
  },
]

export default function InstagramPostGallery({ initialAccount = null, initialMedia = [] }: InstagramPostGalleryProps) {
  const [activeTab, setActiveTab] = useState<'posts' | 'reels' | 'saved'>('posts')
  const [livePosts, setLivePosts] = useState<GridPost[]>(() => mapLiveMedia(initialMedia))
  const [liveAccount, setLiveAccount] = useState<LiveInstagramAccount | null>(initialAccount)
  const { playClick, playHover } = useAudio()
  const profileUrl = `https://www.instagram.com/${liveAccount?.username || 'sahad_____sha'}/`

  useEffect(() => {
    let active = true
    const loadPermissionedFeed = async () => {
      const [{ data: account }, { data: media }] = await Promise.all([
        supabase.from('instagram_accounts').select('username,name,biography,website,profile_picture_url,followers_count,follows_count,media_count').eq('is_active', true).order('updated_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('instagram_media').select('id,media_type,media_product_type,media_url,thumbnail_url,permalink,caption,like_count,comments_count').eq('is_visible', true).order('posted_at', { ascending: false }),
      ])
      if (!active) return
      if (account) setLiveAccount(account as LiveInstagramAccount)
      if (media) setLivePosts(mapLiveMedia(media as LiveInstagramMedia[]))
    }
    void loadPermissionedFeed()
    return () => { active = false }
  }, [])

  const feed = livePosts
  const visibleFeed = activeTab === 'posts'
    ? feed.filter((post) => !post.isReel)
    : activeTab === 'reels'
      ? feed.filter((post) => post.isReel)
      : []
  const postCount = feed.filter((post) => !post.isReel).length
  const reelCount = feed.filter((post) => post.isReel).length

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
                src={liveAccount?.profile_picture_url || PROFILE_PIC}
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
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">{liveAccount?.username || 'sahad_____sha'}</h2>
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
            <p className="text-sm font-bold text-white mb-1">{liveAccount?.name || 'Sahad Sha'}</p>
            <p className="text-xs text-white/60 font-mono mb-3">Web Designer</p>

            {/* Stats Row */}
            <div className="flex justify-center md:justify-start gap-6 text-sm font-sans mb-4 border-y border-white/10 py-2.5">
              <div><strong className="text-white font-bold">{liveAccount?.media_count ?? feed.length}</strong> <span className="text-white/60">media</span></div>
              <div><strong className="text-white font-bold">{liveAccount?.followers_count ?? '—'}</strong> <span className="text-white/60">followers</span></div>
              <div><strong className="text-white font-bold">{liveAccount?.follows_count ?? '—'}</strong> <span className="text-white/60">following</span></div>
            </div>

            {/* Exact Bio Lines from Crawled JSON */}
            <div className="text-xs sm:text-sm text-white/90 space-y-1.5 leading-relaxed font-mono">
              <p className="text-cyan-300 font-bold">{liveAccount?.biography || <>𝚠𝚑𝚒𝚕𝚎(𝚝𝚛𝚞𝚎)&#123; 𝚋𝚞𝚒𝚕𝚍(); 𝚜𝚌𝚊𝚕𝚎(); &#125;</>}</p>
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

        {/* Tab Switcher (Posts / Reels / Saved) */}
        <div className="flex justify-center gap-8 border-b border-white/10 text-xs font-mono tracking-widest uppercase">
          <button
            type="button"
            onClick={() => { playClick(); setActiveTab('posts'); }}
            className={`py-4 flex items-center gap-2 border-t-2 transition ${activeTab === 'posts' ? 'border-white text-white font-bold' : 'border-transparent text-white/40 hover:text-white'
              }`}
          >
            <Grid size={14} /> POSTS ({postCount})
          </button>
          <button
            type="button"
            onClick={() => { playClick(); setActiveTab('reels'); }}
            className={`py-4 flex items-center gap-2 border-t-2 transition ${activeTab === 'reels' ? 'border-white text-white font-bold' : 'border-transparent text-white/40 hover:text-white'
              }`}
          >
            <Play size={14} /> REELS ({reelCount})
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
          {visibleFeed.map((post) => (
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
          {visibleFeed.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm text-white/50">
              No {activeTab} are available from the connected account yet.
            </div>
          )}
        </div>
      </motion.div>
    </section>
  )
}
