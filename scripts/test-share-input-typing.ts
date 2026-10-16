import * as fs from "fs";
import * as path from "path";

const filePath = path.join(process.cwd(), "components/owa-wizard/SectionE_Beneficiaries.tsx");
const content = fs.readFileSync(filePath, "utf-8");

// Check 1: Must track isFocused in ShareInput
if (!content.includes("isFocused") || !content.includes("setIsFocused")) {
  console.error("FAIL: ShareInput does not track isFocused state to prevent cursor jumps");
  process.exit(1);
}

// Check 2: Must handle Enter key to commit
if (!content.includes("onKeyDown") || !content.includes("Enter")) {
  console.error("FAIL: ShareInput does not handle Enter key commit");
  process.exit(1);
}

// Check 3: Must sync from props ONLY when !isFocused
if (!content.includes("!isFocused")) {
  console.error("FAIL: ShareInput syncs from props while user is actively typing");
  process.exit(1);
}

console.log("PASS: ShareInput decoupled typing logic verified");
