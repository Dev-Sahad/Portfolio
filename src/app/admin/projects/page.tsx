"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/admin/Sidebar";
import {
  Plus, Github, RefreshCcw, ExternalLink, Folder,
  X, CheckCircle, AlertCircle, Loader2, Copy, Check,
  Terminal, ArrowRight
} from "lucide-react";
import AddProjectModal from "./AddProjectModal";
import { supabase } from "@/lib/supabase";

const GITHUB_USER = "Dev-Sahad";

type LogLine = { text: string; type: "info" | "ok" | "err" | "warn" };
type ImportStatus = "idle" | "running" | "done" | "error" | "needs_setup";

export default function ProjectsPage() {
  const router = useRouter();
  const [addOpen, setAddOpen]       = useState(false);
  const [projects, setProjects]     = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [status, setStatus]         = useState<ImportStatus>("idle");
  const [logs, setLogs]             = useState<LogLine[]>([]);
  const [setupSQL, setSetupSQL]     = useState<string | null>(null);
  const [showPanel, setShowPanel]   = useState(false);
  const [copied, setCopied]         = useState(false);

  // ── load projects ─────────────────────────────────────────────────
  const loadProjects = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push("/admin/login"); return; }
    const { data, error } = await supabase
      .from("projects").select("*").order("created_at", { ascending: false });
    if (!error && data) setProjects(data);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    loadProjects();
    const ch = supabase
      .channel("projects-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "projects" }, loadProjects)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [loadProjects]);

  const addLog = (text: string, type: LogLine["type"] = "info") =>
    setLogs(p => [...p, { text, type }]);

  // ── import ────────────────────────────────────────────────────────
  const runImport = async () => {
    setShowPanel(true);
    setLogs([]);
    setSetupSQL(null);
    setStatus("running");

    addLog(`Fetching repos for @${GITHUB_USER}…`);

    try {
      const res  = await fetch(`/api/import-github-projects?username=${GITHUB_USER}`, { method: 'POST' });
      const data = await res.json();

      // ── Table missing ──────────────────────────────────────────────
      if (data.needsSetup) {
        setStatus("needs_setup");
        addLog("Table 'projects' does not exist in Supabase yet.", "err");
        addLog(`GitHub found ${data.repos_found} repos ready to import.`, "info");
        addLog("Run the SQL below in Supabase, then click Import again.", "warn");
        setSetupSQL(data.setup_sql);
        return;
      }

      // ── Error ──────────────────────────────────────────────────────
      if (!data.success) {
        setStatus("error");
        addLog(data.error || "Unknown error", "err");
        if (data.errors) data.errors.forEach((e: string) => addLog(e, "err"));
        return;
      }

      // ── Success ────────────────────────────────────────────────────
      const { stats } = data;
      addLog(`GitHub: ${stats.total} public repos found`, "ok");

      if (stats.imported > 0)
        addLog(`Imported ${stats.imported} new project${stats.imported !== 1 ? "s" : ""}`, "ok");
      if (stats.skipped > 0)
        addLog(`Skipped ${stats.skipped} (already exist)`, "info");
      if (stats.errors > 0)
        addLog(`${stats.errors} insert error${stats.errors !== 1 ? "s" : ""}`, "warn");
      if (stats.imported === 0 && stats.skipped === stats.total)
        addLog("All repos already in database — nothing new to import.", "info");

      addLog("Refreshing list…", "info");
      await loadProjects();
      addLog("Done!", "ok");
      setStatus("done");
    } catch (err: any) {
      setStatus("error");
      addLog(`Network error: ${err.message}`, "err");
    }
  };

  const copySQL = async () => {
    if (!setupSQL) return;
    await navigator.clipboard.writeText(setupSQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const logStyle = {
    info: "text-white/40",
    ok:   "text-emerald-400",
    err:  "text-red-400",
    warn: "text-amber-400",
  };
  const logPrefix = { info: "·", ok: "✓", err: "✕", warn: "!" };

  const busy = status === "running";

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Sidebar />

      <main className="lg:ml-[250px] pt-[95px] lg:pt-6 min-h-screen px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-[1400px] mx-auto">

          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-7">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Folder size={16} className="text-white/40" />
                <span className="text-xs text-white/40 uppercase tracking-widest">Admin</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold">Projects</h1>
              <p className="text-sm text-white/40 mt-1">
                {loading ? "Loading…" : `${projects.length} project${projects.length !== 1 ? "s" : ""}`}
              </p>
            </div>

            <div className="flex gap-2 flex-wrap">
              <button onClick={loadProjects}
                className="h-11 px-4 rounded-2xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] transition text-sm flex items-center gap-2 group">
                <RefreshCcw size={14} className="group-hover:rotate-180 transition duration-500" />
                Refresh
              </button>

              <button onClick={runImport} disabled={busy}
                className="h-11 px-4 rounded-2xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 hover:border-purple-500/50 transition text-sm flex items-center gap-2 text-purple-300 disabled:opacity-50">
                {busy ? <Loader2 size={15} className="animate-spin" /> : <Github size={15} />}
                {busy ? "Importing…" : "Import from GitHub"}
              </button>

              <button onClick={() => setAddOpen(true)}
                className="h-11 px-4 rounded-2xl bg-white text-black font-medium text-sm hover:opacity-90 transition flex items-center gap-2">
                <Plus size={15} /> Add Project
              </button>
            </div>
          </div>

          {/* IMPORT LOG PANEL */}
          {showPanel && (
            <div className="mb-6 rounded-2xl border border-white/10 bg-[#0d0d0d] overflow-hidden">

              {/* Panel title bar */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Terminal size={14} className="text-white/40" />
                  {busy        && <Loader2 size={14} className="animate-spin text-purple-400" />}
                  {status === "done"        && <CheckCircle size={14} className="text-emerald-400" />}
                  {status === "error"       && <AlertCircle size={14} className="text-red-400" />}
                  {status === "needs_setup" && <AlertCircle size={14} className="text-amber-400" />}
                  <span className="text-sm font-medium text-white/80">
                    {busy               ? "Running import…"
                    : status === "done"        ? "Import complete"
                    : status === "needs_setup" ? "Database setup needed"
                    : status === "error"       ? "Import failed"
                    : "Import log"}
                  </span>
                </div>
                {!busy && (
                  <button onClick={() => { setShowPanel(false); setStatus("idle"); }}
                    className="text-white/25 hover:text-white transition">
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Log lines */}
              <div className="px-5 pt-4 pb-2 space-y-1.5 font-mono text-[12px]">
                {logs.map((l, i) => (
                  <div key={i} className={`flex items-start gap-2 ${logStyle[l.type]}`}>
                    <span className="shrink-0 w-3">{logPrefix[l.type]}</span>
                    <span>{l.text}</span>
                  </div>
                ))}
              </div>

              {/* Setup SQL block */}
              {setupSQL && (
                <div className="px-5 pb-5 mt-2">
                  <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 overflow-hidden">
                    {/* SQL header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-amber-500/10">
                      <div>
                        <p className="text-xs font-semibold text-amber-400">
                          Step 1 — Create the table in Supabase
                        </p>
                        <p className="text-[11px] text-white/30 mt-0.5">
                          Go to <strong className="text-white/50">supabase.com → your project → SQL Editor → New query</strong> → paste → Run
                        </p>
                      </div>
                      <button onClick={copySQL}
                        className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 hover:bg-white/5 transition text-xs ml-3">
                        {copied
                          ? <><Check size={12} className="text-emerald-400" /> Copied!</>
                          : <><Copy size={12} /> Copy SQL</>}
                      </button>
                    </div>

                    {/* SQL code */}
                    <pre className="px-4 py-3 text-[11px] text-white/55 overflow-x-auto leading-relaxed whitespace-pre">
{setupSQL}
                    </pre>

                    {/* Step 2 */}
                    <div className="px-4 py-3 border-t border-amber-500/10 flex items-center justify-between gap-3">
                      <p className="text-[11px] text-white/35">
                        <strong className="text-white/50">Step 2 —</strong> After running the SQL, click Import again
                      </p>
                      <button onClick={runImport}
                        className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs hover:bg-purple-500/30 transition">
                        <Github size={12} />
                        Import again
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PROJECT GRID */}
          {loading ? (
            <div className="flex items-center gap-3 text-white/30 text-sm py-20 justify-center">
              <Loader2 size={16} className="animate-spin" /> Loading projects…
            </div>
          ) : projects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 h-64 flex flex-col items-center justify-center gap-4 text-white/25">
              <Github size={36} />
              <div className="text-center">
                <p className="text-sm mb-1">No projects yet</p>
                <p className="text-xs">Import from GitHub or add manually</p>
              </div>
              <button onClick={runImport}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-purple-500/30 text-purple-300 text-sm hover:bg-purple-500/10 transition">
                <Github size={14} /> Import from GitHub
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {projects.map((p) => (
                <div key={p.id}
                  className="group border border-white/10 bg-white/[0.02] rounded-2xl overflow-hidden hover:border-white/20 hover:-translate-y-1 transition-all duration-300 flex flex-col">

                  {/* Thumbnail */}
                  <div className="h-[130px] bg-[#111] flex items-center justify-center relative overflow-hidden">
                    {p.image_url
                      ? <img src={p.image_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                      : <Github size={28} className="text-white/10" />
                    }
                    {p.github_url && (
                      <a href={p.github_url} target="_blank" rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <Github size={13} />
                      </a>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-4 flex flex-col flex-1 gap-2">
                    <h2 className="font-semibold text-[13px] line-clamp-1">{p.title}</h2>
                    <p className="text-[11px] text-white/40 line-clamp-2 leading-relaxed flex-1">{p.description}</p>

                    {/* Tech tags */}
                    {p.technologies && (
                      <div className="flex flex-wrap gap-1">
                        {String(p.technologies).split(',').slice(0, 3).map((t: string, i: number) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/35">
                            {t.trim()}
                          </span>
                        ))}
                        {String(p.technologies).split(',').length > 3 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/25">
                            +{String(p.technologies).split(',').length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/5 gap-2">
                      <span className="text-[10px] text-white/25">
                        {p.created_at ? new Date(p.created_at).toLocaleDateString() : ""}
                      </span>
                      <div className="flex gap-1">
                        {p.live_url && (
                          <a href={p.live_url} target="_blank" rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="w-7 h-7 rounded-lg border border-white/10 flex items-center justify-center hover:bg-white/10 transition">
                            <ExternalLink size={12} />
                          </a>
                        )}
                        <button onClick={() => router.push(`/admin/projects/${p.id}`)}
                          className="h-7 px-3 rounded-lg border border-white/10 hover:bg-white hover:text-black transition text-[11px]">
                          Edit
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

      <AddProjectModal isOpen={addOpen} onClose={() => setAddOpen(false)}
        onAdd={(p: any) => setProjects(prev => [p, ...prev])} />
    </div>
  );
}
