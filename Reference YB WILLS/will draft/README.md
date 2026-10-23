# ADJD Last Will – exact PDF replica (Next.js)

Copy into your project:
- `components/adjd/*`  -> `components/adjd/` (same names as before; props unchanged)
- `public/adjd/*`      -> `public/adjd/`  (header.png, skyline.png, footer-contact.png – cut from the official PDF)

Usage is unchanged: `<ADJDBilingualWillDocument will={...} testator={...} assignments={...} />`
Print / Save-as-PDF: `window.print()` (A4, zero margin, "Background graphics" is forced on).
