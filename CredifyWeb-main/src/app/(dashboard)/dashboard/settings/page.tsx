"use client";

import React from "react";
import { 
  Settings, 
  Shield, 
  Wallet,
  Lock,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  return (
    <div className="space-y-12 pb-24 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <Badge variant="outline" className="text-[10px] font-black uppercase tracking-[0.3em] bg-white/[0.03] text-white/40 border-white/5 px-3 py-1 rounded-full">
              NODE CONTROL
            </Badge>
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-none">
            SETTINGS
          </h1>
          <p className="text-xl text-white/40 font-medium max-w-2xl">
            Identity privacy controls, wallet integrations, and node preference settings are being calibrated for the next network epoch.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-white/20 text-[11px] font-black uppercase tracking-widest mr-4 hidden sm:flex">
            <Lock className="w-4 h-4" />
            ENCRYPTED ACCESS
          </div>
          <Button className="bg-white text-black hover:bg-white/90 h-14 px-10 rounded-2xl font-black shadow-2xl transition-all hover:scale-105 active:scale-95">
            ACCESS TERMINAL
            <ArrowRight className="ml-3 w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex justify-center pt-12 pb-4">
        <div className="relative">
          <div className="w-24 h-24 bg-white/[0.03] rounded-[32px] border border-white/[0.05] flex items-center justify-center shadow-2xl relative z-10">
            <Settings className="w-12 h-12 text-white/20" />
          </div>
          <div className="absolute -inset-8 bg-emerald-500/5 blur-3xl rounded-full" />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 w-full">
        {[
          { icon: Shield, label: "Privacy", desc: "ZKP visibility toggles" },
          { icon: Wallet, label: "Wallet", desc: "Smart contract linkage" },
          { icon: Settings, label: "Preferences", desc: "Network node routing" }
        ].map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + (i * 0.1), duration: 0.8 }}
            className="premium-glass p-6 rounded-[24px] border-white/[0.03] text-left group hover:bg-white/[0.05] transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-white/[0.03] flex items-center justify-center mb-4 group-hover:bg-white group-hover:text-black transition-all">
              <feature.icon className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">{feature.label}</p>
            <p className="text-sm font-bold text-white tracking-tight">{feature.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
