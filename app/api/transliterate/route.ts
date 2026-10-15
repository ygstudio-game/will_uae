import { NextRequest, NextResponse } from "next/server";

// Fallback dictionary for instant lookup of common legal names
const KNOWN_TRANSLITERATIONS: Record<string, string> = {
  "daniel": "دانيال",
  "michael": "مايكل",
  "carter": "كارتر",
  "john": "جون",
  "smith": "سميث",
  "david": "ديفيد",
  "alan": "ألان",
  "whitfield": "ويتفيلد",
  "emily": "إيميلي",
  "rose": "روز",
  "liam": "ليام",
  "emma": "إيما",
  "claire": "كلير",
  "sarah": "سارة",
  "elizabeth": "إليزابيث",
  "alexander": "ألكسندر",
  "james": "جيمس",
  "robert": "روبرت",
  "william": "ويليام",
  "oliver": "أوليفر",
  "sophie": "صوفي",
  "olivia": "أوليفيا",
};

function tryDictionaryTransliteration(name: string): string | null {
  const parts = name.trim().toLowerCase().split(/\s+/);
  const arabicParts = parts.map((part) => KNOWN_TRANSLITERATIONS[part]);
  if (arabicParts.every((p) => Boolean(p))) {
    return arabicParts.join(" ");
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
    }
    const name = (body?.name || "").trim();

    if (!name) {
      return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 });
    }

    // Check instant dictionary
    const dictMatch = tryDictionaryTransliteration(name);
    if (dictMatch) {
      return NextResponse.json({
        success: true,
        arabicName: dictMatch,
        source: "dictionary",
        confidence: 100,
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Fallback if no API key
      return NextResponse.json({
        success: true,
        arabicName: dictMatch || name,
        source: "fallback",
        confidence: 80,
      });
    }

    const prompt = `You are a certified legal translation specialist for the Abu Dhabi Judicial Department (ADJD) Non-Muslim Civil Family Court Will Registry.
Strictly provide the official PHONETIC TRANSLITERATION into classical Arabic script for this name.

CRITICAL RULES:
1. Phonetic transliteration ONLY (sound-by-sound, e.g. "Liam" -> "ليام", "Rose" -> "روز", "Brown" -> "براون").
2. NEVER translate semantic meaning (e.g. "Faith" is "فيث", NOT "إيمان").
3. Respect ADJD court spelling conventions for foreign expatriate names.

Name to transliterate: "${name}"

Return ONLY valid JSON matching:
{
  "arabicName": string,
  "confidence": number
}`;

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`;
    const geminiRes = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.1,
        },
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.warn("Gemini transliteration failed:", geminiRes.status, errText);
      return NextResponse.json({
        success: true,
        arabicName: dictMatch || name,
        source: "fallback",
        confidence: 70,
      });
    }

    const data = await geminiRes.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!resultText) {
      return NextResponse.json({
        success: true,
        arabicName: dictMatch || name,
        source: "fallback",
      });
    }

    const parsed = JSON.parse(resultText);
    return NextResponse.json({
      success: true,
      arabicName: parsed.arabicName || name,
      confidence: parsed.confidence || 95,
      source: "gemini-3.8-flash",
    });
  } catch (error: any) {
    console.error("Transliterate route error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to transliterate" },
      { status: 500 }
    );
  }
}
