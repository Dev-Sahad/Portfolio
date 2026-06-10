import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const sampleCertificates = [
  {
    title: 'React.js Fundamentals',
    description: 'Completed comprehensive training in React fundamentals including hooks, state management, and component lifecycle.',
  },
  {
    title: 'Next.js Full Stack Development',
    description: 'Mastered Next.js framework for building full-stack applications with API routes and SSR capabilities.',
  },
  {
    title: 'TypeScript Advanced Patterns',
    description: 'Advanced TypeScript training covering generics, utility types, and type-safe patterns for enterprise development.',
  },
  {
    title: 'Tailwind CSS & UI Design',
    description: 'Developed expertise in modern CSS frameworks and creating responsive, beautiful user interfaces.',
  },
  {
    title: 'Supabase & Database Design',
    description: 'Completed training in PostgreSQL, real-time databases, and building scalable backend solutions.',
  },
  {
    title: 'Web Performance Optimization',
    description: 'Learned techniques for optimizing website performance, reducing load times, and improving SEO scores.',
  },
  {
    title: 'REST APIs & Backend Development',
    description: 'Completed course on building robust REST APIs and implementing proper backend architecture patterns.',
  },
  {
    title: 'Git & Version Control',
    description: 'Mastered Git workflows, branching strategies, and collaborative development practices.',
  },
  {
    title: 'JavaScript ES6+ Mastery',
    description: 'Advanced JavaScript training including async/await, promises, closures, and functional programming.',
  },
  {
    title: 'Responsive Web Design',
    description: 'Expert training in creating mobile-first, responsive designs that work across all devices.',
  },
  {
    title: 'Frontend Testing & Debugging',
    description: 'Completed training in unit testing, integration testing, and advanced debugging techniques.',
  },
  {
    title: 'HTML5 & Semantic Markup',
    description: 'Deep dive into HTML5 semantics, accessibility standards, and best practices for modern web.',
  },
]

export async function POST(request: Request) {
  try {
    // Check if certificates already exist
    const { data: existing } = await supabase
      .from('certificates')
      .select('*')
      .limit(1)

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { message: 'Certificates already exist', count: existing.length },
        { status: 200 }
      )
    }

    // Add sample certificates
    const { data, error } = await supabase
      .from('certificates')
      .insert(sampleCertificates)
      .select()

    if (error) {
      console.error('Error adding certificates:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: `Added ${data.length} sample certificates`,
        data,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  return NextResponse.json(
    { message: 'Use POST to add sample certificates' },
    { status: 405 }
  )
}
