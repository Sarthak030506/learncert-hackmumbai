# Credify Extension Design System & UI Instructions

This document outlines the design tokens, class specifications, layout systems, and interactive micro-animations used in the **Credify Web Protocol** application. Use these guidelines to modify and style the Chrome extension popup and widgets to achieve absolute aesthetic and visual consistency.

---

## 1. Core Visual Tokens & Colors

### Color Palette
- **Background**: Pure Deep Black (`#000000`)
- **Text Primary**: High-Contrast White (`#FFFFFF`)
- **Text Secondary / Muted**: Translucent White (`rgba(255, 255, 255, 0.4)` or `text-white/40`)
- **Text Tertiary / Captions**: Faded White (`rgba(255, 255, 255, 0.2)` or `text-white/20`)
- **Emerald Accent (Live / Success)**: `#10b981` (with high-intensity glowing shadows)
- **Amber Accent (Legendary / Warning)**: `#f59e0b`
- **Purple Accent (Epic)**: `#a855f7`
- **Blue Accent (Rare / Info)**: `#3b82f6`

---

## 2. Global CSS Utility Clones

If the extension uses Tailwind CSS, leverage these utilities. If using raw CSS, define the following selectors:

```css
/* Mesh Gradient Background for main container */
.mesh-gradient {
  background-color: #000000;
  background-image: 
    radial-gradient(at 0% 0%, hsla(253, 16%, 7%, 1) 0px, transparent 50%), 
    radial-gradient(at 50% 0%, hsla(225, 39%, 30%, 0.15) 0px, transparent 50%), 
    radial-gradient(at 100% 0%, hsla(339, 49%, 30%, 0.1) 0px, transparent 50%);
}

/* Translucent Glass Card Panels */
.premium-glass {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.8);
}

/* Subtle text glow for highlights */
.text-glow {
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
}

/* Glowing ambient color backdrops */
.ambient-glow {
  position: absolute;
  filter: blur(120px);
  border-radius: 9999px;
  opacity: 0.20;
  z-index: -10;
}
```

---

## 3. Typography & Spacing Rules

- **Primary Headings (Metrics, Section Titles)**:
  - Weight: Heavy/Black (`font-black` or `font-weight: 900`)
  - Tracking: Extremely Tight (`tracking-tighter` or `letter-spacing: -0.05em`)
  - Capitalization: **UPPERCASE**
- **System Labels / Metadata Tags**:
  - Size: Very small (`text-[10px]` or `font-size: 10px`)
  - Weight: Super bold (`font-black` or `font-weight: 900`)
  - Tracking: High letter spacing (`tracking-[0.3em]` or `letter-spacing: 0.3em`)
  - Capitalization: **UPPERCASE**

---

## 4. Component Layout Specifications

### Extension Header
- Include a sleek left-aligned logo alongside the title `Credify`.
- Display a live network tag with a pulsing green indicator:
  ```html
  <div class="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#10b981]">
    <div class="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
    Live Network
  </div>
  ```

### Cards & Session Metrics
- All status cards must use `.premium-glass`.
- Active session metrics (e.g., *Current YouTube Session*) should show the progress bar in white, with a dark background container:
  ```html
  <div class="h-2 w-full bg-white/5 rounded-full overflow-hidden">
    <div class="h-full bg-white transition-all duration-500" style="width: 85%;"></div>
  </div>
  ```

### Buttons
- **Primary Call to Action**: Pure solid white button with black text.
  - CSS: `background-color: #ffffff; color: #000000; font-weight: 900; letter-spacing: 0.1em; text-transform: uppercase; border-radius: 12px;`
  - Interaction: Subtly scale up on hover (`transform: scale(1.03)`) and depress slightly on click (`transform: scale(0.97)`), utilizing smooth cubic-bezier transitions.
- **Secondary Actions**: Translucent grey/white border buttons.
  - CSS: `background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); color: #ffffff;`

---

## 5. Micro-Animations

- **Hover Transitions**: Set transition durations of `300ms` or `500ms` with ease transitions:
  - Transition timing: `transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);`
- **Dynamic Glows**: Background ambient blobs should gently fade or pulse using low-frequency animations (`animation: glow 6s ease-in-out infinite`).
