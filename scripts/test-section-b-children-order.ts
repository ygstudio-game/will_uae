import * as fs from "fs";
import * as path from "path";

const filePath = path.join(process.cwd(), "components/owa-wizard/SectionB_Children.tsx");
const content = fs.readFileSync(filePath, "utf-8");

// Check 1: The residency question must appear BEFORE passport upload
const residencyIndex = content.indexOf("Does this child also reside in the United Arab Emirates?");
const passportIndex = content.indexOf("Child Passport Copy *");

if (residencyIndex === -1) {
  console.error("FAIL: Residency question missing in SectionB_Children");
  process.exit(1);
}

if (passportIndex === -1) {
  console.error("FAIL: Passport copy section missing in SectionB_Children");
  process.exit(1);
}

if (residencyIndex > passportIndex) {
  console.error("FAIL: Residency question is placed AFTER passport upload, must be BEFORE");
  process.exit(1);
}

// Check 2: Mandatory Emirates ID copy when resident
if (!content.includes("Child Emirates ID * (Mandatory for UAE Residents)") && !content.includes("Mandatory for UAE Residents")) {
  console.error("FAIL: Emirates ID is not marked mandatory for UAE residents");
  process.exit(1);
}

// Check 3: Green transliteration badge
if (!content.includes("bg-emerald-50 text-emerald-700") && !content.includes("text-emerald-700 bg-emerald-50")) {
  console.error("FAIL: Green transliteration badge missing in SectionB_Children");
  process.exit(1);
}

// Check 4: Passport assistance callout removed
if (content.includes("Child does not have a passport yet?")) {
  console.error("FAIL: Passport assistance callout is still present, must be removed");
  process.exit(1);
}

console.log("PASS: Section B children residency order, mandatory EID, and visual polish verified");
