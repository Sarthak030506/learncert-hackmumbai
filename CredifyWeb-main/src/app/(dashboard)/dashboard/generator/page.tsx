"use client";

import React, { useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Award, Download, Hexagon, Database, Calendar, Link as LinkIcon, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import * as htmlToImage from "html-to-image";

export default function CertificateGenerator() {
  const params = useSearchParams();
  const initScore = params.get("score") ?? "98";
  const initRarity = Number(initScore) >= 80 ? "LEGENDARY" : Number(initScore) >= 60 ? "EPIC" : "RARE";
  const tokenId = params.get("tokenId") ?? "";
  const wallet = params.get("wallet") ?? "";
  const completion = params.get("completion") ?? "";
  const videoId = params.get("videoId") ?? "";
  const course = params.get("course") ?? "";
  const blockchainProofUrl = tokenId
    ? `/verify/${tokenId}?completion=${completion}&videoId=${encodeURIComponent(videoId)}&course=${encodeURIComponent(course)}&score=${initScore}&wallet=${encodeURIComponent(wallet)}`
    : "";

  const [recipientName, setRecipientName] = useState(params.get("name") ?? "Jane Doe");
  const [courseTitle, setCourseTitle] = useState(course || "Advanced System Design");
  const [platform, setPlatform] = useState("CREDIFY PROTOCOL");
  const [score, setScore] = useState(initScore);
  const [rarity, setRarity] = useState(initRarity);
  const [isExporting, setIsExporting] = useState(false);

  const certificateRef = useRef<HTMLDivElement>(null);

  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).toUpperCase();

  const handleDownload = async () => {
    if (!certificateRef.current) return;

    setIsExporting(true);
    try {
      const dataUrl = await htmlToImage.toPng(certificateRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: "#000000",
      });

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `Credify-Certificate-${recipientName.replace(/\s+/g, '-')}.png`;
      link.click();
    } catch (error) {
      console.error("Error generating certificate:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-16 pb-24 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <Badge variant="outline" className="px-3 py-1">
              ASSET GENERATOR
            </Badge>
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-none">
            MINT NEW ASSET
          </h1>
          <p className="text-xl text-white/40 font-medium max-w-2xl">
            Create a blockchain-backed educational credential and generate your certificate.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Form Panel */}
        <div className="lg:col-span-4 space-y-8">
          <div className="premium-glass p-8 rounded-[32px] space-y-6">
            <h2 className="text-2xl font-black tracking-tighter text-white uppercase">Asset Details</h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recipient" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Recipient Name</Label>
                <Input
                  id="recipient"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="bg-white/5 border-white/10 text-white h-12 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="course" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Course / Award Title</Label>
                <Input
                  id="course"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  className="bg-white/5 border-white/10 text-white h-12 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="platform" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Platform / Issuer</Label>
                <Input
                  id="platform"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="bg-white/5 border-white/10 text-white h-12 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="score" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Score / Grade</Label>
                  <Input
                    id="score"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    className="bg-white/5 border-white/10 text-white h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rarity" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Asset Rarity</Label>
                  <Select value={rarity} onValueChange={setRarity}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white h-12 rounded-xl">
                      <SelectValue placeholder="Select Rarity" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 border-white/10 text-white">
                      <SelectItem value="LEGENDARY">LEGENDARY</SelectItem>
                      <SelectItem value="EPIC">EPIC</SelectItem>
                      <SelectItem value="RARE">RARE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Button
              onClick={handleDownload}
              disabled={isExporting}
              className="w-full bg-white text-black hover:bg-white/90 h-14 rounded-2xl font-black shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98] mt-4"
            >
              <Download className="w-5 h-5 mr-3" />
              {isExporting ? "GENERATING..." : "DOWNLOAD CERTIFICATE"}
            </Button>

            {blockchainProofUrl && (
              <a
                href={blockchainProofUrl}
                className="flex items-center justify-center w-full h-12 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white"
              >
                View Blockchain Proof →
              </a>
            )}
          </div>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-8">
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-6 pl-4 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
            Live Preview
          </div>

          {/* Certificate Container */}
          <div
            ref={certificateRef}
            className="relative w-full aspect-[1.414/1] md:aspect-video rounded-[32px] overflow-hidden p-[1px] group mesh-gradient"
          >
            <div className={cn(
              "absolute inset-0 opacity-30",
              rarity === "LEGENDARY" ? "bg-gradient-to-br from-amber-500/20 via-transparent to-amber-500/10" :
              rarity === "EPIC" ? "bg-gradient-to-br from-purple-500/20 via-transparent to-purple-500/10" :
              "bg-gradient-to-br from-blue-500/20 via-transparent to-blue-500/10"
            )} />

            <div className="absolute inset-[1px] bg-black/80 backdrop-blur-3xl rounded-[31px] p-8 md:p-12 flex flex-col justify-between border border-white/[0.05]">
              {/* Rarity Indicator */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/[0.05] shadow-2xl">
                    <Hexagon className={cn(
                      "w-8 h-8",
                      rarity === "LEGENDARY" ? "text-amber-500" :
                      rarity === "EPIC" ? "text-purple-500" :
                      "text-blue-500"
                    )} />
                    <Award className="absolute w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-[10px] text-white/40 font-black uppercase tracking-[0.3em] mb-1">CERTIFICATE OF</div>
                    <div className="text-xl md:text-2xl font-black text-white tracking-widest text-glow">COMPLETION</div>
                  </div>
                </div>

                <div className={cn(
                  "px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] rounded-full",
                  rarity === "LEGENDARY" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]" :
                  rarity === "EPIC" ? "bg-purple-500/10 text-purple-500 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.2)]" :
                  "bg-blue-500/10 text-blue-500 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                )}>
                  {rarity} ASSET
                </div>
              </div>

              {/* Central Content */}
              <div className="space-y-6 md:space-y-8 my-8">
                <div>
                  <div className="text-[10px] text-white/40 font-black uppercase tracking-[0.3em] mb-3">PROUDLY PRESENTED TO</div>
                  <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none">{recipientName || "Recipient Name"}</h2>
                </div>

                <div className="w-16 h-1 bg-white/20 rounded-full" />

                <div>
                  <div className="text-[10px] text-white/40 font-black uppercase tracking-[0.3em] mb-3">FOR SUCCESSFULLY COMPLETING</div>
                  <h3 className="text-2xl md:text-4xl font-bold text-white/90 tracking-tight leading-tight max-w-2xl">
                    {courseTitle || "Course Title"}
                  </h3>
                  <div className="flex items-center gap-2 mt-4 text-[12px] font-black text-white/40 uppercase tracking-widest">
                    <Database className="w-4 h-4" /> {platform || "PLATFORM"}
                  </div>
                </div>
              </div>

              {/* Footer Metadata */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-white/[0.05]">
                <div className="space-y-2">
                  <div className="text-[10px] text-white/20 font-black uppercase tracking-[0.2em] flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" /> ISSUED ON
                  </div>
                  <div className="text-sm font-bold text-white tracking-tight">{currentDate}</div>
                </div>

                <div className="space-y-2">
                  <div className="text-[10px] text-white/20 font-black uppercase tracking-[0.2em]">
                    SCORE
                  </div>
                  <div className={cn(
                    "text-xl font-black tracking-tighter text-glow",
                    rarity === "LEGENDARY" ? "text-amber-500" :
                    rarity === "EPIC" ? "text-purple-500" :
                    "text-blue-500"
                  )}>{score || "0"}</div>
                </div>

                <div className="space-y-2 col-span-2 text-right md:text-left">
                  <div className="text-[10px] text-white/20 font-black uppercase tracking-[0.2em] flex items-center gap-2 justify-end md:justify-start">
                    <ShieldCheck className="w-3.5 h-3.5" /> VERIFIED SIGNATURE
                  </div>
                  <div className="font-[signature] text-2xl text-white/80 transform -rotate-2">
                    Credify Network
                  </div>
                </div>
              </div>
            </div>

            {/* Ambient Glows */}
            <div className={cn(
              "absolute -bottom-32 -right-32 w-96 h-96 blur-[120px] rounded-full transition-all duration-700 pointer-events-none opacity-20",
              rarity === "LEGENDARY" ? "bg-amber-500" :
              rarity === "EPIC" ? "bg-purple-500" :
              "bg-blue-500"
            )} />
          </div>
        </div>
      </div>
    </div>
  );
}
