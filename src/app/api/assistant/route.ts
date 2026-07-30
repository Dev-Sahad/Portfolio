import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

const clean = (value: unknown, limit = 300) =>
  typeof value === 'string' ? value.trim().slice(0, limit) : ''

function scoreText(text: string, terms: string[]) {
  const normalized = text.toLowerCase()
  return terms.reduce((score, term) => score + (normalized.includes(term) ? 1 : 0), 0)
}

export async function POST(request: NextRequest) {
  const { question: rawQuestion } = await request.json().catch(() => ({ question: '' }))
  const question = clean(rawQuestion)
  if (!question) return NextResponse.json({ error: 'Ask a question first.' }, { status: 400 })

  const database = await createClient()
  const [projectsResult, postsResult, settingsResult] = await Promise.all([
    database.from('projects').select('id,title,description,technologies,key_features,results,live_url,github_url'),
    database.from('posts').select('slug,title,excerpt,tags').eq('published', true).limit(12),
    database.from('site_settings').select('owner_name,hero_role,hero_description,availability_text,cv_url,github_url,linkedin_url').eq('id', 1).maybeSingle(),
  ])

  const terms = question.toLowerCase().split(/\W+/).filter((term: string) => term.length > 2)
  const projects = (projectsResult.data || [])
    .map((project: any) => ({
      ...project,
      score: scoreText(`${project.title} ${project.description} ${project.technologies} ${project.key_features}`, terms),
    }))
    .sort((a: any, b: any) => b.score - a.score)
  const posts = (postsResult.data || [])
    .map((post: any) => ({ ...post, score: scoreText(`${post.title} ${post.excerpt} ${(post.tags || []).join(' ')}`, terms) }))
    .sort((a: any, b: any) => b.score - a.score)
  const settings = settingsResult.data as any

  let answer = `${settings?.owner_name || 'Muhammad Sahad'} is a ${settings?.hero_role || 'frontend developer'}. ${settings?.hero_description || ''}`
  const links: Array<{ label: string; href: string }> = []

  if (/available|hire|work|contact|book/.test(question.toLowerCase())) {
    answer = settings?.availability_text || 'Available for selected frontend and web-development work.'
    links.push({ label: 'Contact Sahad', href: '/#contact' })
  } else if (/resume|cv/.test(question.toLowerCase()) && settings?.cv_url) {
    answer = 'You can open Sahad’s latest CV using the link below.'
    links.push({ label: 'View CV', href: settings.cv_url })
  } else if (projects[0]?.score > 0) {
    const project = projects[0]
    answer = `${project.title}: ${project.description || 'A featured portfolio project.'}${project.results ? ` Result: ${project.results}` : ''}`
    links.push({ label: 'View case study', href: `/portfolio/${project.id}` })
    if (project.live_url) links.push({ label: 'Live demo', href: project.live_url })
  } else if (posts[0]?.score > 0) {
    answer = `${posts[0].title}: ${posts[0].excerpt || 'Read the full developer note for details.'}`
    links.push({ label: 'Read article', href: `/blog/${posts[0].slug}` })
  } else {
    answer += ' Ask about projects, technologies, availability, the CV, or recent developer notes.'
    links.push({ label: 'Explore projects', href: '/#portfolio' })
  }

  return NextResponse.json({ answer: answer.trim(), links })
}
