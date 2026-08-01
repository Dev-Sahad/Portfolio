"use client";

import Link from "next/link";
import {
  Activity,
  Award,
  Bell,
  Bot,
  Database,
  Folder,
  Gauge,
  Globe,
  Instagram,
  LayoutDashboard,
  Layers,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  Music,
  Palette,
  Radio,
  Settings,
  Sparkles,
  TrendingUp,
  Users,
  X,
} from "lucide-react";

import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const menus = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/admin" },
  { name: "Projects", icon: Folder, path: "/admin/projects" },
  { name: "Database Studio", icon: Database, path: "/admin/database" },
  { name: "Certificates", icon: Award, path: "/admin/certificates" },
  { name: "Instagram Feed", icon: Instagram, path: "/admin/instagram" },
  { name: "Visitor Radar", icon: Users, path: "/admin/visitors" },
  { name: "Audio Engine", icon: Music, path: "/admin/audio" },
  { name: "Web Vitals", icon: Gauge, path: "/admin/vitals" },
  { name: "AI Persona", icon: Bot, path: "/admin/ai-assistant" },
  { name: "Inquiries", icon: Mail, path: "/admin/inquiries" },
  { name: "Theme Tokens", icon: Palette, path: "/admin/theme" },
  { name: "Comments", icon: MessageSquare, path: "/admin/comments" },
  { name: "Technologies", icon: Layers, path: "/admin/technologies" },
  { name: "3D Scene", icon: Sparkles, path: "/admin/scene3d" },
  { name: "System Status", icon: Activity, path: "/admin/status" },
  { name: "Settings", icon: Settings, path: "/admin/settings" },
  { name: "Webhook", icon: Bell, path: "/admin/webhook" },
  { name: "Growth & Content", icon: TrendingUp, path: "/admin/growth" },
];

function isActive(menuPath: string, currentPath: string): boolean {
  if (menuPath === "/admin") {
    return currentPath === "/admin" || currentPath === "/admin/dashboard";
  }
  return currentPath.startsWith(menuPath);
}

function AdminBrand({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`admin-brand-lockup ${compact ? 'admin-brand-lockup--compact' : ''}`}>
      <div className="admin-brand-mark" aria-hidden="true">
        <span>DS</span>
      </div>
      <div className="min-w-0">
        <div className="admin-brand-wordmark">DEV SAHAD</div>
        <div className="admin-brand-caption">PORTFOLIO CONTROL OS</div>
      </div>
    </div>
  )
}

function SidebarContent({
  hideTitle = false,
  onLinkClick,
}: {
  hideTitle?: boolean;
  onLinkClick?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  };

  return (
    <>
      <div>
        <div className="mb-7 space-y-4">
          {!hideTitle && <AdminBrand />}
          <Link
            href="/"
            onClick={onLinkClick}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-3.5 py-2.5 text-[11px] font-medium tracking-[0.08em] text-white/55 transition hover:border-cyan-300/25 hover:bg-cyan-300/[0.06] hover:text-cyan-100"
          >
            <Globe size={14} className="text-cyan-400" />
            VIEW PUBLIC PORTFOLIO
          </Link>
        </div>


        <div className="mb-2 px-3 text-[9px] font-mono tracking-[0.28em] text-white/25">WORKSPACE</div>
        <nav className="space-y-1" aria-label="Admin navigation">
          {menus.map((menu) => {
            const Icon = menu.icon;
            const active = isActive(menu.path, pathname);

            return (
              <Link
                key={menu.path}
                href={menu.path}
                className="block"
                onClick={onLinkClick}
              >
                <motion.div
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 280, damping: 20 }}
                  className={`relative overflow-hidden flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-300 group ${
                    active
                      ? "border border-cyan-300/20 bg-gradient-to-r from-cyan-400/15 via-violet-400/10 to-transparent text-white shadow-[0_10px_30px_rgba(6,182,212,0.08)]"
                      : "border border-transparent text-white/48 hover:border-white/[0.06] hover:text-white"
                  }`}
                >
                  {!active && (
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 rounded-xl bg-gradient-to-r from-white/[0.06] to-transparent" />
                  )}
                  {active && (
                    <motion.div
                      layoutId="activeSidebar"
                      className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-gradient-to-b from-cyan-300 to-violet-400 shadow-[0_0_12px_rgba(103,232,249,0.65)]"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                  <Icon size={17} className="relative z-10" />
                  <span className="relative z-10 text-[13px] font-medium tracking-[0.01em]">
                    {menu.name}
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-transparent text-white/35 hover:border-red-400/15 hover:bg-red-400/5 hover:text-red-200 transition text-sm"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
        <div className="flex items-center justify-between px-1 font-mono text-[9px] tracking-[0.16em] text-white/20">
          <span>DS CONTROL</span><span>v2.0</span>
        </div>
      </div>
    </>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (pathname === "/admin/login") return null;

  return (
    <>
      {!isMobile && (
        <aside className="admin-sidebar fixed left-0 top-0 h-screen w-[280px] p-5 flex flex-col justify-between overflow-y-auto z-50">
          <SidebarContent />
        </aside>
      )}

      {isMobile && (
        <>
          <div className="admin-mobile-bar fixed top-0 left-0 right-0 h-[76px] flex items-center justify-between px-4 z-[60]">
            <div className="flex items-center gap-3">
              <AdminBrand compact />
            </div>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open admin menu"
              className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white"
            >
              <Menu size={20} />
            </button>
          </div>


          <AnimatePresence>
            {open && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setOpen(false)}
                  className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[70]"
                />
                <motion.aside
                  initial={{ x: -280 }}
                  animate={{ x: 0 }}
                  exit={{ x: -280 }}
                  transition={{ type: "spring", stiffness: 260, damping: 28 }}
                  className="admin-sidebar fixed left-0 top-0 h-screen w-[300px] p-5 flex flex-col justify-between z-[80] overflow-y-auto"
                >
                  <div className="flex items-center justify-between mb-8">
                    <AdminBrand compact />
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      aria-label="Close admin menu"
                      className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <SidebarContent hideTitle onLinkClick={() => setOpen(false)} />
                  </div>
                </motion.aside>
              </>
            )}
          </AnimatePresence>
        </>
      )}
    </>
  );
}
