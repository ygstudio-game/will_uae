import * as fs from "fs";
import * as path from "path";

const filePath = path.join(process.cwd(), "components/owa-wizard/SectionA_Details.tsx");
const content = fs.readFileSync(filePath, "utf-8");

// Check 1: Step 1 must have compliance mention
if (!content.includes("Court Compliance") || !content.includes("statutory requirements")) {
  console.error("FAIL: SectionA_Details does not mention Court Compliance statutory requirements in Step 1");
  process.exit(1);
}

// Check 2: Autofilled from Document badge must not exist for address
if (content.includes("autofilledFields.address")) {
  console.error("FAIL: SectionA_Details still contains autofilledFields.address badge");
  process.exit(1);
}

// Check 3: Address input placeholder should prompt user clearly
if (!content.includes("Enter your current residential address in the UAE")) {
  console.error("FAIL: Address input placeholder missing instruction");
  process.exit(1);
}

console.log("PASS: Section A manual address and compliance copy verified");
