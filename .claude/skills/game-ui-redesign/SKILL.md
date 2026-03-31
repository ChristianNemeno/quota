---
name: game-ui-redesign
description: Redesign the Quota Next.js app frontend using the game UI assets in /public/gui/ and /public/ui-game-assets/. Applies a visual novel / RPG aesthetic — textbox panels for quotes, namebox for authors, game-style buttons, and icon sets — with real, working CSS and React code.
---

You are redesigning the **Quota** Next.js app (`/home/christian/projects/quota/`) to use the game UI PNG assets already bundled in the project. Your job is to produce **working, production-grade code** that feels like a beautiful visual novel or JRPG interface running in a browser — not a cosplay of one.

---

## Asset Inventory

All assets are served as static files under Next.js `/public/`. Reference them in CSS/JSX as root-relative paths.

### Visual Novel UI — `/public/gui/`

| Asset | Path | Use for |
|-------|------|---------|
| Main textbox panel | `/gui/textbox.png` | Quote card body background |
| Author namebox | `/gui/namebox.png` | Author name badge overlaid on textbox |
| Dialogue bubble | `/gui/bubble.png` | Alternative quote card style |
| Thought bubble | `/gui/thoughtbubble.png` | Pulled/featured quote callouts |
| Generic frame | `/gui/frame.png` | Section containers, modal borders |
| Notification | `/gui/notify.png` | Toast/alert banners |
| Click-to-continue | `/gui/ctc.png` | Animated "read more" / scroll hint |
| Skip indicator | `/gui/skip.png` | Pagination next arrow |
| Main menu bg | `/gui/main_menu.png` | Hero / home page background panel |

**Buttons** (idle + hover pairs, use CSS background swap):

| Button type | Idle | Hover |
|-------------|------|-------|
| Standard | `/gui/button/idle_background.png` | `/gui/button/hover_background.png` |
| Choice / option | `/gui/button/choice_idle_background.png` | `/gui/button/choice_hover_background.png` |
| Slot / inventory | `/gui/button/slot_idle_background.png` | `/gui/button/slot_hover_background.png` |
| Quick menu | `/gui/button/quick_idle_background.png` | `/gui/button/quick_hover_background.png` |

**Frame borders** (decorative edge strips for panels):
- `/gui/bar/top.png`, `/gui/bar/bottom.png`, `/gui/bar/left.png`, `/gui/bar/right.png`

**Responsive (phone) variants** mirror every asset under `/gui/phone/` — use these inside `@media (max-width: 640px)`.

### Game Icon Pack — `/public/ui-game-assets/`

| Asset | Path | Use for |
|-------|------|---------|
| Buttons | `/ui-game-assets/Button01.png`, `Button02.png` | CTA buttons, admin actions |
| Arrow | `/ui-game-assets/Arrow01.png` | Navigation, pagination |
| Single cell | `/ui-game-assets/Cell01.png` | Tag badges, stat chips |
| Grid cells | `/ui-game-assets/Cells01.png` | Tag filter grid bg |
| Icons 01–23 | `/ui-game-assets/Icon01.png` … `Icon23.png` | Nav icons, favorite star, theme toggle, search |

---

## Aesthetic Direction

**Visual Novel meets Literary Café** — the app should feel like a beautifully crafted indie visual novel where every quote is a story beat. Think warm parchment tones, subtle vignettes, and panels that have weight and presence. The game UI assets provide structure; typography and color provide soul.

- **Palette**: Deep ink `#1a1410`, warm parchment `#f5ead8`, aged gold `#c9a84c`, faded rose `#c07070` — all as CSS variables
- **Typography**: Cormorant Garamond for quote text (already loaded), DM Sans for UI chrome (already loaded)
- **Motion**: Textbox panels fade+slide in on mount (like a VN dialogue reveal). Buttons show idle→hover PNG swap with a 80ms transition. The `ctc.png` bobs up and down on loop.
- **Dark/light**: Parchment light theme (default), deep ink dark theme

---

## Core CSS Techniques

### 1 — PNG Panel Background (stretch to fill)
```css
.game-textbox {
  background-image: url('/gui/textbox.png');
  background-size: 100% 100%;   /* stretch — works well for VN panels */
  background-repeat: no-repeat;
  /* remove all border/bg-color from Tailwind — the PNG IS the border */
}
```

