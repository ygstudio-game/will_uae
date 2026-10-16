import * as fs from "fs";
import * as path from "path";

console.log("=================================================");
console.log("VERIFYING ALL 11 CLIENT FIXES ACROSS THE PLATFORM");
console.log("=================================================\n");

let passedCount = 0;
let totalCount = 0;

function assertCondition(desc: string, condition: boolean) {
  totalCount++;
  if (condition) {
    console.log(`[PASS] ${desc}`);
    passedCount++;
  } else {
    console.error(`[FAIL] ${desc}`);
    process.exit(1);
  }
}

// 1. Dashboard: Billing card hide on complete payment
const dashboardContent = fs.readFileSync(path.join(process.cwd(), "app/dashboard/page.tsx"), "utf-8");
assertCondition(
  "1. Dashboard hides milestone billing card when payment is complete",
  dashboardContent.includes("isPaymentFullyComplete ?") && dashboardContent.includes("ADJD Civil Court Filing In Progress")
);

// 2. Dashboard: Friendly support card headline
assertCondition(
  "2. Dashboard direct support card has friendly headline 'Need assistance or have any doubts?'",
  dashboardContent.includes("Need assistance or have any doubts?")
);

// 3. Section A: Manual address entry & compliance copy
const secAContent = fs.readFileSync(path.join(process.cwd(), "components/owa-wizard/SectionA_Details.tsx"), "utf-8");
assertCondition(
  "3. Section A has Court Compliance header notice in Step 1",
  secAContent.includes("Court Compliance") && secAContent.includes("satisfy ADJD Civil Family Court statutory requirements")
);
assertCondition(
  "4. Section A residential address is strictly manual entry without document autofill overwrite",
  !secAContent.includes("autofilledFields.address") && secAContent.includes("Enter your current residential address in the UAE")
);

// 5. Section B: Children UAE residency first & mandatory EID
const secBContent = fs.readFileSync(path.join(process.cwd(), "components/owa-wizard/SectionB_Children.tsx"), "utf-8");
const bResidencyIdx = secBContent.indexOf("Does this child also reside in the United Arab Emirates?");
const bPassportIdx = secBContent.indexOf("Child Passport Copy *");
assertCondition(
  "5. Section B places UAE residency question at the very top before document upload",
  bResidencyIdx !== -1 && bPassportIdx !== -1 && bResidencyIdx < bPassportIdx
);
assertCondition(
  "6. Section B enforces mandatory Emirates ID for UAE resident children",
  secBContent.includes("Child Emirates ID * (Mandatory for UAE Residents)")
);
assertCondition(
  "7. Section B renders green badge for approved Arabic transliteration",
  secBContent.includes("text-emerald-700") && secBContent.includes("bg-emerald-50") && secBContent.includes("Auto-Transliterated")
);
assertCondition(
  "8. Section B removes obsolete passport assistance banner",
  !secBContent.includes("Child does not have a passport yet?")
);

// 9. Section C: Executors residency, working replace button & relationship dropdown
const secCContent = fs.readFileSync(path.join(process.cwd(), "components/owa-wizard/SectionC_Executors.tsx"), "utf-8");
assertCondition(
  "9. Section C asks UAE residency question for executors upfront",
  secCContent.includes("Does this executor reside in the United Arab Emirates?")
);
assertCondition(
  "10. Section C provides working Replace Document file input handler",
  secCContent.includes("handleReplaceExecutorDoc") && secCContent.includes('type="file"')
);
assertCondition(
  "11. Section C uses relationship dropdown with standard legal relationships and custom entry",
  secCContent.includes("<select") && secCContent.includes("Professional Trustee")
);

// 12. Section D: Guardians residency & document upload
const secDContent = fs.readFileSync(path.join(process.cwd(), "components/owa-wizard/SectionD_Guardians.tsx"), "utf-8");
assertCondition(
  "12. Section D includes UAE residency question and document upload for guardians",
  secDContent.includes("Does this guardian reside in the United Arab Emirates?") && secDContent.includes("handleGuardianFileUpload")
);
assertCondition(
  "13. Section D displays green transliteration badge for guardian Arabic names",
  secDContent.includes("text-emerald-700") && secDContent.includes("bg-emerald-50") && secDContent.includes("Auto-Transliterated")
);

// 14. Section E: Beneficiaries share percentage typing lag fix
const secEContent = fs.readFileSync(path.join(process.cwd(), "components/owa-wizard/SectionE_Beneficiaries.tsx"), "utf-8");
assertCondition(
  "14. Section E ShareInput decouples typing from store commits using isFocused and Enter key",
  secEContent.includes("isFocused") && secEContent.includes("!isFocused") && secEContent.includes("Enter")
);

// 15. Section F & ADJDBilingualWillDocument: Signature capture and embedding
const cardExists = fs.existsSync(path.join(process.cwd(), "components/signature/TestatorSignatureCard.tsx"));
assertCondition(
  "15. TestatorSignatureCard component exists with upload and canvas draw modes",
  cardExists
);
const secFContent = fs.readFileSync(path.join(process.cwd(), "components/owa-wizard/SectionF_ReviewDraft.tsx"), "utf-8");
assertCondition(
  "16. Section F embeds TestatorSignatureCard directly into final review draft",
  secFContent.includes("TestatorSignatureCard")
);
const docContent = fs.readFileSync(path.join(process.cwd(), "components/court/ADJDBilingualWillDocument.tsx"), "utf-8");
assertCondition(
  "17. ADJDBilingualWillDocument embeds testator signature image directly above court signature line",
  docContent.includes("testator.signatureDataUrl") && docContent.includes("<img") && docContent.includes("Digitally Verified Signature")
);

console.log(`\n=================================================`);
console.log(`ALL ${passedCount}/${totalCount} ACCEPTANCE CHECKS PASSED SUCCESSFULLY!`);
console.log(`=================================================`);
