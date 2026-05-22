"use client";

import { useState, useEffect, useCallback } from "react";

export interface ActiveSession {
  title: string;
  duration: number; // in seconds
  progress: number; // 0 to 100
  isTracking: boolean;
}

export interface ExtensionStats {
  score: number;
  verifiedHours: number;
  learningStreak: number;
  focusScore: number;
}

export interface MintStatus {
  status: "idle" | "quoting" | "settling" | "executing" | "confirmed" | "error";
  txHash?: string;
  tokenId?: string;
  error?: string;
}

export function useExtension() {
  const [isExtensionInstalled, setIsExtensionInstalled] = useState(false);
  const [activeSession, setActiveSession] = useState<ActiveSession>({
    title: "No active session",
    duration: 0,
    progress: 0,
    isTracking: false,
  });
  const [stats, setStats] = useState<ExtensionStats>({
    score: 842,
    verifiedHours: 128.5,
    learningStreak: 12,
    focusScore: 94,
  });
  const [mintStatus, setMintStatus] = useState<MintStatus>({
    status: "idle",
  });

  // Helper to send messages to the extension content script
  const sendToExtension = useCallback((action: string, payload?: any) => {
    if (typeof window === "undefined") return;
    
    console.log(`[Web -> Extension] Sending action: ${action}`, payload);
    const event = new CustomEvent("CREDIFY_WEB_EVENT", {
      detail: { action, payload },
    });
    window.dispatchEvent(event);
  }, []);

  // Listen for events from the extension
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleExtensionMessage = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { action, payload } = customEvent.detail || {};
      
      console.log(`[Extension -> Web] Received action: ${action}`, payload);

      if (!action) return;

      setIsExtensionInstalled(true);

      switch (action) {
        case "HEARTBEAT_ACK":
          setIsExtensionInstalled(true);
          break;
        case "TRACKING_UPDATE":
          if (payload.activeSession) {
            setActiveSession(payload.activeSession);
          }
          if (payload.stats) {
            setStats(payload.stats);
          }
          break;
        case "MINT_STATUS_UPDATE":
          if (payload) {
            setMintStatus(payload);
          }
          break;
        default:
          break;
      }
    };

    // Listen for events
    window.addEventListener("CREDIFY_EXT_RESPONSE", handleExtensionMessage);

    // Send initial heartbeat check to detect if extension is active
    sendToExtension("HEARTBEAT_CHECK");

    // Poll status occasionally in case we missed updates
    const interval = setInterval(() => {
      sendToExtension("HEARTBEAT_CHECK");
    }, 5000);

    return () => {
      window.removeEventListener("CREDIFY_EXT_RESPONSE", handleExtensionMessage);
      clearInterval(interval);
    };
  }, [sendToExtension]);

  const requestMint = useCallback((certId: string) => {
    setMintStatus({ status: "quoting" });
    sendToExtension("MINT_CERTIFICATE", { certId });
  }, [sendToExtension]);

  return {
    isExtensionInstalled,
    activeSession,
    stats,
    mintStatus,
    sendToExtension,
    requestMint,
  };
}
