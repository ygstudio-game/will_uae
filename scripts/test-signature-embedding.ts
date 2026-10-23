import * as fs from "fs";
import * as path from "path";

const cardPath = path.join(process.cwd(), "components/signature/TestatorSignatureCard.tsx");
if (!fs.existsSync(cardPath)) {
  console.error("FAIL: components/signature/TestatorSignatureCard.tsx does not exist");
  process.exit(1);
}

const cardContent = fs.readFileSync(cardPath, "utf-8");
if (!cardContent.includes("Upload") || !cardContent.includes("Testator Digital Signature")) {
  console.error("FAIL: TestatorSignatureCard must support signature upload");
  process.exit(1);
}

const reviewPath = path.join(process.cwd(), "components/owa-wizard/SectionF_ReviewDraft.tsx");
const reviewContent = fs.readFileSync(reviewPath, "utf-8");
if (!reviewContent.includes("TestatorSignatureCard")) {
  console.error("FAIL: SectionF_ReviewDraft does not render TestatorSignatureCard");
  process.exit(1);
}

const docPath = path.join(process.cwd(), "components/court/ADJDBilingualWillDocument.tsx");
const docContent = fs.readFileSync(docPath, "utf-8");
if (!docContent.includes("testator.signatureDataUrl") || !docContent.includes("<img")) {
  console.error("FAIL: ADJDBilingualWillDocument does not render testator.signatureDataUrl image");
  process.exit(1);
}

console.log("PASS: Signature card, Section F integration, and court document embedding verified");
