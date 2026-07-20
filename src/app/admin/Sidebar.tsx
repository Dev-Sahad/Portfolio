"use client";

import Link from "next/link";
import {
  Activity,
  Award,
  Bell,
  Folder,
  LayoutDashboard,
  Layers,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  Sparkles,
  X,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const menus = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/admin" },
  { name: "Projects", icon: Folder, path: "/admin/projects" },
  { name: "Certificates", icon: Award, path: "/admin/certificates" },
  { name: "Comments", icon: MessageSquare, path: "/admin/comments" },
  { name: "Technologies", icon: Layers, path: "/admin/technologies" },
  { name: "3D Scene", icon: Sparkles, path: "/admin/scene3d" },
  { name: "System Status", icon: Activity, path: "/admin/status" },
  { name: "Settings", icon: Settings, path: "/admin/settings" },
  { name: "Webhook", icon: Bell, path: "/admin/webhook" },
];

function isActive(menuPath: string, currentPath: string): boolean {
  if (menuPath === "/admin") {
    return currentPath === "/admin" || currentPath === "/admin/dashboard";
  }
  return currentPath.startsWith(menuPath);
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
        {!hideTitle && (
          <h1 className="text-lg font-semibold mb-8 tracking-wide text-white">
            Admin Panel
          </h1>
        )}

        <nav className="space-y-2" aria-label="Admin navigation">
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
                  whileHover={{ x: 6, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 280, damping: 20 }}
                  className={`relative overflow-hidden flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                    active
                      ? "bg-white text-black shadow-[0_0_25px_rgba(255,255,255,0.12)]"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  {!active && (
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 rounded-xl bg-gradient-to-r from-white/[0.06] to-transparent" />
                  )}
                  {active && (
                    <motion.div
                      layoutId="activeSidebar"
                      className="absolute left-0 top-2 bottom-2 w-[4px] rounded-full bg-black"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                  <Icon size={17} className="relative z-10" />
                  <span className="relative z-10 text-sm font-medium tracking-wide">
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
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition text-sm"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
        <div className="text-xs text-white/35 tracking-wide px-1">© 2026 Admin</div>
      </div>
    </>
  );
}

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <>
      {!isMobile && (
        <aside className="fixed left-0 top-0 h-screen w-[250px] bg-black border-r border-white/10 p-6 flex flex-col justify-between overflow-y-auto z-50">
          <SidebarContent />
        </aside>
      )}

      {isMobile && (
        <>
          <div className="fixed top-0 left-0 right-0 h-[70px] bg-black/95 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-5 z-[60]">
            <h1 className="text-white font-semibold text-base">Admin Panel</h1>
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
                  className="fixed left-0 top-0 h-screen w-[280px] bg-black border-r border-white/10 p-6 flex flex-col justify-between z-[80] overflow-y-auto"
                >
                  <div className="flex items-center justify-between mb-8">
                    <h1 className="text-lg font-semibold text-white">Admin Panel</h1>
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
