# CLAUDE.md — Agent Guidelines & Repository Architecture
## Project: UAE Will Preparation Platform (ADJD Non-Muslim Will)

This file provides context, commands, design rules, and technical standards for Claude and coding assistants working on this codebase.

---

## 1. Project Overview & Legal Context
- **Jurisdiction**: Abu Dhabi Civil Family Court (Abu Dhabi Judicial Department - ADJD).
- **Core Document**: Non-Muslim Last Will & Testament (`ADJD-NM1221-06-01`).
- **Core Feature**: 16-step guided wizard, automated identity document extraction via LLM Vision, phonetic Arabic name transliteration approval, and dual-column court-ready bilingual PDF/HTML generation.
- **Reference Assets**: 18 high-resolution screenshots in [`Reference YB WILLS/SS/`](./Reference%20YB%20WILLS/SS/).

---

## 2. Common Commands

### Development & Build
```bash
# Start local development server
npm run dev

# Production build & lint check
npm run build
npm run lint

# Database operations (Prisma + Neon Serverless Postgres)
npx prisma generate
npx prisma db push
npx prisma studio
```

---

## 3. Tech Stack & Architectural Conventions
- **Framework**: Next.js 14+/15 (App Router, Server Actions, Route Handlers).
- **Language**: TypeScript (Strict mode enabled, no `any`).
- **Styling**: Tailwind CSS with custom design tokens (see Section 4).
- **Component Pattern**:
  - Favor **React Server Components (RSC)** for initial page loads, data fetching, and static legal text.
  - Use `"use client"` exclusively for interactive components: stepper controls, file upload drag-and-drop, review modals, and print preview toggles.
- **Form State**: Zustand or React Hook Form with Zod validation.
- **Database**: Neon Serverless PostgreSQL with Prisma ORM (configured with connection pooling for serverless environments).

---

## 4. Design System & Tokens (The Impeccable Standard)
Follow these exact visual tokens extracted from the reference screenshots:

### Color Palette
- **Background / Canvas**: `#FBF9F5` (Warm Alabaster / Ivory Stone)
- **Obsidian Navy**: `#0B1528` (Navbar, hero backgrounds, primary action buttons)
- **Court Bronze**: `#A37E44` / `#B38D48` (Progress bars, eyebrow titles, Roman numerals, primary CTAs)
- **Card Background**: `#FFFFFF`
- **Border / Dividers**: `#E5E0D8`
- **Legal Table Headers**: `#C5A880` / `#D4B896`
- **Muted Text**: `#6B7280` / `#4B5563`
- **Approved / Verified**: `#047857` (Emerald green checkmarks)
- **Destructive**: `#991B1B` (`Delete draft` text link)

### Typography
- **Headings**: Serif font (`Playfair Display`, `Cormorant Garamond`, or `Libre Baskerville`).
- **Body & Controls**: Clean Sans font (`Inter`, `Plus Jakarta Sans`).
- **Arabic Script**: Classical Naskh (`Amiri` or `Noto Naskh Arabic`).

---

## 5. Critical Engineering Rules

1. **Never Modify Official Statutory Legal Wording**:
   - The wording in Sections One through Nine, Execution, and Attestation must faithfully match `ADJD- Non-Muslim Will Template.pdf`.
2. **Strict Bilingual Synchronization**:
   - Left column: English (LTR).
   - Right column: Arabic (RTL, `dir="rtl"`).
   - Both columns must align row-for-row in all previews and printed documents.
3. **Phonetic Transliteration (NOT Translation)**:
   - Foreign names must be phonetically transliterated into Arabic letters (e.g. *"Emily Rose Smith"* ➔ *"إيميلي روز سميث"*).
   - Never translate names semantically.
   - Users must review and approve transliterations on Step 15 before document generation.
4. **Zero-Cost Serverless Requirement**:
   - Keep the database schema and queries optimized for Neon Serverless Postgres free tier (scale-to-zero compute).
5. **Print & PDF Fidelity**:
   - The bilingual output must look identical to screenshot `16-generated-will-bilingual.png` with proper `@media print` page breaks, court header logos, and `ADJD-NM1221-06-01` footers.
