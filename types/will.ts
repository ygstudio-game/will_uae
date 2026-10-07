export type WillType = "INDIVIDUAL" | "MIRROR";

export type PartyRole =
  | "PRIMARY_EXECUTOR"
  | "SUBSTITUTE_EXECUTOR"
  | "FURTHER_EXECUTOR"
  | "PRIMARY_BENEFICIARY"
  | "SUBSTITUTE_BENEFICIARY"
  | "PERMANENT_GUARDIAN"
  | "SUBSTITUTE_PERMANENT_GUARDIAN"
  | "TEMPORARY_GUARDIAN"
  | "INTERIM_GUARDIAN"
  | "SUBSTITUTE_INTERIM_GUARDIAN";

export interface Party {
  id: string;
  role: PartyRole;
  fullName: string;
  arabicName: string;
  isArabicApproved: boolean;
  dob?: string;
  nationality?: string;
  passportNumber?: string;
  emiratesId?: string;
  isUaeResident: boolean;
  address?: string;
  email?: string;
  phone?: string;
  relationship?: string;
  sharePercentage?: number; // 0 to 100 for beneficiaries
}

export interface Child {
  id: string;
  fullName: string;
  arabicName: string;
  dob: string;
  nationality: string;
  passportNumber: string;
}

export interface Asset {
  id: string;
  assetType: "Immovable Property" | "Bank Account" | "Vehicle" | "Shares" | "Other";
  description: string;
  emirate?: string;
  titleDeedNumber?: string;
  documentUrl?: string;
}

export interface UploadedDoc {
  id: string;
  type: "PASSPORT" | "EMIRATES_ID" | "UTILITY_BILL" | "VISA" | "TITLE_DEED";
  fileName: string;
  fileSize: number;
  extracted: boolean;
  confidence?: number;
}

export interface TestatorDetails {
  fullName: string;
  arabicName: string;
  isArabicApproved: boolean;
  dob: string;
  nationality: string;
  passportNumber: string;
  emiratesId: string;
  isUaeResident: boolean;
  residentialAddress: string;
  emailAddress: string;
  contactNumber: string;
  domicileCountry: string;
  hasChildren?: boolean;
  hasTitledAssets?: boolean;
}

export interface StatutoryConfirmations {
  declaration: boolean;
  debts: boolean;
  wishes: boolean;
  jurisdiction: boolean;
  insurance: boolean;
  powers: boolean;
  execution: boolean;
}

export interface WizardStepMeta {
  step: number;
  name: string;
  title: string;
  romanNumeral?: string;
  sectionCode?: string;
}

export const WIZARD_STEPS: WizardStepMeta[] = [
  { step: 1, name: "Documents", title: "Identity Documents & Auto-Extraction" },
  { step: 2, name: "Your Details", title: "Testator Identification & Address" },
  { step: 3, name: "Declaration", title: "Section ONE: Statutory Declaration", romanNumeral: "I", sectionCode: "Section ONE" },
  { step: 4, name: "Executors", title: "Section TWO: Appointment of Executors & Trustees", romanNumeral: "II", sectionCode: "Section TWO" },
  { step: 5, name: "Debts", title: "Section THREE: Payment of Debts & Funeral Expenses", romanNumeral: "III", sectionCode: "Section THREE" },
  { step: 6, name: "Wishes", title: "Section FOUR: Letter of Wishes", romanNumeral: "IV", sectionCode: "Section FOUR" },
  { step: 7, name: "Jurisdiction", title: "Section FIVE: UAE Civil Court Jurisdiction", romanNumeral: "V", sectionCode: "Section FIVE" },
  { step: 8, name: "Insurance", title: "Section SIX: Insurance Proceeds", romanNumeral: "VI", sectionCode: "Section SIX" },
  { step: 9, name: "Beneficiaries", title: "Section SEVEN: Distribution of Estate", romanNumeral: "VII", sectionCode: "Section SEVEN" },
  { step: 10, name: "Property", title: "Section SEVEN (e): Specific UAE Titled Assets", romanNumeral: "VII", sectionCode: "Section SEVEN (e)" },
  { step: 11, name: "Minors", title: "Section SEVEN (c & d): Beneficiaries Under 21", romanNumeral: "VII", sectionCode: "Section SEVEN (c, d)" },
  { step: 12, name: "Powers", title: "Section EIGHT: Powers of Executors & Trustees", romanNumeral: "VIII", sectionCode: "Section EIGHT" },
  { step: 13, name: "Guardianship", title: "Section NINTH: Guardianship Appointments", romanNumeral: "IX", sectionCode: "Section NINTH" },
  { step: 14, name: "Execution", title: "Execution & Attestation Clause" },
  { step: 15, name: "Review", title: "Pre-Flight Review & Arabic Name Verification" },
  { step: 16, name: "Generate", title: "Generate Court-Ready Bilingual Will" },
];
