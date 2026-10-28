export type PrePaymentPackageType = "INDIVIDUAL" | "COUPLES";

export type PrePaymentPaymentStatus = "unpaid" | "pending" | "paid" | "failed";

export type PrePaymentInclusionTab = "questionnaire" | "bilingual" | "support" | "court";

export type PrePaymentModalType = "sample" | "help" | "terms" | "privacy" | "resume" | null;

export interface PrePaymentApplicant {
  age21: boolean | null;
  nonUae: boolean | null;
  uaeAssets: boolean | null;
  married: boolean | null;
  children: boolean | null;
}

export interface PrePaymentJourneyState {
  step: 1 | 2 | 3 | 4; // 1: Choose, 2: About, 3: Review, 4: Payment
  packageType: PrePaymentPackageType;
  primaryApplicant: PrePaymentApplicant;
  partnerApplicant: PrePaymentApplicant;
  fullName: string;
  email: string;
  phoneNumber: string;
  termsAccepted: boolean;
  paymentStatus: PrePaymentPaymentStatus;
  activeInclusionTab: PrePaymentInclusionTab;
  activeModal: PrePaymentModalType;
  isEmailVerified: boolean;
  errors: string[];
}

export const DEFAULT_APPLICANT: PrePaymentApplicant = {
  age21: null,
  nonUae: null,
  uaeAssets: null,
  married: null,
  children: null,
};

export const DEFAULT_PREPAYMENT_STATE: PrePaymentJourneyState = {
  step: 1,
  packageType: "INDIVIDUAL",
  primaryApplicant: { ...DEFAULT_APPLICANT },
  partnerApplicant: { ...DEFAULT_APPLICANT },
  fullName: "",
  email: "",
  phoneNumber: "",
  termsAccepted: false,
  paymentStatus: "unpaid",
  activeInclusionTab: "questionnaire",
  activeModal: null,
  isEmailVerified: false,
  errors: [],
};
