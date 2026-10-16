import * as fs from "fs";
import * as path from "path";

const filePath = path.join(process.cwd(), "components/owa-wizard/SectionD_Guardians.tsx");
const content = fs.readFileSync(filePath, "utf-8");

// Check 1: Residency question for guardians
if (!content.includes("Does this guardian reside in the United Arab Emirates?") && !content.includes("Does this guardian also reside in the United Arab Emirates?")) {
  console.error("FAIL: Residency question missing for guardians in SectionD_Guardians");
  process.exit(1);
}

// Check 2: Document upload available for guardians
if (!content.includes("handleGuardianFileUpload") || !content.includes("Guardian Passport Copy")) {
  console.error("FAIL: Guardian document upload handler or card missing in SectionD_Guardians");
  process.exit(1);
}

// Check 3: Green transliteration badge
if (!content.includes("text-emerald-700 bg-emerald-50") && !content.includes("bg-emerald-50 text-emerald-700")) {
  console.error("FAIL: Green transliteration badge missing in SectionD_Guardians");
  process.exit(1);
}

console.log("PASS: Section D guardians residency intake, document upload, and green status verified");
