'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus, Trash2, Pencil, X, Upload, Award,
  ExternalLink, Loader2, RefreshCcw, Sparkles,
  CheckCircle, AlertCircle,
} from 'lucide-react';
import Sidebar from '@/app/admin/Sidebar';
import { supabase } from '@/lib/supabase';
import Swal from 'sweetalert2';

interface Certificate {
  id: string;
  title: string;
  issuer?: string;
  date?: string;
  image_url?: string;
  description?: string;
  credential_url?: string;
  created_at?: string;
}

const BLANK = { title: '', issuer: '', date: '', image_url: '', description: '', credential_url: '' };

export default function CertificatesPage() {
  const router = useRouter();
  const [certs, setCerts]       = useState<Certificate[]>([]);
  const [loading, setLoading]   = useState(true);
  const [open, setOpen]         = useState(false);
  const [editId, setEditId]     = useState<string | null>(null);
  const [saving, setSaving]     = useState(false);
  const [seeding, setSeeding]   = useState(false);
  const [seedMsg, setSeedMsg]   = useState<{ type: 'ok'|'err'; text: string } | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [form, setForm]         = useState({ ...BLANK });

  const set = (k: keyof typeof BLANK, v: string) => setForm(f => ({ ...f, [k]: v }));

  // ── Load ──────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push('/admin/login'); return; }
    const { data } = await supabase.from('certificates').select('*').order('created_at', { ascending: true });
    setCerts(data || []);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    load();
    const ch = supabase.channel('certs-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'certificates' }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [load]);

  // ── Seed defaults ─────────────────────────────────────────────────
  const handleSeed = async () => {
    setSeeding(true);
    setSeedMsg(null);
    try {
      const res  = await fetch('/api/seed-certificates', { method: 'POST' });
      const data = await res.json();

      if (data.needsSetup) {
        setSeedMsg({ type: 'err', text: '⚠️ Table missing — run the SQL in Supabase first.' });
        Swal.fire({
          title: 'Table missing',
          html: `<p style="color:#aaa;font-size:12px;text-align:left">Run this in Supabase → SQL Editor → Run:</p><pre style="background:#111;padding:12px;border-radius:8px;font-size:10px;color:#88ff88;text-align:left;overflow:auto;white-space:pre">${data.setup_sql}</pre>`,
          icon: 'warning', background: '#0f0f0f', color: '#fff', confirmButtonColor: '#333',
        });
      } else if (!data.success) {
        setSeedMsg({ type: 'err', text: `Error: ${data.error}` });
      } else if (data.count === 0) {
        setSeedMsg({ type: 'ok', text: 'All certificates already added!' });
      } else {
        setSeedMsg({ type: 'ok', text: `✅ Added ${data.count} certificates!` });
        await load();
      }
    } catch (err: any) {
      setSeedMsg({ type: 'err', text: `Network error: ${err.message}` });
    }
    setSeeding(false);
    setTimeout(() => setSeedMsg(null), 5000);
  };

  // ── Save ──────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);

    let imageUrl = form.image_url;

    // Upload image file if selected
    if (imageFile) {
      const fileName = `cert-${Date.now()}-${imageFile.name}`;
      const { error: upErr } = await supabase.storage.from('certificates').upload(fileName, imageFile);
      if (!upErr) {
        const { data: pub } = supabase.storage.from('certificates').getPublicUrl(fileName);
        imageUrl = pub.publicUrl;
      }
    }

    const payload = {
      title:          form.title,
      issuer:         form.issuer || null,
      date:           form.date || null,
      image_url:      imageUrl || null,
      description:    form.description || null,
      credential_url: form.credential_url || null,
    };

    let error: any;
    if (editId) {
      const res = await supabase.from('certificates').update(payload).eq('id', editId);
      error = res.error;
    } else {
      const res = await supabase.from('certificates').insert([payload]);
      error = res.error;
    }

    setSaving(false);

    if (!error) {
      setOpen(false);
      setEditId(null);
      setForm({ ...BLANK });
      setImageFile(null);
      await load();
      Swal.fire({ title: 'Saved!', icon: 'success', timer: 1200, showConfirmButton: false, background: '#0f0f0f', color: '#fff' });
    } else {
      Swal.fire({ title: 'Error', text: error.message, icon: 'error', background: '#0f0f0f', color: '#fff' });
    }
  };

  // ── Delete ────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    const r = await Swal.fire({
      title: 'Delete?', text: 'Cannot be undone.', icon: 'warning',
      showCancelButton: true, confirmButtonText: 'Delete',
      background: '#0f0f0f', color: '#fff', confirmButtonColor: '#ef4444', cancelButtonColor: '#27272a',
    });
    if (!r.isConfirmed) return;
    const { error } = await supabase.from('certificates').delete().eq('id', id);
    if (!error) { setCerts(p => p.filter(c => c.id !== id)); }
    else Swal.fire({ title: 'Error', text: error.message, icon: 'error', background: '#0f0f0f', color: '#fff' });
  };

  // ── Edit ──────────────────────────────────────────────────────────
  const openEdit = (c: Certificate) => {
    setForm({
      title:          c.title || '',
      issuer:         c.issuer || '',
      date:           c.date || '',
      image_url:      c.image_url || '',
      description:    c.description || '',
      credential_url: c.credential_url || '',
    });
    setEditId(c.id);
    setImageFile(null);
    setOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Sidebar />

      <main className="lg:ml-[250px] pt-[95px] lg:pt-6 min-h-screen px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-[1400px] mx-auto">

          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-7">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Award size={16} className="text-white/40" />
                <span className="text-xs text-white/40 uppercase tracking-widest">Admin</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold">Certificates</h1>
              <p className="text-sm text-white/40 mt-1">
                {loading ? 'Loading…' : `${certs.length} certificate${certs.length !== 1 ? 's' : ''}`}
              </p>
            </div>

            <div className="flex gap-2 flex-wrap">
              <button onClick={load}
                className="h-11 px-4 rounded-2xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] transition text-sm flex items-center gap-2 group">
                <RefreshCcw size={14} className="group-hover:rotate-180 transition duration-500" />
                Refresh
              </button>

              <button onClick={handleSeed} disabled={seeding}
                className="h-11 px-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 transition text-sm flex items-center gap-2 disabled:opacity-50">
                {seeding ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                {seeding ? 'Seeding…' : 'Seed Defaults'}
              </button>

              <button onClick={() => { setForm({ ...BLANK }); setEditId(null); setImageFile(null); setOpen(true); }}
                className="h-11 px-4 rounded-2xl bg-white text-black font-medium text-sm hover:opacity-90 transition flex items-center gap-2">
                <Plus size={15} /> Add Certificate
              </button>
            </div>
          </div>

          {/* SEED MESSAGE */}
          {seedMsg && (
            <div className={`mb-5 flex items-center gap-2.5 px-4 py-3 rounded-2xl border text-sm ${
              seedMsg.type === 'ok'
                ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
                : 'border-red-500/20 bg-red-500/10 text-red-300'
            }`}>
              {seedMsg.type === 'ok' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
              {seedMsg.text}
            </div>
          )}

          {/* GRID */}
          {loading ? (
            <div className="flex items-center gap-3 text-white/30 text-sm py-20 justify-center">
              <Loader2 size={16} className="animate-spin" /> Loading…
            </div>
          ) : certs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 h-64 flex flex-col items-center justify-center gap-4 text-white/25">
              <Award size={36} />
              <div className="text-center">
                <p className="text-sm mb-1">No certificates yet</p>
                <p className="text-xs">Click &quot;Seed Defaults&quot; to add 8 web design &amp; dev certificates</p>
              </div>
              <button onClick={handleSeed}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-amber-500/30 text-amber-300 text-sm hover:bg-amber-500/10 transition">
                <Sparkles size={14} /> Seed Defaults
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {certs.map(c => (
                <div key={c.id}
                  className="group border border-white/10 bg-white/[0.02] rounded-2xl overflow-hidden hover:border-white/20 hover:-translate-y-1 transition-all duration-300 flex flex-col">

                  {/* IMAGE */}
                  <div className="h-[140px] bg-[#111] flex items-center justify-center overflow-hidden relative">
                    {c.image_url ? (
                      <img src={c.image_url} alt={c.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                    ) : (
                      <Award size={32} className="text-white/10" />
                    )}
                  </div>

                  {/* BODY */}
                  <div className="p-4 flex flex-col flex-1 gap-2">
                    <h2 className="font-semibold text-[13px] line-clamp-2 leading-snug">{c.title}</h2>

                    {c.issuer && (
                      <p className="text-[11px] text-white/40">{c.issuer}{c.date ? ` · ${c.date}` : ''}</p>
                    )}

                    {c.description && (
                      <p className="text-[11px] text-white/30 line-clamp-2 leading-relaxed flex-1">{c.description}</p>
                    )}

                    {/* FOOTER */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/5 gap-2 mt-auto">
                      {c.credential_url ? (
                        <a href={c.credential_url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[10px] text-white/25 hover:text-white/60 transition">
                          <ExternalLink size={10} /> View
                        </a>
                      ) : <span />}

                      <div className="flex gap-1">
                        <button onClick={() => openEdit(c)}
                          className="flex items-center gap-1.5 h-7 px-3 rounded-lg border border-white/10 hover:bg-white/10 transition text-[11px]">
                          <Pencil size={11} /> Edit
                        </button>
                        <button onClick={() => handleDelete(c.id)}
                          className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition flex items-center justify-center text-red-300">
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center px-3 py-4">
          <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-[#111] border border-white/10 p-6 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">{editId ? 'Edit Certificate' : 'Add Certificate'}</h2>
              <button onClick={() => { setOpen(false); setEditId(null); setForm({ ...BLANK }); }}
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center">
                <X size={16} />
              </button>
            </div>

            {/* IMAGE UPLOAD */}
            <label className="block mb-4 border border-dashed border-white/10 rounded-2xl bg-[#0f0f0f] h-40 flex items-center justify-center cursor-pointer overflow-hidden hover:border-white/25 transition">
              {form.image_url || imageFile ? (
                <img
                  src={imageFile ? URL.createObjectURL(imageFile) : form.image_url}
                  alt="preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-white/30">
                  <Upload size={22} /><p className="text-xs">Upload image</p>
                </div>
              )}
              <input type="file" hidden accept="image/*"
                onChange={e => { const f = e.target.files?.[0]; if (f) setImageFile(f); }} />
            </label>

            {/* IMAGE URL fallback */}
            <input value={form.image_url} onChange={e => set('image_url', e.target.value)}
              placeholder="Or paste image URL"
              className="w-full px-4 py-3 bg-[#0f0f0f] border border-white/10 rounded-2xl outline-none text-sm mb-4 focus:border-white/25 transition placeholder:text-white/20" />

            {/* FIELDS */}
            {[
              { key: 'title',          label: 'Certificate Title *', placeholder: 'Responsive Web Design' },
              { key: 'issuer',         label: 'Issued By',           placeholder: 'freeCodeCamp, Udemy, Google…' },
              { key: 'date',           label: 'Year',                placeholder: '2024' },
              { key: 'credential_url', label: 'Credential URL',      placeholder: 'https://…' },
            ].map(({ key, label, placeholder }) => (
              <div key={key} className="mb-4">
                <label className="text-xs text-white/40 mb-1.5 block">{label}</label>
                <input
                  value={(form as any)[key]}
                  onChange={e => set(key as keyof typeof BLANK, e.target.value)}
                  placeholder={placeholder}
                  className="w-full px-4 py-3 bg-[#0f0f0f] border border-white/10 rounded-2xl outline-none text-sm focus:border-white/25 transition placeholder:text-white/20"
                />
              </div>
            ))}

            <div className="mb-5">
              <label className="text-xs text-white/40 mb-1.5 block">Description</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)}
                placeholder="Short description of what this covers…" rows={3}
                className="w-full px-4 py-3 bg-[#0f0f0f] border border-white/10 rounded-2xl outline-none text-sm resize-none focus:border-white/25 transition placeholder:text-white/20" />
            </div>

            <div className="flex gap-3">
              <button onClick={() => { setOpen(false); setEditId(null); setForm({ ...BLANK }); }}
                className="flex-1 py-3 rounded-2xl border border-white/10 hover:bg-white/5 text-sm transition">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-3 rounded-2xl bg-white text-black font-medium text-sm hover:opacity-90 transition disabled:opacity-60 flex items-center justify-center gap-2">
                {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
