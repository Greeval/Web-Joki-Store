# Design System: Greeval Store (Vibrant Light & Glassmorphism)

This document defines the strict design language for Greeval Store. Any future CSS modifications must strictly adhere to these design tokens and principles to ensure a premium, modern, and vibrant light aesthetic and avoid generic AI design patterns ("AI slop").

## 1. Design Tokens

### Typography
- **Primary Font**: `Plus Jakarta Sans`, sans-serif (imported from Google Fonts).
- **Fallback**: System-ui, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Roboto`.
- **Weights**: `400` (Regular), `500` (Medium), `600` (SemiBold), `700` (Bold), `800` (ExtraBold).

### Color Palette (Slate, Indigo & Amber)
- **Backgrounds**:
  - `bg-primary`: `#f8fafc` (Slate 50 - clean, ultra-light off-white).
  - `bg-secondary`: `#ffffff` (Pure white for card backgrounds and container panels).
  - `bg-elevated`: `#f1f5f9` (Slate 100 for hovered items, subtle depth).
- **Accents**:
  - `accent-primary`: `#4f46e5` (Indigo 600 - premium gaming accent).
  - `accent-primary-hover`: `#4338ca` (Indigo 700 for button states).
  - `accent-secondary`: `#f59e0b` (Amber 500 - rating/popular tags).
  - `accent-secondary-hover`: `#d97706` (Amber 600).
- **Text Color Hierarchy**:
  - `text-primary`: `#0f172a` (Slate 900 - high contrast, strong readability).
  - `text-secondary`: `#475569` (Slate 600 - clean body text).
  - `text-muted`: `#94a3b8` (Slate 400 - secondary info, inactive elements).
- **Borders & Separators**:
  - `border-subtle`: `rgba(0, 0, 0, 0.08)` (Thin solid border for standard state).
  - `border-active`: `rgba(79, 70, 229, 0.3)` (Indigo tint for active/focused elements).

### Border Radius (Smooth & Friendly)
- `radius-sm`: `8px` (Small buttons, checkmarks).
- `radius-md`: `12px` (Inputs, standard buttons, badges).
- `radius-lg`: `16px` (Card components, dropdown menus, modals).
- `radius-xl`: `24px` (Large display panels).
- `radius-full`: `9999px` (Pill badges, status indicators).

### Transition & Animations
- `transition-fast`: `150ms cubic-bezier(0.4, 0, 0.2, 1)`
- `transition-normal`: `250ms cubic-bezier(0.4, 0, 0.2, 1)`

---

## 2. UI/UX Rules & Patterns

1. **Vibrant & Glassmorphic Shadows**: Use soft, large spread shadows (`box-shadow: 0 10px 40px -10px rgba(0,0,0,0.08)`) to lift elements. Combine with subtle backdrop blurs where appropriate.
2. **NO Generic Flat Design**: Avoid flat, sterile whites. Use subtle off-whites (`#f8fafc`) for backgrounds and pure white for elevated cards to create natural depth.
3. **High Contrast Text**: Always maintain WCAG contrast. Use deep slate (`#0f172a`) rather than pure black for a softer, more modern feel.
4. **Clean Spacing**: Card items must have clean, generous padding (`24px` for headers/sections, `16px` for small list cards). Never cramp items close to borders.
5. **No Dashed/Dotted Borders**: Use solid, semi-transparent black lines (`rgba(0,0,0,0.08)`) for all containers, inputs, and tab segments.
6. **Dynamic Buttons**: Primary buttons must be solid Indigo (`accent-primary`) with solid white text. They should slightly scale up (`scale(1.02)`) or lift on hover, incorporating vibrant drop shadows.
