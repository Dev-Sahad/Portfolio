"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/admin/Sidebar";
import { Plus, Github, RefreshCcw, ExternalLink, Folder, X, CheckCircle, AlertCircle, Loader2, Star } from "lucide-react";
import AddProjectModal from "./AddProjectModal";
import { supabase } from "@/lib/supabase";

// The GitHub token — same one used for pushing, allows authenticated API calls
const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN || "";
const GITHUB_USER  = "Dev-Sahad";

type ImportStatus = "idle" | "fetching" | "importing" | "done" | "error";

export default function ProjectsPage() {
  const router = useRouter();
  const [open, setOpen]         = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);

  // Import state
  const [importStatus, setImportStatus] = useState<ImportStatus>("idle");
  const [importLog, setImportLog]       = useState<string[]>([]);
  const [showImportPanel, setShowImportPanel] = useState(false);

  // ── fetch projects ────────────────────────────────────────────────
  const fetchProjects = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push("/admin/login"); return; }

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setProjects(data);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    fetchProjects();

    const channel = supabase
      .channel("projects-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "projects" }, fetchProjects)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchProjects]);

  // ── import from GitHub ────────────────────────────────────────────
  const handleImport = async () => {
    setShowImportPanel(true);
    setImportLog([]);
    setImportStatus("fetching");

    const log = (msg: string) => setImportLog(prev => [...prev, msg]);

    log(`🔍 Fetching repos for @${GITHUB_USER}...`);

    try {
      // Pass the token as a query param so the server route uses it
      const url = `/api/import-github-projects?username=${GITHUB_USER}&gh_token=${GITHUB_TOKEN}`;
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok || !data.success) {
        setImportStatus("error");
        log(`❌ Failed: ${data.error || "Unknown error"}`);
        if (data.errors?.length) {
          data.errors.forEach((e: string) => log(`   • ${e}`));
        }
        return;
      }

      const { stats } = data;
      log(`✅ GitHub: found ${stats.total} public repos`);

      setImportStatus("importing");

      if (stats.imported === 0 && stats.skipped > 0) {
        log(`ℹ️  All ${stats.skipped} repos already exist — nothing new to import`);
      } else {
        if (stats.imported > 0) log(`⬆️  Imported ${stats.imported} new project${stats.imported !== 1 ? "s" : ""}`);
        if (stats.skipped  > 0) log(`⏭️  Skipped ${stats.skipped} already existing`);
        if (stats.errors   > 0) log(`⚠️  ${stats.errors} insert error${stats.errors !== 1 ? "s" : ""}`);
      }

      log("🔄 Refreshing project list...");
      await fetchProjects();
      log("🎉 Done!");
      setImportStatus("done");
    } catch (err: any) {
      setImportStatus("error");
      log(`❌ Network error: ${err.message}`);
    }
  };

  const handleAdd = (p: any) => setProjects(prev =>
    [p, ...prev].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  );

  const statusIcon = {
    idle: null,
    fetching: <Loader2 size={14} className="animate-spin text-white/50" />,
    importing: <Loader2 size={14} className="animate-spin text-blue-400" />,
    done: <CheckCircle size={14} className="text-emerald-400" />,
    error: <AlertCircle size={14} className="text-red-400" />,
  }[importStatus];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Sidebar />

      <main className="lg:ml-[250px] pt-[95px] lg:pt-6 min-h-screen px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-[1400px] mx-auto">

          {/* ── HEADER ─────────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-7">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Folder size={16} className="text-white/40" />
                <span className="text-xs text-white/40 uppercase tracking-widest">Admin</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold">Projects</h1>
              <p className="text-sm text-white/40 mt-1">
                {projects.length} project{projects.length !== 1 ? "s" : ""} total
              </p>
            </div>

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={fetchProjects}
                className="h-11 px-4 rounded-2xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] transition text-sm flex items-center gap-2 group"
              >
                <RefreshCcw size={14} className="group-hover:rotate-180 transition duration-500" />
                Refresh
              </button>

              <button
                onClick={handleImport}
                disabled={importStatus === "fetching" || importStatus === "importing"}
                className="h-11 px-4 rounded-2xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 hover:border-purple-500/50 transition text-sm flex items-center gap-2 text-purple-300 disabled:opacity-50"
              >
                {importStatus === "fetching" || importStatus === "importing"
                  ? <Loader2 size={15} className="animate-spin" />
                  : <Github size={15} />
                }
                {importStatus === "fetching"  ? "Fetching..."
                 : importStatus === "importing" ? "Importing..."
                 : "Import from GitHub"}
              </button>

              <button
                onClick={() => setOpen(true)}
                className="h-11 px-4 rounded-2xl bg-white text-black font-medium text-sm hover:opacity-90 transition flex items-center gap-2"
              >
                <Plus size={15} />
                Add Project
              </button>
            </div>
          </div>

          {/* ── IMPORT LOG PANEL ────────────────────────────────────── */}
          {showImportPanel && (
            <div className="mb-6 rounded-2xl border border-white/10 bg-[#0d0d0d] p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {statusIcon}
                  <span className="text-sm font-medium">
                    {importStatus === "done"  ? "Import complete"
                     : importStatus === "error" ? "Import failed"
                     : "Importing..."}
                  </span>
                </div>
                {(importStatus === "done" || importStatus === "error") && (
                  <button onClick={() => { setShowImportPanel(false); setImportStatus("idle"); }}
                    className="text-white/30 hover:text-white transition">
                    <X size={16} />
                  </button>
                )}
              </div>
              <div className="space-y-1 font-mono text-xs text-white/50">
                {importLog.map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </div>
            </div>
          )}

          {/* ── PROJECT GRID ────────────────────────────────────────── */}
          {loading ? (
            <div className="flex items-center gap-3 text-white/30 text-sm py-16 justify-center">
              <Loader2 size={16} className="animate-spin" />
              Loading projects...
            </div>
          ) : projects.length === 0 ? (
            <div className="rounded-2xl border border-white/10 border-dashed h-60 flex flex-col items-center justify-center gap-3 text-white/25">
              <Folder size={32} />
              <p className="text-sm">No projects yet</p>
              <button onClick={handleImport}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-purple-500/30 text-purple-300 text-xs hover:bg-purple-500/10 transition">
                <Github size={14} />
                Import from GitHub
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {projects.map((project) => (
                <div key={project.id}
                  className="group border border-white/10 bg-white/[0.02] rounded-2xl overflow-hidden hover:border-white/20 hover:-translate-y-1 transition-all duration-300 flex flex-col">

                  {/* IMAGE */}
                  <div className="w-full h-[140px] bg-white/[0.03] overflow-hidden relative">
                    {project.image_url ? (
                      <img src={project.image_url} alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Github size={28} className="text-white/10" />
                      </div>
                    )}
                    {/* GitHub badge */}
                    {project.github_url && (
                      <a href={project.github_url} target="_blank" rel="noopener noreferrer"
                        className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-black/60 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-black/80"
                        onClick={e => e.stopPropagation()}>
                        <Github size={13} />
                      </a>
                    )}
                  </div>

                  {/* BODY */}
                  <div className="p-4 flex flex-col flex-1">
                    <h2 className="font-semibold text-[13px] mb-1 line-clamp-1">{project.title}</h2>
                    <p className="text-[11px] text-white/40 line-clamp-2 mb-3 leading-relaxed flex-1">
                      {project.description}
                    </p>

                    {/* TECH TAGS */}
                    {project.technologies && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {String(project.technologies).split(',').slice(0, 3).map((t: string, i: number) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/40">
                            {t.trim()}
                          </span>
                        ))}
                        {String(project.technologies).split(',').length > 3 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/30">
                            +{String(project.technologies).split(',').length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* FOOTER */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                      <span className="text-[10px] text-white/25">
                        {project.created_at ? new Date(project.created_at).toLocaleDateString() : ""}
                      </span>
                      <div className="flex items-center gap-1">
                        {project.live_url && (
                          <a href={project.live_url} target="_blank" rel="noopener noreferrer"
                            className="w-7 h-7 rounded-lg border border-white/10 flex items-center justify-center hover:bg-white/10 transition"
                            onClick={e => e.stopPropagation()}>
                            <ExternalLink size={12} />
                          </a>
                        )}
                        <button onClick={() => router.push(`/admin/projects/${project.id}`)}
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

      <AddProjectModal isOpen={open} onClose={() => setOpen(false)} onAdd={handleAdd} />
    </div>
  );
}
