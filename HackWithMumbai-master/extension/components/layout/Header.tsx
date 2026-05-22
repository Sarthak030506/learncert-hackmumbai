import React from "react";

interface HeaderProps {
  isTracking?: boolean;
  overlayEnabled?: boolean;
  onOverlayToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isTracking = false,
  overlayEnabled = true,
  onOverlayToggle,
}) => {
  return (
    <div className="relative px-5 pt-6 pb-4">
      <div className="flex items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 premium-glass rounded-xl flex items-center justify-center border-white/10 group hover:border-white/20 transition-all duration-500">
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              className="group-hover:scale-110 transition-transform duration-500"
            >
              <path
                d="M12 2L14.5 4.5L18 3L17 6.5L20.5 8L18 10.5L19 14L15.5 13.5L14 17L12 14.5L10 17L8.5 13.5L5 14L6 10.5L3.5 8L7 6.5L6 3L9.5 4.5L12 2Z"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 12L11 14L15 10"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-lg heading-heavy leading-none text-white tracking-tight">
              Credify
            </h1>
            <p className="meta-label opacity-50 mt-0.5">
              Protocol v1.0
            </p>
          </div>
        </div>

        {/* Right section: overlay toggle + status */}
        <div className="flex items-center gap-2">
          {/* Overlay Toggle */}
          {onOverlayToggle && (
            <button
              onClick={onOverlayToggle}
              className="group flex items-center gap-1.5 px-2.5 py-1.5 premium-glass rounded-full border-white/5 hover:border-white/15 transition-all duration-500"
              title={overlayEnabled ? "Disable YouTube overlay" : "Enable YouTube overlay"}
            >
              {/* Toggle track */}
              <div
                className="relative w-7 h-[14px] rounded-full transition-all duration-500"
                style={{
                  background: overlayEnabled
                    ? "rgba(16, 185, 129, 0.3)"
                    : "rgba(255, 255, 255, 0.08)",
                  border: `1px solid ${overlayEnabled ? "rgba(16, 185, 129, 0.4)" : "rgba(255, 255, 255, 0.1)"}`,
                }}
              >
                {/* Toggle knob */}
                <div
                  className="absolute top-[1.5px] w-[9px] h-[9px] rounded-full transition-all duration-500"
                  style={{
                    left: overlayEnabled ? "14px" : "2px",
                    background: overlayEnabled ? "#10b981" : "rgba(255, 255, 255, 0.3)",
                    boxShadow: overlayEnabled ? "0 0 6px rgba(16, 185, 129, 0.4)" : "none",
                  }}
                />
              </div>
              <span className="meta-label !text-[7px] opacity-30 group-hover:opacity-50 transition-opacity">
                HUD
              </span>
            </button>
          )}

          {/* Live Status Indicator */}
          {isTracking && (
            <div className="flex items-center gap-2 px-3 py-1.5 premium-glass rounded-full border-white/5">
              <div className="status-pulse" />
              <span className="meta-label text-[#10b981] !text-[9px]">Live</span>
            </div>
          )}
        </div>
      </div>

      {/* Sleek Divider */}
      <div className="absolute bottom-0 left-5 right-5 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
};

export default Header;
