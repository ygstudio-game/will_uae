export type PackageType = "INDIVIDUAL" | "COUPLES";

export type ApplicationStatus =
  | "IN_PROGRESS"
  | "DRAFT_READY"
  | "COURT_FEE_PENDING"
  | "AWAITING_ADMIN_VERIFICATION"
  | "UNDER_ADMIN_REVIEW"
  | "ACTION_REQUIRED"
  | "READY_FOR_SUBMISSION"
  | "SUBMITTED_TO_ADJD"
  | "REGISTRATION_COMPLETED";

export type PaymentMilestone = "INITIAL_SERVICE_FEE" | "COURT_FEE";
export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED";

export type RoleType =
  | "TESTATOR"
  | "EXECUTOR_PRIMARY"
  | "EXECUTOR_SUBSTITUTE"
  | "EXECUTOR_FURTHER"
  | "BENEFICIARY"
  | "BENEFICIARY_PRIMARY"
  | "BENEFICIARY_SUBSTITUTE"
  | "GUARDIAN_PERMANENT"
  | "GUARDIAN_SUBSTITUTE_PERM"
  | "GUARDIAN_TEMPORARY"
  | "CHILD";

export type DocumentType =
  | "PASSPORT"
  | "EMIRATES_ID"
  | "PROOF_OF_ADDRESS"
  | "TITLE_DEED"
  | "SUPPORTING_DOC";

export type TicketStatus = "OPEN" | "AWAITING_CUSTOMER" | "RESOLVED";
export type FlagSeverity = "INFO" | "WARNING" | "ERROR";

export interface AccountData {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string | null;
}

export interface PersonData {
  id: string;
  applicationId: string;
  fullName: string;
  arabicName?: string | null;
  isArabicApproved: boolean;
  dob?: string | null;
  nationality?: string | null;
  relationship?: string | null;
  passportNumber?: string | null;
  emiratesId?: string | null;
  isUaeResident: boolean;
  address?: string | null;
  email?: string | null;
  phone?: string | null;
  documents?: UploadedDocumentData[];
}

export interface UploadedDocumentData {
  id: string;
  personId: string;
  documentType: DocumentType;
  fileName: string;
  fileUrl: string;
  fileSizeBytes?: number | null;
  mimeType?: string | null;
  extractedData?: Record<string, unknown> | null;
  ocrConfidence?: number | null;
  isExpired?: boolean;
}

export interface RoleAssignmentData {
  id: string;
  willId: string;
  personId: string;
  role: RoleType;
  appointmentOrder: number;
  sharePercentage?: number | null;
  person?: PersonData;
}

export interface WillData {
  id: string;
  applicationId: string;
  willIndex: number;
  versionTag: string;
  testatorPersonId?: string | null;
  testatorPerson?: PersonData | null;
  domicileCountry: string;
  declarationConfirmed: boolean;
  hasChildrenUnder18: boolean;
  isDraftConfirmed: boolean;
  confirmedAt?: string | null;
  roleAssignments: RoleAssignmentData[];
}

export interface PaymentData {
  id: string;
  applicationId: string;
  milestone: PaymentMilestone;
  amountAed: number;
  status: PaymentStatus;
  transactionRef: string;
  receiptUrl?: string | null;
  createdAt: string;
}

export interface TicketReplyData {
  id: string;
  ticketId: string;
  senderRole: "CUSTOMER" | "ADMIN";
  senderName: string;
  message: string;
  fileUrl?: string | null;
  createdAt: string;
}

export interface TicketData {
  id: string;
  applicationId: string;
  ticketNumber: number;
  subject: string;
  status: TicketStatus;
  replies: TicketReplyData[];
  createdAt: string;
  updatedAt: string;
}

export interface ReviewFlagData {
  id: string;
  applicationId: string;
  fieldPath: string;
  severity: FlagSeverity;
  message: string;
  isResolved: boolean;
  resolvedBy?: string | null;
  resolutionNotes?: string | null;
  createdAt: string;
}

export interface ApplicationData {
  id: string;
  accountId: string;
  account?: AccountData;
  packageType: PackageType;
  status: ApplicationStatus;
  qualTestatorAge21: boolean;
  qualNonUaeNational: boolean;
  qualUaeAssets: boolean;
  qualMarried: boolean;
  qualChildrenUnder18: boolean;
  qualPartnerAge21?: boolean | null;
  qualPartnerNonUae?: boolean | null;
  qualPartnerAssets?: boolean | null;
  qualPartnerMarried?: boolean | null;
  qualPartnerChildrenUnder18?: boolean | null;
  wills: WillData[];
  persons: PersonData[];
  payments: PaymentData[];
  tickets: TicketData[];
  reviewFlags: ReviewFlagData[];
  createdAt: string;
  updatedAt: string;
}

export const OWA_SECTIONS = [
  { id: "details", label: "A. Your Details", letter: "A" },
  { id: "children", label: "B. Children", letter: "B" },
  { id: "executors", label: "C. Executors", letter: "C" },
  { id: "guardians", label: "D. Guardians", letter: "D" },
  { id: "beneficiaries", label: "E. Beneficiaries", letter: "E" },
  { id: "review", label: "F. Review & Draft", letter: "F" },
] as const;

export type OwaSectionId = typeof OWA_SECTIONS[number]["id"];
