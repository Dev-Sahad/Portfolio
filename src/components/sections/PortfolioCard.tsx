'use client'

import { motion } from 'framer-motion'
import {
  ArrowRight,
  ArrowUpRight,
  Star,
  ArrowRightLeft,
  Maximize2,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { trackEvent } from '@/lib/analytics'
import { getProjectThumbnail } from '@/lib/portfolioMedia'

type Props = {
  title: string
  description: string
  index: number
  id?: string
  image?: string
  live_url?: string
  github_url?: string
  isStarred?: boolean
  onToggleStar?: (id: string) => void
  isCompared?: boolean
  onToggleCompare?: (id: string) => void
  onInspectDevice?: (title: string, url?: string, image?: string) => void
}

export default function PortfolioCard({
  title,
  description,
  index,
  id,
  image,
  live_url,
  github_url,
  isStarred = false,
  onToggleStar,
  isCompared = false,
  onToggleCompare,
  onInspectDevice,
}: Props) {

  const router = useRouter()
  const thumbnail = getProjectThumbnail({ github_url, image_url: image })

  return (
    <motion.div
      initial={{
        opacity: 0,
        x: index % 2 === 0 ? -50 : 50,
        y: 20,
      }}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
      }}
      transition={{
        duration: 0.75,
        delay: index * 0.06,
      }}
      whileHover={{ y: -4 }}
      className="group relative rounded-[26px] border border-white/10 bg-white/5 p-4 backdrop-blur-xl flex flex-col min-h-[270px]"
    >
      <div className="relative w-full h-36 rounded-2xl overflow-hidden border border-white/10 bg-white/[0.03] mb-3">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
        ) : (
          <div className="w-full h-full bg-white/[0.03]" />
        )}
        {id && (
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
            {onToggleCompare && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleCompare(id)
                }}
                className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-300 ${
                  isCompared
                    ? 'border-cyan-400/50 bg-cyan-400/20 text-cyan-300 backdrop-blur-md shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                    : 'border-white/15 bg-black/50 text-white/50 hover:bg-black/70 hover:text-white backdrop-blur-md'
                }`}
                title={isCompared ? 'Remove from comparison' : 'Compare project'}
                aria-label="Compare project"
              >
                <ArrowRightLeft size={13} />
              </button>
            )}

            {onInspectDevice && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onInspectDevice(title, live_url, thumbnail)
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-purple-400/40 bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition backdrop-blur-md"
                title="Inspect in 3D Device Theater"
                aria-label="Inspect project in 3D Device Viewport"
              >
                <Maximize2 size={13} />
              </button>
            )}

            {onToggleStar && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleStar(id)
                }}
                className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-300 ${
                  isStarred
                    ? 'border-amber-400/50 bg-amber-400/20 text-amber-300 backdrop-blur-md shadow-[0_0_12px_rgba(251,191,36,0.3)]'
                    : 'border-white/15 bg-black/50 text-white/50 hover:bg-black/70 hover:text-white backdrop-blur-md'
                }`}
                title={isStarred ? 'Unstar project' : 'Star project'}
                aria-label={isStarred ? 'Unstar project' : 'Star project'}
              >
                <Star size={14} className={isStarred ? 'fill-amber-300' : ''} />
              </button>
            )}
          </div>
        )}

      </div>

      <h3 className="text-[17px] font-semibold mb-2 leading-tight">
        {title}
      </h3>

      <p className="text-[13px] text-white/60 leading-relaxed line-clamp-2 min-h-[38px]">
        {description}
      </p>

      <div className="mt-auto pt-4 flex items-center justify-between">
        {live_url ? (
          <a
            href={live_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent('project_live_click', { entityId: id })}
            className="flex items-center gap-2 text-[13px] text-white/70 hover:text-white transition-all"
          >
            Live Demo
            <ArrowUpRight size={14} />
          </a>
        ) : (
          <div className="text-[13px] text-white/35">
            No Link
          </div>
        )}

        <div className="flex items-center gap-2">
        {github_url ? (
          <a
            href={github_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent('project_github_click', { entityId: id })}
            className="text-[12px] text-white/45 hover:text-white"
          >
            Code
          </a>
        ) : null}
        {id && (
          <button
            onClick={() => {
              trackEvent('project_view', { entityId: id })
              router.push(`/portfolio/${id}`)
            }}
            className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-all flex items-center gap-2 text-[13px]"
          >
            Details
            <ArrowRight size={13} />
          </button>
        )}
        </div>
      </div>
    </motion.div>
  )
}
