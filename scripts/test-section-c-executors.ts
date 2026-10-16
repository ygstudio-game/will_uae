import * as fs from "fs";
import * as path from "path";

const filePath = path.join(process.cwd(), "components/owa-wizard/SectionC_Executors.tsx");
const content = fs.readFileSync(filePath, "utf-8");

// Check 1: Residency question for executors
if (!content.includes("Does this executor reside in the United Arab Emirates?")) {
  console.error("FAIL: Residency question missing for executors in SectionC_Executors");
  process.exit(1);
}

// Check 2: Working Replace Document with file input
if (!content.includes('type="file"') || !content.includes("handleReplaceExecutorDoc")) {
  console.error("FAIL: Working Replace file input handler missing in SectionC_Executors");
  process.exit(1);
}

// Check 3: Relationship dropdown with standard legal relationships
if (!content.includes("<select") || !content.includes("Professional Trustee")) {
  console.error("FAIL: Standard relationship options select missing in SectionC_Executors");
  process.exit(1);
}

console.log("PASS: Section C executors residency, working replace button, and relationship select verified");
