import React, { useState } from "react";
import { GlassCard } from "../ui/GlassCard";
import { Button } from "../ui/Button";

interface MintPanelProps {
  isEligible: boolean;
  videoTitle?: string;
  videoId?: string;
  score?: number;
  completion?: number;
  sessionHash?: string;
  walletAddress?: string;
  transactionHash?: string;
  onMintSuccess?: (txHash: string, tokenId: number) => void;
}

export const MintPanel: React.FC<MintPanelProps> = ({
  isEligible,
  videoTitle,
  videoId,
  score,
  completion,
  sessionHash,
  walletAddress,
  transactionHash: existingHash,
}) => {
  const [launched, setLaunched] = useState(!!existingHash);
  const [error, setError] = useState("");

  const handleMint = () => {
    if (!isEligible) return;
    setError("");

    if (!walletAddress || !walletAddress.startsWith("0x") || walletAddress.length !== 42) {
      setError("Enter a valid MetaMask wallet address in the field above first.");
      return;
    }

    const url =
      `https://credifyweb-pi.vercel.app/claim` +
      `?wallet=${encodeURIComponent(walletAddress)}` +
      `&score=${score ?? 0}` +
      `&course=${encodeURIComponent(videoTitle || "Credify Certificate")}` +
      `&completion=${completion ?? 0}` +
      `&videoId=${encodeURIComponent(videoId || "")}` +
      `&sessionHash=${encodeURIComponent(sessionHash || "")}`;

    chrome.tabs.create({ url });
    setLaunched(true);
  };

  return (
    <div className="px-5 py-2 pb-6 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
      <p className="meta-label opacity-40 mb-3">On-Chain Settlement</p>

      <GlassCard className="!p-5 border-white/5 relative overflow-hidden group hover:border-white/10 transition-all duration-500">
        {/* Launched state */}
        {launched && (
          <div className="text-center py-2">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-emerald-500/10 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17L4 12" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="heading-heavy text-emerald-500 text-base mb-1">Claim Page Opened!</p>
            <p className="text-[10px] font-medium text-white/40">
              Complete the mint on the Credify claim page
            </p>
          </div>
        )}

        {/* Error state */}
        {!launched && error && (
          <div className="text-center py-2 mb-4">
            <p className="text-[10px] text-rose-400 px-2">{error}</p>
          </div>
        )}

        {/* Idle state - CTA */}
        {!launched && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-500 ${
                isEligible ? "bg-white/5 border-white/20" : "bg-white/[0.02] border-white/5"
              }`}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={isEligible ? "text-white" : "text-white/20"}>
                  <rect x="3" y="2" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M7 7H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M7 11H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`heading-heavy !tracking-normal truncate ${isEligible ? "text-white" : "text-white/30"}`}>
                  {videoTitle || "Learning Certificate"}
                </p>
                <p className="meta-label !text-[8px] opacity-40 mt-1">
                  Soulbound NFT · Proof of Attention
                </p>
              </div>
            </div>

            <Button
              variant="primary"
              fullWidth
              disabled={!isEligible}
              onClick={handleMint}
              className={!isEligible ? "opacity-20 grayscale" : ""}
            >
              {isEligible ? "Claim Certificate" : "Requirements Pending"}
            </Button>

            <div className="flex items-center justify-center gap-2">
              <div className="status-pulse !bg-emerald-500/50" />
              <p className="meta-label !text-[8px] opacity-30">Gasless · Opens Credify Claim Page</p>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default MintPanel;
