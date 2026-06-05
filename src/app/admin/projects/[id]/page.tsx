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
  const [form, setForm] = useState({ title: '', description: '', live_url: '', github_url: '', technologies: '', key_features: '' });

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

    const { error } = await supabase
      .from('projects')
      .update({
        title: form.title,
        description: form.description,
        live_url: form.live_url || null,
        github_url: form.github_url || null,
        technologies: form.technologies,
        key_features: form.key_features,
      })
      .eq('id', id);

    setSaving(false);

    if (!error) {
      setEditing(false);
      fetchProject();
      Swal.fire({ title: 'Saved!', icon: 'success', timer: 1400, showConfirmButton: false, background: '#0f0f0f', color: '#fff' });
    } else {
      Swal.fire({ title: 'Error', text: 'Failed to save changes.', icon: 'error', background: '#0f0f0f', color: '#fff' });
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

    const { error } = await supabase.from('projects').delete().eq('id', id);

    if (!error) {
      router.push('/admin/projects');
    } else {
      Swal.fire({ title: 'Error', text: 'Failed to delete.', icon: 'error', background: '#0f0f0f', color: '#fff' });
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