### 2 — Button Idle/Hover PNG Swap
```css
.game-btn {
  background-image: url('/gui/button/idle_background.png');
  background-size: 100% 100%;
  background-repeat: no-repeat;
  border: none;
  transition: background-image 80ms, transform 80ms;
}
.game-btn:hover {
  background-image: url('/gui/button/hover_background.png');
  transform: translateY(-1px);
}
/* Preload hover image to prevent flicker */
.game-btn::after {
  content: '';
  background-image: url('/gui/button/hover_background.png');
  display: none;
}
```

### 3 — Namebox Overlay on Textbox
```tsx
<article className="game-textbox relative px-10 py-8 pt-12">
  {/* Namebox sits above the top-left of the textbox */}
  <div
    className="absolute -top-5 left-8 px-6 py-1 text-sm font-semibold"
    style={{ backgroundImage: "url('/gui/namebox.png')", backgroundSize: '100% 100%' }}
  >
    {quote.author}
  </div>
  <blockquote className="font-serif italic text-xl leading-9">
    {quote.text}
  </blockquote>
</article>
```

### 4 — PNG Icon as `<img>` with sizing
```tsx
<img src="/ui-game-assets/Icon01.png" alt="favorite" className="h-8 w-8 object-contain" />
```

Apply `filter: brightness(0) invert(1)` in CSS for white tinting, or `hue-rotate` + `saturate` for color variants.

### 5 — Animated CTC (click-to-continue) indicator
```css
@keyframes ctc-bob {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-6px); }
}
.ctc-indicator {
  animation: ctc-bob 1.4s ease-in-out infinite;
  background-image: url('/gui/ctc.png');
  background-size: contain;
  background-repeat: no-repeat;
}
```

### 6 — Responsive: swap to phone assets
```css
@media (max-width: 640px) {
  .game-textbox {
    background-image: url('/gui/phone/textbox.png');
  }
  .game-btn {
    background-image: url('/gui/phone/button/idle_background.png');
  }
}
```

---

## Component Mapping (Quota App)

| Component | File | Asset(s) to apply |
|-----------|------|--------------------|
| QuoteCard | `components/QuoteCard.tsx` | `textbox.png` as panel bg; `namebox.png` for author |
| FavoriteButton | `components/FavoriteButton.tsx` | `Icon*.png` for heart icon (replace ♥ text) |
| TagBadge | `components/TagBadge.tsx` | `Cell01.png` as badge bg |
| Navbar buttons | `components/Navbar.tsx` | `button/idle_background.png` + hover swap |
| Pagination links | `app/quotes/page.tsx` | `Arrow01.png` for prev/next; `button/choice_*.png` for page buttons |
| Home hero | `app/page.tsx` | `main_menu.png` or `frame.png` as section backdrop |
| Empty state | any page | `emptyslot_text.png` as illustrated empty state |
| Notifications/toasts | any | `notify.png` |

---

## Implementation Rules

1. **Never use plain CSS `border` or `background-color` on elements that have a game PNG background** — the PNG provides the visual border. Remove conflicting Tailwind utilities like `border`, `rounded-*`, `bg-white`, `shadow-*` from those elements.
2. **Padding must account for the PNG's internal chrome** — VN textboxes typically have built-in border art; add generous padding (e.g. `px-10 py-8`) so text doesn't overlap the decorative edges.
3. **Keep Tailwind for layout** — flexbox, grid, spacing, and responsive utilities still work great alongside PNG backgrounds.
4. **Preload hover states** to prevent flicker (use the `::after` trick above or a hidden `<img>` preload).
5. **All asset paths are root-relative** from the Next.js `public/` folder (e.g. `/gui/textbox.png`, not `./public/gui/textbox.png`).
6. **Test dark mode** — add `dark:` class variants or CSS variable switches where the PNG tint or surrounding color should shift.

---

## Execution Checklist

Before writing any code, scan the actual asset images to decide which ones suit the component being redesigned. When the user hasn't specified which components to touch, start with `QuoteCard` (highest visual impact), then `Navbar`, then pagination. Always write complete, working component code — never pseudocode or partial snippets.
