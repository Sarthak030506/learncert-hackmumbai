"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Award, 
  History, 
  Settings, 
  LogOut,
  User,
  ShieldCheck,
  TrendingUp,
  Search,
  Bell,
  Plus,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { motion, AnimatePresence } from "framer-motion";

const sidebarItems = [
  { icon: LayoutDashboard, label: "OVERVIEW", href: "/dashboard" },
  { icon: History, label: "TRACKING", href: "/dashboard/tracking" },
  { icon: Award, label: "ASSETS", href: "/dashboard/certificates" },
  { icon: TrendingUp, label: "ANALYTICS", href: "/dashboard/analytics" },
  { icon: Settings, label: "SETTINGS", href: "/dashboard/settings" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, loading, signOut } = useAuth();

  // Auth guard: redirect to login if not authenticated
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <Loader2 className="w-8 h-8 text-white/30 animate-spin" />
      </div>
    );
  }

  if (!user) {
    router.replace("/login");
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <Loader2 className="w-8 h-8 text-white/30 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-black text-white selection:bg-white/10 mesh-gradient">
      {/* Sidebar */}
      <aside className="w-72 flex flex-col z-20 relative">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-3xl border-r border-white/[0.03]" />
        
        <div className="relative z-10 p-10">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center transition-all group-hover:scale-110 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              <ShieldCheck className="text-black w-6 h-6" />
            </div>
            <span className="font-bold text-2xl tracking-tighter text-white">Credify</span>
          </Link>
        </div>

        <nav className="relative z-10 flex-1 px-6 space-y-2 mt-4">
          <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] px-4 mb-6">
            PROTOCOL
          </div>
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[11px] font-black transition-all relative group tracking-[0.1em]",
                  isActive 
                    ? "text-white" 
                    : "text-white/30 hover:text-white"
                )}
              >
                {isActive && (
                  <motion.div 
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-white/[0.03] rounded-2xl border border-white/[0.05]"
                    transition={{ type: "spring", bounce: 0.1, duration: 0.6 }}
                  />
                )}
                <item.icon className={cn("w-4.5 h-4.5 z-10 transition-transform group-hover:scale-110", isActive ? "text-white" : "text-white/20")} />
                <span className="z-10">{item.label}</span>
                {isActive && (
                  <motion.div 
                    layoutId="sidebar-active-pill"
                    className="absolute left-0 w-1 h-4 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="relative z-10 p-6 mt-auto">
          <div className="premium-glass rounded-3xl p-5 border-white/[0.03] mb-6">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.05] flex items-center justify-center border border-white/[0.05] overflow-hidden">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || "User"} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-6 h-6 text-white/40" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-white truncate tracking-tight uppercase">
                  {profile?.displayName || user?.email?.split('@')[0]}
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <p className="text-[9px] text-white/30 font-black uppercase tracking-widest">
                    {profile?.subscriptionTier || 'NODE'} v1.0
                  </p>
                </div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              className="w-full h-10 justify-start text-white/20 hover:text-rose-400 hover:bg-rose-500/10 gap-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors"
              onClick={() => signOut()}
            >
              <LogOut className="w-4 h-4" />
              TERMINATE
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Ambient Glows */}
        <div className="ambient-glow top-[-10%] left-[20%] w-[50%] h-[50%] bg-blue-500/5 blur-[150px]" />
        <div className="ambient-glow bottom-[-10%] right-[10%] w-[40%] h-[40%] bg-purple-500/5 blur-[150px]" />

        {/* Top Header */}
        <header className="h-20 border-b border-white/[0.03] flex items-center justify-between px-10 relative z-10 bg-black/20 backdrop-blur-xl">
          <div className="flex items-center gap-6 flex-1">
            <div className="relative max-w-lg w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-white transition-colors" />
              <Input 
                placeholder="SEARCH PROTOCOL..." 
                className="bg-white/[0.02] border-white/[0.03] pl-12 focus-visible:ring-white/10 h-11 text-[11px] font-bold uppercase tracking-widest rounded-xl"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <ThemeToggle className="text-white/20 hover:text-white hover:bg-white/[0.03] w-11 h-11" />
            <Button variant="ghost" size="icon" className="text-white/20 hover:text-white hover:bg-white/[0.03] relative w-11 h-11 rounded-xl">
              <Bell className="w-5 h-5" />
              <span className="absolute top-3 right-3 w-2 h-2 bg-white rounded-full border-2 border-black" />
            </Button>
            <div className="h-8 w-px bg-white/[0.05] mx-2" />
            <Button className="bg-white text-black hover:bg-white/90 gap-3 shadow-2xl h-11 px-6 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all hover:scale-105 active:scale-95">
              <Plus className="w-4 h-4" />
              NEW GOAL
            </Button>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar relative z-0">
          <div className="p-12 max-w-[1400px] mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
