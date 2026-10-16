import { createDefaultDraftApplication } from "../store/useOwaStore";
import { PersonData } from "../types/owa";

const app = createDefaultDraftApplication();
const testator: PersonData = app.persons[0];
if (!("signatureDataUrl" in testator)) {
  console.error("FAIL: signatureDataUrl property missing on default testator");
  process.exit(1);
}
console.log("PASS: signatureDataUrl property present on PersonData");
