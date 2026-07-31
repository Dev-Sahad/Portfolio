'use client'

import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, Layers, Search, Star, X } from 'lucide-react'
import usePortfolio from '@/hooks/usePortfolio'
import { getCertificateThumbnail } from '@/lib/portfolioMedia'
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
  const [activeTab, setActiveTab] = useState<'projects' | 'certificates' | 'techstack' | 'starred'>('projects')
  const [previewImage, setPreviewImage] = useState('')
  const [selectedTech, setSelectedTech] = useState<any | null>(null)
  const [showAllProjects, setShowAllProjects] = useState(false)
  const [query, setQuery] = useState('')
  const [technology, setTechnology] = useState('all')
  const [starredIds, setStarredIds] = useState<string[]>([])
  const deferredQuery = useDeferredValue(query)

  // Load starred project IDs from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('starredProjects')
      if (saved) {
        setStarredIds(JSON.parse(saved))
      }
    } catch {}
  }, [])

  const toggleStar = (id: string) => {
    setStarredIds((prev) => {
      const next = prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
      try {
        localStorage.setItem('starredProjects', JSON.stringify(next))
      } catch {}
      return next
    })
  }

  const resolvedProjects = projects.length ? projects : initialProjects
  const resolvedTech = techStacks.length ? techStacks : initialTech

  const projectTechnologies = useMemo(() => {
    const values = new Set<string>()
    for (const project of resolvedProjects) {
      String(project.technologies || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
        .forEach((item) => values.add(item))
    }
    return [...values].sort((a, b) => a.localeCompare(b))
  }, [resolvedProjects])

  const filteredProjects = useMemo(() => {
    const needle = deferredQuery.trim().toLowerCase()
    return resolvedProjects.filter((project) => {
      const matchesQuery = !needle || `${project.title} ${project.description} ${project.technologies}`.toLowerCase().includes(needle)
      const matchesTechnology = technology === 'all' || String(project.technologies || '').split(',').some((item) => item.trim() === technology)
      return matchesQuery && matchesTechnology
    })
  }, [deferredQuery, resolvedProjects, technology])

  const starredProjectsList = useMemo(() => {
    return resolvedProjects.filter((p) => starredIds.includes(String(p.id)))
  }, [resolvedProjects, starredIds])

  const displayedProjects = showAllProjects ? filteredProjects : filteredProjects.slice(0, 3)

  const tabs = [
    { id: 'projects', label: 'Projects' },
    { id: 'certificates', label: 'Certificates' },
    { id: 'techstack', label: 'Tech Stack' },
    { id: 'starred', label: `Starred ★ (${starredIds.length})` },
  ] as const

  // Filter projects for selected tech modal
  const techModalProjects = useMemo(() => {
    if (!selectedTech) return []
    const techName = selectedTech.name.toLowerCase()
    return resolvedProjects.filter((project) =>
      String(project.technologies || '').toLowerCase().includes(techName)
    )
  }, [resolvedProjects, selectedTech])

  return (
    <>
      {/* CERTIFICATE PREVIEW MODAL */}
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

      {/* TECH STACK DETAIL MODAL */}
      <AnimatePresence>
        {selectedTech && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center px-4 bg-black/80 backdrop-blur-md" onClick={() => setSelectedTech(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.35, ease: smoothEase }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl rounded-3xl border border-white/15 bg-[#0e0e12] p-6 sm:p-8 text-white max-h-[85vh] overflow-y-auto shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setSelectedTech(null)}
                className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 hover:bg-white/15 hover:text-white transition"
              >
                <X size={16} />
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-white/10 p-3">
                  {selectedTech.logo_url || selectedTech.image_url ? (
                    <img src={selectedTech.logo_url || selectedTech.image_url} alt={selectedTech.name} className="h-full w-full object-contain" />
                  ) : (
                    <Layers size={28} className="text-white/40" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedTech.name}</h3>
                  <p className="text-xs text-white/40 mt-1">
                    {techModalProjects.length} project{techModalProjects.length !== 1 ? 's' : ''} built with this technology
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-mono uppercase tracking-wider text-white/40">Projects Using {selectedTech.name}</h4>
                {techModalProjects.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-white/35">
                    No linked projects found for this technology.
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {techModalProjects.map((p, i) => (
                      <PortfolioCard
                        key={p.id}
                        index={i}
                        title={p.title}
                        description={p.description}
                        image={p.image_url}
                        live_url={p.live_url}
                        github_url={p.github_url}
                        id={p.id}
                        isStarred={starredIds.includes(String(p.id))}
                        onToggleStar={toggleStar}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
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

          <div className="glass-tab-container relative flex flex-wrap gap-1.5 rounded-2xl p-1.5 self-start md:self-auto">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`relative rounded-xl px-5 py-2.5 text-xs sm:text-sm font-medium transition-colors duration-300 ${
                    isActive ? 'text-white font-semibold' : 'text-white/60 hover:text-white'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="portfolioShowcaseActiveTab"
                      className="absolute inset-0 rounded-xl bg-white/20 border border-white/35 backdrop-blur-2xl shadow-[0_4px_24px_rgba(255,255,255,0.2),inset_0_1px_1px_rgba(255,255,255,0.4)]"
                      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              )
            })}
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
                <div className="grid gap-3 rounded-2xl border border-white/15 bg-white/[0.04] p-3 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.25)] sm:grid-cols-[1fr_220px]">
                  <label className="relative">
                    <span className="sr-only">Search projects</span>
                    <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search projects, skills, or technologies"
                      className="h-11 w-full rounded-xl border border-white/10 bg-black/40 pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-white/30 backdrop-blur-md transition"
                    />
                  </label>
                  <label>
                    <span className="sr-only">Filter by technology</span>
                    <select value={technology} onChange={(event) => setTechnology(event.target.value)}
                      className="h-11 w-full rounded-xl border border-white/10 bg-black/50 px-4 text-sm text-white/80 outline-none focus:border-white/30 backdrop-blur-md transition">
                      <option value="all" className="bg-[#111] text-white">All technologies</option>
                      {projectTechnologies.map((item) => <option key={item} value={item} className="bg-[#111] text-white">{item}</option>)}
                    </select>
                  </label>
                </div>
                {loading && !resolvedProjects.length ? (
                  <EmptyState title="Loading projects..." />
                ) : filteredProjects.length === 0 ? (
                  <EmptyState title={resolvedProjects.length ? 'No projects match this search' : 'Projects are coming soon'} />
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
                        github_url={item.github_url}
                        id={item.id}
                        isStarred={starredIds.includes(String(item.id))}
                        onToggleStar={toggleStar}
                      />
                    ))}
                  </div>
                )}

                {filteredProjects.length > 3 && (
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

            {activeTab === 'starred' && (
              <div className="space-y-6">
                {starredProjectsList.length === 0 ? (
                  <EmptyState title="No starred projects yet. Click the star ★ icon on any project to bookmark it!" />
                ) : (
                  <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {starredProjectsList.map((item, i) => (
                      <PortfolioCard
                        key={item.id}
                        index={i}
                        title={item.title}
                        description={item.description}
                        image={item.image_url}
                        live_url={item.live_url}
                        github_url={item.github_url}
                        id={item.id}
                        isStarred={true}
                        onToggleStar={toggleStar}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'certificates' && (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {certificates.length === 0 ? (
                  <EmptyState title={loading ? 'Loading certificates...' : 'Certificates are coming soon'} />
                ) : (
                  certificates.map((item) => {
                    const thumbnail = getCertificateThumbnail(item)
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setPreviewImage(thumbnail)}
                        className="group flex flex-col h-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left transition duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.07]"
                      >
                        <div className="mb-4 flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl bg-black/30 border border-white/5">
                          <img
                            src={thumbnail}
                            alt={`${item.title}${item.issuer ? ` — ${item.issuer}` : ''}`}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                            loading="lazy"
                          />
                        </div>
                        <h3 className="line-clamp-2 text-sm font-semibold text-white/90 group-hover:text-white mt-auto">{item.title}</h3>
                        {item.issuer ? (
                          <p className="mt-2 text-xs text-white/40">
                            {item.issuer}{item.date ? ` · ${item.date}` : ''}
                          </p>
                        ) : null}
                      </button>
                    )
                  })
                )}
              </div>
            )}

            {activeTab === 'techstack' && (
              <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {resolvedTech.length === 0 ? (
                  <EmptyState title={loading ? 'Loading tech stack...' : 'Tech stack is coming soon'} />
                ) : (
                  resolvedTech.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedTech(item)}
                      className="group flex min-h-[120px] sm:min-h-[130px] flex-col items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.08] text-left cursor-pointer"
                    >
                      {item.logo_url || item.image_url ? (
                        <img 
                          src={item.logo_url || item.image_url} 
                          alt={item.name} 
                          className="h-10 w-10 object-contain transition-transform duration-300 group-hover:scale-110" 
                          loading="lazy"
                        />
                      ) : (
                        <Layers size={28} className="text-white/35 group-hover:text-white/60 transition" />
                      )}
                      <p className="text-center text-xs text-white/75 font-medium group-hover:text-white">{item.name}</p>
                    </button>
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
