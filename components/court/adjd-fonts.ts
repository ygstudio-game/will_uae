import { Inter, Noto_Sans_Arabic } from "next/font/google";

/**
 * Closest free match to the PDF's fonts:
 *   English  Corporate S (Light/Regular/Bold)  ->  Inter
 *   Arabic   GE SS Text (Light/Medium/Bold)    ->  Noto Sans Arabic
 * If you hold licences for the originals, load them with next/font/local and
 * keep the same CSS variable names (--aw-font-en / --aw-font-ar).
 */
export const awEn = Inter({ subsets: ["latin"], weight: ["300", "400", "700"], variable: "--aw-font-en", display: "swap" });
export const awAr = Noto_Sans_Arabic({ subsets: ["arabic"], weight: ["300", "400", "700"], variable: "--aw-font-ar", display: "swap" });
