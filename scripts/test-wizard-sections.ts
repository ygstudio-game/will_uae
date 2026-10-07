import { useOwaStore } from "../store/useOwaStore";
import { ApplicationData, PersonData, RoleAssignmentData, WillData } from "../types/owa";

function runValidationTests() {
  console.log("Testing 6-section questionnaire validation rules...");

  const mockTestator: PersonData = {
    id: "p-testator",
    applicationId: "app-1",
    fullName: "Arthur Conan Doyle",
    passportNumber: "GB99887766",
    isUaeResident: true,
    isArabicApproved: true,
  };

  const mockExec1: PersonData = {
    id: "p-exec1",
    applicationId: "app-1",
    fullName: "Dr. John Watson",
    passportNumber: "GB11223344",
    isUaeResident: true,
    isArabicApproved: true,
  };

  const mockBen1: PersonData = {
    id: "p-ben1",
    applicationId: "app-1",
    fullName: "Irene Adler",
    passportNumber: "GB44556677",
    isUaeResident: true,
    isArabicApproved: true,
  };

  const mockBen2: PersonData = {
    id: "p-ben2",
    applicationId: "app-1",
    fullName: "Mycroft Holmes",
    passportNumber: "GB88990011",
    isUaeResident: true,
    isArabicApproved: true,
  };

  const will: WillData = {
    id: "will-1",
    applicationId: "app-1",
    willIndex: 1,
    versionTag: "ADJD-NM0723-07-03",
    testatorPersonId: "p-testator",
    testatorPerson: mockTestator,
    domicileCountry: "United Kingdom",
    declarationConfirmed: true,
    hasChildrenUnder18: false,
    isDraftConfirmed: false,
    roleAssignments: [
      {
        id: "ra-exec",
        willId: "will-1",
        personId: "p-exec1",
        role: "EXECUTOR_PRIMARY",
        appointmentOrder: 1,
        person: mockExec1,
      },
      // 80% + 10% = 90% (INVALID)
      {
        id: "ra-ben1",
        willId: "will-1",
        personId: "p-ben1",
        role: "BENEFICIARY",
        appointmentOrder: 1,
        sharePercentage: 80,
        person: mockBen1,
      },
      {
        id: "ra-ben2",
        willId: "will-1",
        personId: "p-ben2",
        role: "BENEFICIARY",
        appointmentOrder: 2,
        sharePercentage: 10,
        person: mockBen2,
      },
    ],
  };

  const app: ApplicationData = {
    id: "app-1",
    accountId: "acc-1",
    packageType: "INDIVIDUAL",
    status: "IN_PROGRESS",
    qualTestatorAge21: true,
    qualNonUaeNational: true,
    qualUaeAssets: true,
    qualMarried: false,
    qualChildrenUnder18: false,
    wills: [will],
    persons: [mockTestator, mockExec1, mockBen1, mockBen2],
    payments: [],
    tickets: [],
    reviewFlags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  useOwaStore.getState().setApplication(app);
  useOwaStore.getState().setActiveWillIndex(1);

  // Check beneficiaries validation - should FAIL (sum is 90%)
  const isBenValidInitially = useOwaStore.getState().isSectionComplete("beneficiaries");
  if (isBenValidInitially) {
    throw new Error("Beneficiaries section erroneously marked complete with 90% share sum!");
  }
  console.log("✓ Correctly rejected 90% share sum!");

  // Fix share to exactly 100% (80% + 20%)
  will.roleAssignments[2].sharePercentage = 20;
  useOwaStore.getState().setApplication({ ...app, wills: [will] });

  const isBenValidAfterFix = useOwaStore.getState().isSectionComplete("beneficiaries");
  if (!isBenValidAfterFix) {
    throw new Error("Beneficiaries section not marked complete after fixing to 100%!");
  }
  console.log("✓ Correctly accepted 100% share sum!");

  // Check executors validation
  const isExecValid = useOwaStore.getState().isSectionComplete("executors");
  if (!isExecValid) {
    throw new Error("Executors section should be valid with Executor 1 assigned!");
  }
  console.log("✓ Correctly validated Executor 1!");

  console.log("✓ All questionnaire section validations passed!");
}

runValidationTests();
