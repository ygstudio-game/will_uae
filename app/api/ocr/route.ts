import { NextRequest, NextResponse } from "next/server";

interface OcrExtractedData {
  fullName: string;
  arabicName: string;
  dob: string;
  nationality: string;
  passportNumber: string;
  emiratesId?: string;
  residentialAddress?: string;
  expiryDate: string;
  documentType: "PASSPORT" | "EMIRATES_ID" | "UTILITY_BILL" | "UNKNOWN";
  confidence: number;
  source: string;
  flags?: string[];
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const documentTypeHint = (formData.get("documentType") as string | null) || "AUTO";
    const forceMock = req.nextUrl.searchParams.get("mock") === "true";

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Optional mock mode if explicitly requested or if no API key is configured
    if (forceMock || !apiKey) {
      if (!apiKey) {
        console.warn("GEMINI_API_KEY not configured. Falling back to Daniel Carter fixture.");
      }
      return NextResponse.json({
        success: true,
        data: {
          fullName: "Daniel Michael Carter",
          arabicName: "دانيال مايكل كارتر",
          dob: "1984-06-15",
          nationality: "British",
          passportNumber: "GB12345678",
          emiratesId: "784-1984-1234567-1",
          residentialAddress: "Villa 14, Saadiyat Beach Residences, Abu Dhabi, UAE",
          expiryDate: "2031-08-10",
          documentType: documentTypeHint === "EMIRATES_ID" ? "EMIRATES_ID" : "PASSPORT",
          confidence: 99,
          source: documentTypeHint === "EMIRATES_ID" ? "Emirates ID (Mock)" : "Passport Bio Page (Mock)",
          flags: [],
        },
      });
    }

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString("base64");

    // Determine MIME type
    let mimeType = file.type || "image/jpeg";
    if (mimeType === "application/octet-stream") {
      const lowerName = file.name.toLowerCase();
      if (lowerName.endsWith(".pdf")) mimeType = "application/pdf";
      else if (lowerName.endsWith(".png")) mimeType = "image/png";
      else if (lowerName.endsWith(".webp")) mimeType = "image/webp";
      else mimeType = "image/jpeg";
    }

    const prompt = `You are an expert legal document verification and OCR system for the Abu Dhabi Judicial Department (ADJD) Non-Muslim Civil Family Court Will Registry.
Analyze the attached document carefully (hint type: "${documentTypeHint}").

CRITICAL LEGAL & TRANSLITERATION RULES:
1. Full Name: Extract the exact legal English surname and given names.
2. Arabic Name:
   - If Emirates ID or UAE document: Extract the official Arabic name printed on the card exactly.
   - If Foreign Passport: Strictly provide the PHONETIC TRANSLITERATION into Arabic script (e.g. "John Michael Smith" -> "جون مايكل سميث", "David Alan Whitfield" -> "ديفيد ألان ويتفيلد"). DO NOT translate by meaning.
3. Date format: Dates must strictly be in ISO format "YYYY-MM-DD". If not visible, return "".
4. Identification Numbers:
   - For Passport: Extract the passport number accurately.
   - For Emirates ID: Extract the 15-digit ID in format "784-XXXX-XXXXXXX-X".
5. Address (if utility bill / tenancy contract): Extract full residential street/area and emirate (e.g., Abu Dhabi, Dubai).
6. Confidence: Provide an integer confidence score from 0 to 100 based on legibility, resolution, and certainty.
7. Flags: Return an array of warning strings if there are any issues (e.g., "Document expired", "Blurry image", "MRZ code mismatch", "Potential low resolution").
8. Issuing Country & Nationality:
   - For Passport: Extract nationality (e.g. "British", "Indian", "French") AND the issuing country/country of passport (e.g. "United Kingdom", "India", "France", "United States", "Canada").

Return ONLY valid JSON matching this schema:
{
  "fullName": string,
  "arabicName": string,
  "dob": string,
  "nationality": string,
  "issuingCountry": string,
  "passportNumber": string,
  "emiratesId": string,
  "residentialAddress": string,
  "expiryDate": string,
  "documentType": "PASSPORT" | "EMIRATES_ID" | "UTILITY_BILL" | "UNKNOWN",
  "confidence": number,
  "source": string,
  "flags": string[]
}`;

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`;

    const geminiRes = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType,
                  data: base64Data,
                },
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.1,
        },
      }),
    });

    if (!geminiRes.ok) {
      const errBody = await geminiRes.text();
      console.error("Gemini Vision OCR API error:", geminiRes.status, errBody);
      return NextResponse.json(
        {
          success: false,
          error: `Gemini OCR request failed (${geminiRes.status}): ${errBody}`,
        },
        { status: geminiRes.status }
      );
    }

    const geminiJson = await geminiRes.json();
    const candidateText = geminiJson.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      return NextResponse.json(
        { success: false, error: "No response text generated by Gemini Vision" },
        { status: 502 }
      );
    }

    let parsedData: OcrExtractedData;
    try {
      parsedData = JSON.parse(candidateText);
    } catch (parseErr) {
      console.error("Failed to parse Gemini output as JSON:", candidateText);
      return NextResponse.json(
        { success: false, error: "Invalid JSON returned by Vision model" },
        { status: 502 }
      );
    }

    // Set source default if empty
    if (!parsedData.source) {
      parsedData.source = file.name || "Uploaded Document";
    }

    return NextResponse.json({
      success: true,
      data: parsedData,
    });
  } catch (error: any) {
    console.error("OCR route error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to process document" },
      { status: 500 }
    );
  }
}
