// Client-side helper for phonetic Arabic transliteration with in-memory cache

const transliterationCache = new Map<string, string>();

export async function transliterateToName(englishName: string): Promise<string> {
  const trimmed = englishName.trim();
  if (!trimmed) return "";

  // Check cache
  const cached = transliterationCache.get(trimmed.toLowerCase());
  if (cached) return cached;

  try {
    const res = await fetch("/api/transliterate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmed }),
    });

    if (!res.ok) return "";
    const data = await res.json();
    if (data.success && data.arabicName) {
      transliterationCache.set(trimmed.toLowerCase(), data.arabicName);
      return data.arabicName;
    }
  } catch (err) {
    console.error("Transliteration helper error:", err);
  }

  return "";
}
