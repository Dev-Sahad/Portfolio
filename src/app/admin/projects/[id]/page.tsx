'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/app/admin/Sidebar';
import { ArrowLeft, ExternalLink, Github, Pencil, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';

export default function ProjectDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', live_url: '', github_url: '', technologies: '', key_features: '',
    problem: '', project_role: '', solution: '', challenges: '', architecture: '', decisions: '', results: '', metrics: '', demo_video_url: '', featured_for: '',
    featured_order: 100, is_featured: false,
  });

  const fetchProject = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/admin/login');
      return;
    }

    if (id) {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        router.push('/admin/projects');
      } else {
        setProject(data);
        setForm({
          title: data.title || '',
          description: data.description || '',
          live_url: data.live_url || '',
          github_url: data.github_url || '',
          technologies: Array.isArray(data.technologies)
            ? data.technologies.join(', ')
            : (data.technologies || ''),
          key_features: Array.isArray(data.key_features)
            ? data.key_features.join(', ')
            : (data.key_features || ''),
          problem: data.problem || '',
          project_role: data.project_role || '',
          solution: data.solution || '',
          challenges: data.challenges || '',
          architecture: data.architecture || '',
          decisions: data.decisions || '',
          results: data.results || '',
          demo_video_url: data.demo_video_url || '',
          featured_for: Array.isArray(data.featured_for) ? data.featured_for.join(', ') : '',
          metrics: Array.isArray(data.metrics)
            ? data.metrics.map((metric: any) => `${metric.label}: ${metric.value}`).join('\n')
            : '',
          featured_order: data.featured_order || 100,
          is_featured: data.is_featured === true,
        });
      }
    }

    setLoading(false);
  }, [id, router]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  // Safely parse technologies — handles both string and array
  const getTechArray = (raw: any): string[] => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'string') {
      return raw.split(',').map((t: string) => t.trim()).filter(Boolean);
    }
    return [];
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);

    const response = await fetch('/api/admin/growth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'save_project',
        id,
        item: {
        title: form.title,
        description: form.description,
        live_url: form.live_url || null,
        github_url: form.github_url || null,
        technologies: form.technologies,
        key_features: form.key_features,
        problem: form.problem || null,
        project_role: form.project_role || null,
        solution: form.solution || null,
        challenges: form.challenges || null,
        architecture: form.architecture || null,
        decisions: form.decisions || null,
        results: form.results || null,
        demo_video_url: form.demo_video_url || null,
        featured_for: form.featured_for.split(',').map((value) => value.trim()).filter(Boolean),
        metrics: form.metrics.split('\n').map((line) => {
          const [label, ...value] = line.split(':')
          return { label: label?.trim(), value: value.join(':').trim() }
        }).filter((metric) => metric.label && metric.value),
        featured_order: Number(form.featured_order) || 100,
        is_featured: form.is_featured,
        },
      }),
    });
    const result = await response.json().catch(() => ({}));

    setSaving(false);

    if (response.ok) {
      setEditing(false);
      fetchProject();
      Swal.fire({ title: 'Saved!', icon: 'success', timer: 1400, showConfirmButton: false, background: '#0f0f0f', color: '#fff' });
    } else {
      Swal.fire({ title: 'Error', text: result.error || 'Failed to save changes.', icon: 'error', background: '#0f0f0f', color: '#fff' });
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'Delete Project?',
      text: 'This cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      background: '#0f0f0f',
      color: '#fff',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#27272a',
    });

    if (!result.isConfirmed) return;

    const response = await fetch('/api/admin/growth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', entity: 'project', id }),
    });
    const responseBody = await response.json().catch(() => ({}));

    if (response.ok) {
      router.push('/admin/projects');
    } else {
      Swal.fire({ title: 'Error', text: responseBody.error || 'Failed to delete.', icon: 'error', background: '#0f0f0f', color: '#fff' });
    }
  };

  return (
    <div className='min-h-screen bg-[#0a0a0a] text-white'>
      <Sidebar />

      <main className='lg:ml-[250px] min-h-screen px-4 sm:px-6 lg:px-8 pt-[90px] lg:pt-6 pb-8'>
        <div className='max-w-[900px] mx-auto py-6 lg:py-8'>
          {/* BACK */}
          <button
            onClick={() => router.push('/admin/projects')}
            className='flex items-center gap-2 text-white/50 hover:text-white transition mb-6 text-sm'
          >
            <ArrowLeft size={16} />
            Back to Projects
          </button>

          {loading ? (
            <div className='text-white/50'>Loading project...</div>
          ) : project ? (
            <div>
              {/* HEADER */}
              <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6'>
                {editing ? (
                  <input
                    value={form.title}
                    onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                    className='text-2xl font-bold bg-transparent border-b border-white/20 outline-none flex-1 pb-1'
                  />
                ) : (
                  <h1 className='text-2xl sm:text-3xl font-bold'>{project.title}</h1>
                )}

                <div className='flex gap-2 shrink-0'>
                  {editing ? (
                    <>
                      <button
                        onClick={() => setEditing(false)}
                        className='px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-sm transition'
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className='px-4 py-2 rounded-xl bg-white text-black font-medium text-sm transition hover:opacity-90'
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setEditing(true)}
                        className='flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-sm transition'
                      >
                        <Pencil size={14} />
                        Edit
                      </button>
                      <button
                        onClick={handleDelete}
                        className='flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 hover:bg-red-500/20 text-sm transition'
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* IMAGE */}
              {project.image_url && (
                <img
                  src={project.image_url}
                  alt={project.title}
                  className='rounded-2xl border border-white/10 w-full max-w-lg object-cover mb-6'
                />
              )}

              {/* EXTRA IMAGES */}
              {project.image_urls && project.image_urls.length > 1 && (
                <div className='grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6'>
                  {project.image_urls.slice(1).map((url: string, i: number) => (
                    <img
                      key={i}
                      src={url}
                      alt={`${project.title} ${i + 2}`}
                      className='rounded-xl border border-white/10 w-full h-32 object-cover'
                    />
                  ))}
                </div>
              )}

              {/* DESCRIPTION */}
              <div className='mb-5'>
                <label className='text-xs text-white/40 mb-1 block'>Description</label>
                {editing ? (
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                    rows={4}
                    className='w-full px-4 py-3 bg-[#111] border border-white/10 rounded-2xl outline-none resize-none text-sm'
                  />
                ) : (
                  <p className='text-white/60 leading-relaxed text-sm'>{project.description}</p>
                )}
              </div>

              {/* CASE STUDY */}
              <div className='mb-6 rounded-3xl border border-white/10 bg-white/[0.025] p-5'>
                <h2 className='mb-4 text-sm font-semibold'>Professional Case Study</h2>
                <div className='grid gap-4'>
                  {[
                    ['problem', 'Problem / user need'],
                    ['project_role', 'Your role and responsibilities'],
                    ['solution', 'Solution and approach'],
                    ['challenges', 'Challenges and decisions'],
                    ['architecture', 'Architecture and system design'],
                    ['decisions', 'Important engineering decisions and trade-offs'],
                    ['results', 'Results and measurable impact'],
                    ['metrics', 'Metrics — one per line as Label: Value'],
                    ['demo_video_url', 'Demo video URL'],
                    ['featured_for', 'Feature for roles — recruiter, frontend, founder'],
                  ].map(([key, label]) => (
                    <label key={key}>
                      <span className='mb-1.5 block text-xs text-white/40'>{label}</span>
                      {editing ? (
                        <textarea
                          value={String(form[key as keyof typeof form])}
                          onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                          rows={key === 'metrics' ? 3 : 4}
                          className='w-full resize-none rounded-2xl border border-white/10 bg-[#111] px-4 py-3 text-sm outline-none'
                        />
                      ) : (
                        <p className='whitespace-pre-wrap text-sm leading-7 text-white/55'>
                          {key === 'metrics'
                            ? (project.metrics || []).map((metric: any) => `${metric.label}: ${metric.value}`).join('\n') || 'Not added yet'
                            : project[key] || 'Not added yet'}
                        </p>
                      )}
                    </label>
                  ))}
                </div>
                <div className='mt-4 grid gap-3 sm:grid-cols-2'>
                  <label className='flex items-center gap-3 rounded-2xl border border-white/10 bg-[#111] px-4 py-3 text-sm'>
                    <input type='checkbox' checked={form.is_featured} disabled={!editing}
                      onChange={(event) => setForm((current) => ({ ...current, is_featured: event.target.checked }))} />
                    Feature this project
                  </label>
                  <label>
                    <span className='mb-1 block text-xs text-white/40'>Display order</span>
                    <input type='number' value={form.featured_order} disabled={!editing}
                      onChange={(event) => setForm((current) => ({ ...current, featured_order: Number(event.target.value) }))}
                      className='w-full rounded-2xl border border-white/10 bg-[#111] px-4 py-3 text-sm outline-none disabled:opacity-60' />
                  </label>
                </div>
              </div>

              {/* TECHNOLOGIES */}
              <div className='mb-5'>
                <label className='text-xs text-white/40 mb-2 block'>Technologies</label>
                {editing ? (
                  <input
                    value={form.technologies}
                    onChange={(e) => setForm(f => ({ ...f, technologies: e.target.value }))}
                    placeholder='React, TypeScript, ...'
                    className='w-full px-4 py-3 bg-[#111] border border-white/10 rounded-2xl outline-none text-sm'
                  />
                ) : (
                  <div className='flex flex-wrap gap-2'>
                    {getTechArray(project.technologies).map((tech: string, index: number) => (
                      <span key={index} className='text-xs px-3 py-1 rounded-full bg-white/10 border border-white/10'>
                        {tech}
                      </span>
                    ))}
                    {getTechArray(project.technologies).length === 0 && (
                      <span className='text-white/30 text-sm'>No technologies listed</span>
                    )}
                  </div>
                )}
              </div>

              {/* KEY FEATURES */}
              {(project.key_features || editing) && (
                <div className='mb-5'>
                  <label className='text-xs text-white/40 mb-2 block'>Key Features</label>
                  {editing ? (
                    <input
                      value={form.key_features}
                      onChange={(e) => setForm(f => ({ ...f, key_features: e.target.value }))}
                      placeholder='Feature 1, Feature 2, ...'
                      className='w-full px-4 py-3 bg-[#111] border border-white/10 rounded-2xl outline-none text-sm'
                    />
                  ) : (
                    <p className='text-white/60 text-sm'>{project.key_features}</p>
                  )}
                </div>
              )}

              {/* URLS */}
              {editing ? (
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6'>
                  <div>
                    <label className='text-xs text-white/40 mb-1 block'>Live URL</label>
                    <input
                      value={form.live_url}
                      onChange={(e) => setForm(f => ({ ...f, live_url: e.target.value }))}
                      className='w-full px-4 py-3 bg-[#111] border border-white/10 rounded-2xl outline-none text-sm'
                    />
                  </div>
                  <div>
                    <label className='text-xs text-white/40 mb-1 block'>GitHub URL</label>
                    <input
                      value={form.github_url}
                      onChange={(e) => setForm(f => ({ ...f, github_url: e.target.value }))}
                      className='w-full px-4 py-3 bg-[#111] border border-white/10 rounded-2xl outline-none text-sm'
                    />
                  </div>
                </div>
              ) : (
                <div className='flex gap-3 mt-6 flex-wrap'>
                  {project.live_url && (
                    <a
                      href={project.live_url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black text-sm font-medium hover:opacity-90 transition'
                    >
                      <ExternalLink size={14} />
                      Live Demo
                    </a>
                  )}
                  {project.github_url && (
                    <a
                      href={project.github_url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-sm transition'
                    >
                      <Github size={14} />
                      GitHub
                    </a>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className='text-white/50'>Project not found</div>
          )}
        </div>
      </main>
    </div>
  );
}
