# AGENTS.md — Guidelines for AI Coding Agents
## Project: UAE Will Preparation Platform (ADJD Non-Muslim Will)

Welcome agent. This repository contains the source code, legal specifications, and design assets for the **UAE Will Preparation Platform**, a web application enabling non-Muslim expatriates in the United Arab Emirates to prepare, verify, and generate court-ready wills for the **Abu Dhabi Judicial Department (ADJD) Civil Family Court**.

---

## 1. Ground Truth Documents & References

Before proposing any changes, writing code, or generating components, you **must** consult these foundational files:
1. **[`PROJECT_CONTEXT.md`](./PROJECT_CONTEXT.md)**: Product overview, design tokens, typography, and complete user flow.
2. **[`PRD.md`](./PRD.md)**: Full Product Requirements Document with feature specifications and the 16-step wizard mapping.
3. **[`TRD.md`](./TRD.md)**: Technical Requirements Document covering Next.js App Router, Prisma/Neon schema, OCR pipeline, and bilingual generation.
4. **[`Reference YB WILLS/SS/`](./Reference%20YB%20WILLS/SS/)**: 18 high-resolution screenshots defining the exact UI layout, colors, typography, form fields, and mobile viewports.
5. **[`Reference YB WILLS/ADJD- Non-Muslim Will Template.pdf`](./Reference%20YB%20WILLS/ADJD-%20Non-Muslim%20Will%20Template.pdf)**: Official 8-page court form (`ADJD-NM1221-06-01`).

---

## 2. Core Rules & Non-Negotiables

### ⚖️ Legal & Court Compliance
- **Statutory Court Clauses**: Never alter, summarize, or omit the official legal wording from the ADJD template (Sections One through Nine, Execution, and Attestation).
- **Bilingual Synchronization**: The generated will and live preview **must strictly maintain a side-by-side two-column layout**:
  - **Left column**: English legal text (`dir="ltr"`).
  - **Right column**: Arabic legal text (`dir="rtl"`, proper Arabic script ligatures).
- **Phonetic Transliteration (NOT Translation)**: Foreign names (e.g., *"John Michael Smith"*) must be **phonetically transliterated** into Arabic (e.g., *"جون مايكل سميث"*), **never translated** by meaning. The user must review and approve all transliterated names on Step 15 before document generation.

### 🎨 Visual Design & Craft (The Impeccable Standard)
- **Aesthetic**: Minimalist, warm, editorial legal luxury. No generic SaaS cards or loud colors.
- **Palette**:
  - Canvas: `#FBF9F5` (Warm Alabaster / Ivory Stone)
  - Obsidian Navy: `#0B1528` (Header bar, hero sections, primary action buttons)
  - Warm Bronze: `#A37E44` / `#B38D48` (Progress bars, eyebrow subtitles, Roman numeral markers, primary CTAs)
  - Card surfaces: `#FFFFFF` with borders `#E5E0D8` and subtle elevation (`shadow-sm`)
  - Accent Header Band: `#C5A880` / `#D4B896` (Legal template table headers)
- **Typography**:
  - Headings: Serif (`Playfair Display`, `Cormorant Garamond`, or `Libre Baskerville`)
  - Body & Form Controls: Sans-serif (`Inter` or `Plus Jakarta Sans`)
  - Arabic Script: Classical Calligraphic (`Amiri` or `Noto Naskh Arabic`)
- **No Empty Placeholders**: When building pages, use rich, realistic legal sample data directly from the reference screenshots (e.g., *John Michael Smith*, *David Alan Whitfield*, *Emily Rose Smith*).

### 💻 Technology & Architecture Constraints
- **Framework**: Next.js 14+ / 15 (App Router, Server Actions, Route Handlers, TypeScript in strict mode).
- **Styling**: Tailwind CSS with custom tokens matching `PROJECT_CONTEXT.md`. Avoid arbitrary ad-hoc classes when design tokens exist.
- **Database**:
  - **Neon Serverless PostgreSQL** (or MongoDB Atlas M0).
  - Must remain on the **$0 free tier with zero compute cost when idle**.
  - All relational entities (`Testator`, `Executors`, `Beneficiaries`, `Children`, `Guardians`, `Assets`, `Documents`) must uphold relational integrity.
- **Document Reading (OCR)**: LLM Vision API (Gemini 1.5 Flash / GPT-4o-mini Vision) with user verification modal (`Source: Passport · 98%`) and privacy-first data handling.
- **Print / PDF Output**: Pixel-perfect `@media print` stylesheet matching ADJD court margins, page breaks (`page-break-after: always`), court footer references, and headers.

---

## 3. Workflow for Making Changes
1. **Understand First**: Identify which of the 16 steps, dashboard views, or document components your task affects.
2. **Consult Reference Screenshots**: Look up the matching image in `Reference YB WILLS/SS/` to inspect exact field arrangements, spacing, and microcopy.
3. **Write Type-Safe Code**: Define Zod schemas and TypeScript interfaces before building UI components.
4. **Validate Both Mobile & Desktop**: Reference screenshots `18-dashboard-mobile.png` and `19-landing-page-mobile.png` demonstrate required mobile responsiveness.
