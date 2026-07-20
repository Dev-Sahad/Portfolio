'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Award, ChevronDown, ChevronUp, Layers, X } from 'lucide-react'
import usePortfolio from '@/hooks/usePortfolio'
import PortfolioCard from './PortfolioCard'

const smoothEase: [number, number, number, number] = [0.22, 1, 0.36, 1]

interface PortfolioShowcaseProps {
  projects: any[]
  technologies: any[]
}

export default function PortfolioShowcase({
  projects: initialProjects,
  technologies: initialTech,
}: PortfolioShowcaseProps) {
  const { projects, certificates, techStacks, loading } = usePortfolio()
  const [activeTab, setActiveTab] = useState<'projects' | 'certificates' | 'techstack'>('projects')
  const [previewImage, setPreviewImage] = useState('')
  const [showAllProjects, setShowAllProjects] = useState(false)

  const resolvedProjects = projects.length ? projects : initialProjects
  const resolvedTech = techStacks.length ? techStacks : initialTech
  const displayedProjects = showAllProjects ? resolvedProjects : resolvedProjects.slice(0, 3)

  const tabs = [
    { id: 'projects', label: 'Projects' },
    { id: 'certificates', label: 'Certificates' },
    { id: 'techstack', label: 'Tech Stack' },
  ] as const

  return (
    <>
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 px-4 backdrop-blur-md"
            onClick={() => setPreviewImage('')}
          >
            <button
              type="button"
              aria-label="Close preview"
              className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/20"
            >
              <X size={18} />
            </button>
            <motion.img
              src={previewImage}
              alt="Certificate preview"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="max-h-[82vh] max-w-[90vw] md:max-h-[86vh] md:max-w-[80vw] rounded-xl object-contain shadow-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <section id="portfolio" className="w-full max-w-[1450px] mx-auto px-4 sm:px-6 md:px-12 lg:px-20 pt-24 pb-24 text-white">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.8, ease: smoothEase }}
          className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-white/35">Selected Work</p>
            <h2 className="mt-3 text-3xl font-bold md:text-5xl tracking-tight">Portfolio</h2>
          </div>

          <div className="flex flex-wrap gap-1 rounded-2xl border border-white/10 bg-white/[0.04] p-1 self-start md:self-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-medium transition duration-200 ${
                  activeTab === tab.id ? 'bg-white text-black shadow-lg' : 'text-white/55 hover:bg-white/10 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.45, ease: smoothEase }}
          >
            {activeTab === 'projects' && (
              <div className="space-y-8">
                {loading && !resolvedProjects.length ? (
                  <EmptyState title="Loading projects..." />
                ) : resolvedProjects.length === 0 ? (
                  <EmptyState title="Projects are coming soon" />
                ) : (
                  <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {displayedProjects.map((item, i) => (
                      <PortfolioCard
                        key={item.id}
                        index={i}
                        title={item.title}
                        description={item.description}
                        image={item.image_url}
                        live_url={item.live_url}
                        id={item.id}
                      />
                    ))}
                  </div>
                )}

                {resolvedProjects.length > 3 && (
                  <div className="flex justify-center pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAllProjects((value) => !value)}
                      className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm text-white/70 transition duration-200 hover:bg-white hover:text-black hover:scale-[1.02]"
                    >
                      {showAllProjects ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      {showAllProjects ? 'Show Less' : 'See More'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'certificates' && (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {certificates.length === 0 ? (
                  <EmptyState title={loading ? 'Loading certificates...' : 'Certificates are coming soon'} />
                ) : (
                  certificates.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => item.image_url && setPreviewImage(item.image_url)}
                      className="group flex flex-col h-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left transition duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.07]"
                    >
                      {/* aspect-video locks thumbnail dimension symmetry cross-platform */}
                      <div className="mb-4 flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl bg-black/30 border border-white/5">
                        {item.image_url ? (
                          <img 
                            src={item.image_url} 
                            alt={item.title} 
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105" 
                            loading="lazy"
                          />
                        ) : (
                          <Award className="text-white/25" size={32} />
                        )}
                      </div>
                      <h3 className="line-clamp-2 text-sm font-semibold text-white/90 group-hover:text-white mt-auto">{item.title}</h3>
                    </button>
                  ))
                )}
              </div>
            )}

            {activeTab === 'techstack' && (
              <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {resolvedTech.length === 0 ? (
                  <EmptyState title={loading ? 'Loading tech stack...' : 'Tech stack is coming soon'} />
                ) : (
                  resolvedTech.map((item) => (
                    <div
                      key={item.id}
                      className="flex min-h-[120px] sm:min-h-[130px] flex-col items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.06]"
                    >
                      {item.logo_url || item.image_url ? (
                        <img 
                          src={item.logo_url || item.image_url} 
                          alt={item.name} 
                          className="h-10 w-10 object-contain transition-transform duration-300 group-hover:scale-110" 
                          loading="lazy"
                        />
                      ) : (
                        <Layers size={28} className="text-white/35" />
                      )}
                      <p className="text-center text-xs text-white/75 font-medium">{item.name}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </section>
    </>
  )
}

function EmptyState({ title }: { title: string }) {
  return (
    <div className="col-span-full flex min-h-[240px] items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.03] text-sm text-white/35 tracking-wide">
      {title}
    </div>
  )
}
