"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, signInWithGoogle } = useAuth();
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  const handleGoogleSignIn = async () => {
    setError(null);
    setSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error("Sign-in error:", err);
      if (err?.code === "auth/popup-closed-by-user") {
        // User closed the popup — not really an error
        setError(null);
      } else if (err?.code === "auth/unauthorized-domain") {
        setError("This domain is not authorized for sign-in. Add localhost to your Firebase Auth settings.");
      } else {
        setError("Something went wrong. Please try again.");
      }
      setSigningIn(false);
    }
  };

  // Show nothing while checking auth state (prevents flash)
  if (loading || user) {
    return (
      <div className="login-page">
        <div className="login-loader">
          <Loader2 className="login-spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      {/* Subtle background shapes */}
      <div className="login-bg-shape login-bg-shape-1" />
      <div className="login-bg-shape login-bg-shape-2" />
      <div className="login-bg-shape login-bg-shape-3" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="login-card"
      >
        {/* Logo */}
        <Link href="/" className="login-logo-link">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="login-logo"
          >
            <ShieldCheck className="login-logo-icon" />
          </motion.div>
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="login-header"
        >
          <h1 className="login-title">Welcome to Credify</h1>
          <p className="login-subtitle">
            Verify your learning. Build your proof&#8209;of&#8209;work.
          </p>
        </motion.div>

        {/* Sign in button */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="login-actions"
        >
          <button
            onClick={handleGoogleSignIn}
            disabled={signingIn}
            className="login-google-btn"
            id="google-sign-in-button"
          >
            {signingIn ? (
              <Loader2 className="login-btn-spinner" />
            ) : (
              <svg className="login-google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            <span>{signingIn ? "Signing in…" : "Continue with Google"}</span>
            {!signingIn && <ArrowRight className="login-btn-arrow" />}
          </button>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="login-error"
            >
              {error}
            </motion.p>
          )}
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="login-footer"
        >
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </motion.p>
      </motion.div>

      {/* Bottom link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="login-bottom"
      >
        <Link href="/" className="login-back-link">
          <ArrowRight className="login-back-arrow" />
          Back to home
        </Link>
      </motion.div>
    </div>
  );
}
