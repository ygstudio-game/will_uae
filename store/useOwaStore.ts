import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  ApplicationData,
  PersonData,
  RoleAssignmentData,
  WillData,
  OwaSectionId,
  RoleType,
} from "@/types/owa";

interface OwaState {
  applicationId: string | null;
  activeWillIndex: number;
  currentSection: OwaSectionId;
  application: ApplicationData | null;
  isSaving: boolean;
  saveError: string | null;

  // Actions
  setApplicationId: (id: string | null) => void;
  setActiveWillIndex: (index: number) => void;
  setCurrentSection: (section: OwaSectionId) => void;
  setApplication: (app: ApplicationData | null) => void;
  loadApplicationFromDb: (id: string) => Promise<boolean>;
  saveCurrentSectionToDb: () => Promise<boolean>;
  
  // Person Repository
  addOrUpdatePerson: (person: Partial<PersonData>) => Promise<PersonData | null>;
  
  // Role Assignments for active will
  assignPersonToRole: (
    personId: string,
    role: RoleType,
    order?: number,
    sharePercentage?: number
  ) => void;
  removeRoleAssignment: (roleAssignmentId: string) => void;

  // Couples Copy Logic
  copyWillToPartnerWill: () => Promise<boolean>;

  // Validation
  isSectionComplete: (section: OwaSectionId) => boolean;
}

const DEFAULT_APPLICATION_ID = "draft-app-local";
const DEFAULT_WILL_ID = "draft-will-local";
const DEFAULT_TESTATOR_ID = "draft-testator-local";

export const createDefaultDraftApplication = (): ApplicationData => {
  const defaultTestator: PersonData = {
    id: DEFAULT_TESTATOR_ID,
    applicationId: DEFAULT_APPLICATION_ID,
    fullName: "Daniel Michael Carter",
    arabicName: "دانيال مايكل كارتر",
    isArabicApproved: true,
    dob: "1982-05-14",
    nationality: "British",
    relationship: "Self",
    passportNumber: "GBR12345678",
    emiratesId: "784-1982-1234567-1",
    isUaeResident: true,
    address: "Villa 14, Saadiyat Beach Residences, Abu Dhabi, UAE",
    email: "daniel.carter@example.com",
    phone: "+971 50 123 4567",
    documents: [],
  };

  const defaultWill: WillData = {
    id: DEFAULT_WILL_ID,
    applicationId: DEFAULT_APPLICATION_ID,
    willIndex: 1,
    versionTag: "ADJD-NM0723-07-03",
    testatorPersonId: DEFAULT_TESTATOR_ID,
    testatorPerson: defaultTestator,
    domicileCountry: "United Kingdom",
    declarationConfirmed: true,
    hasChildrenUnder18: false,
    isDraftConfirmed: false,
    roleAssignments: [],
  };

  return {
    id: DEFAULT_APPLICATION_ID,
    accountId: "draft-account-local",
    packageType: "INDIVIDUAL",
    status: "IN_PROGRESS",
    qualTestatorAge21: true,
    qualNonUaeNational: true,
    qualUaeAssets: true,
    qualMarried: true,
    qualChildrenUnder18: true,
    account: {
      id: "draft-account-local",
      email: "daniel.carter@example.com",
      fullName: "Daniel Michael Carter",
      phoneNumber: "+971 50 123 4567",
    },
    persons: [defaultTestator],
    wills: [defaultWill],
    payments: [],
    tickets: [],
    reviewFlags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

export const useOwaStore = create<OwaState>()(
  persist(
    (set, get) => {
      const initialApp = createDefaultDraftApplication();
      return {
        applicationId: initialApp.id,
        activeWillIndex: 1,
        currentSection: "details",
        application: initialApp,
        isSaving: false,
        saveError: null,

        setApplicationId: (id) => set({ applicationId: id }),
        setActiveWillIndex: (index) => set({ activeWillIndex: index }),
        setCurrentSection: (section) => set({ currentSection: section }),
        setApplication: (app) => set({ application: app }),

        loadApplicationFromDb: async (id: string) => {
          if (!id || id.startsWith("draft-")) return false;
          try {
            const res = await fetch(`/api/applications/${id}`);
            const data = await res.json();
            if (data.success && data.application) {
              set({
                applicationId: id,
                application: data.application,
                saveError: null,
              });
              return true;
            }
            return false;
          } catch (err: any) {
            console.error("Failed to load application from DB:", err);
            return false;
          }
        },

        saveCurrentSectionToDb: async () => {
          const state = get();
          if (!state.application) return false;
          if (!state.applicationId || state.applicationId.startsWith("draft-")) {
            return true;
          }

          const activeWill = state.application.wills.find(
            (w) => w.willIndex === state.activeWillIndex
          );
          if (!activeWill) return false;

          set({ isSaving: true, saveError: null });

          try {
            const res = await fetch(`/api/applications/${state.applicationId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                willId: activeWill.id,
                domicileCountry: activeWill.domicileCountry,
                isDraftConfirmed: activeWill.isDraftConfirmed,
                roleAssignments: activeWill.roleAssignments.map((ra) => ({
                  personId: ra.personId,
                  role: ra.role,
                  appointmentOrder: ra.appointmentOrder,
                  sharePercentage: ra.sharePercentage,
                })),
              }),
            });

            const data = await res.json();
            if (!data.success) {
              throw new Error(data.error || "Save failed.");
            }

            set({ isSaving: false });
            return true;
          } catch (err: any) {
            console.error("Save error:", err);
            set({ isSaving: false, saveError: err.message });
            return false;
          }
        },

        addOrUpdatePerson: async (personData: Partial<PersonData>): Promise<PersonData | null> => {
          const state = get();
          const currentApp = state.application || createDefaultDraftApplication();
          const currentAppId = currentApp.id || state.applicationId || "draft-app-local";

          const personId =
            personData.id || `person-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
          const existingPerson = currentApp.persons.find((p) => p.id === personId);

          const updatedPerson: PersonData = {
            id: personId,
            applicationId: currentAppId,
            fullName:
              personData.fullName !== undefined
                ? personData.fullName
                : existingPerson?.fullName || "",
            arabicName:
              personData.arabicName !== undefined
                ? personData.arabicName
                : existingPerson?.arabicName || null,
            isArabicApproved:
              personData.isArabicApproved !== undefined
                ? personData.isArabicApproved
                : existingPerson?.isArabicApproved || false,
            dob:
              personData.dob !== undefined
                ? personData.dob
                : existingPerson?.dob || null,
            nationality:
              personData.nationality !== undefined
                ? personData.nationality
                : existingPerson?.nationality || "British",
            relationship:
              personData.relationship !== undefined
                ? personData.relationship
                : existingPerson?.relationship || null,
            passportNumber:
              personData.passportNumber !== undefined
                ? personData.passportNumber
                : existingPerson?.passportNumber || null,
            emiratesId:
              personData.emiratesId !== undefined
                ? personData.emiratesId
                : existingPerson?.emiratesId || null,
            isUaeResident:
              personData.isUaeResident !== undefined
                ? personData.isUaeResident
                : existingPerson?.isUaeResident ?? true,
            address:
              personData.address !== undefined
                ? personData.address
                : existingPerson?.address || null,
            email:
              personData.email !== undefined
                ? personData.email
                : existingPerson?.email || null,
            phone:
              personData.phone !== undefined
                ? personData.phone
                : existingPerson?.phone || null,
            documents: personData.documents || existingPerson?.documents || [],
          };

          const existingIdx = currentApp.persons.findIndex((p) => p.id === personId);
          let updatedPersons = [...currentApp.persons];
          if (existingIdx >= 0) {
            updatedPersons[existingIdx] = updatedPerson;
          } else {
            updatedPersons.push(updatedPerson);
          }

          const updatedWills = currentApp.wills.map((will) => ({
            ...will,
            testatorPerson:
              will.testatorPersonId === personId ? updatedPerson : will.testatorPerson,
            roleAssignments: will.roleAssignments.map((ra) =>
              ra.personId === personId ? { ...ra, person: updatedPerson } : ra
            ),
          }));

          set({
            applicationId: currentAppId,
            application: {
              ...currentApp,
              persons: updatedPersons,
              wills: updatedWills,
            },
          });

          // Server background sync if authenticated and not in local-only draft mode
          if (currentAppId && !currentAppId.startsWith("draft-")) {
            try {
              fetch("/api/persons", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  ...personData,
                  id: personData.id,
                  applicationId: currentAppId,
                }),
              }).catch(() => {});
            } catch (_) {}
          }

          return updatedPerson;
        },

        assignPersonToRole: (personId, role, order = 1, sharePercentage) => {
          const state = get();
          let currentApp = state.application || createDefaultDraftApplication();

          let activeWillIdx = currentApp.wills.findIndex(
            (w) => w.willIndex === state.activeWillIndex
          );
          let updatedWills = [...currentApp.wills];
          if (activeWillIdx < 0) {
            const defaultWill: WillData = {
              id: `will-${state.activeWillIndex}-${Date.now()}`,
              applicationId: currentApp.id,
              willIndex: state.activeWillIndex,
              versionTag: "ADJD-NM0723-07-03",
              domicileCountry: "United Kingdom",
              declarationConfirmed: true,
              hasChildrenUnder18: false,
              isDraftConfirmed: false,
              roleAssignments: [],
            };
            updatedWills.push(defaultWill);
            activeWillIdx = updatedWills.length - 1;
          }

          const activeWill = updatedWills[activeWillIdx];
          const person = currentApp.persons.find((p) => p.id === personId);

          let filtered = activeWill.roleAssignments.filter(
            (ra) => !(ra.role === role && ra.appointmentOrder === order)
          );

          const newAssignment: RoleAssignmentData = {
            id: `role-assign-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            willId: activeWill.id,
            personId,
            role,
            appointmentOrder: order,
            sharePercentage: sharePercentage !== undefined ? sharePercentage : null,
            person,
          };

          filtered.push(newAssignment);

          updatedWills[activeWillIdx] = {
            ...activeWill,
            roleAssignments: filtered,
            isDraftConfirmed: false,
          };

          set({
            application: {
              ...currentApp,
              wills: updatedWills,
            },
          });
        },

        removeRoleAssignment: (roleAssignmentId) => {
          const state = get();
          if (!state.application) return;

          const activeWillIdx = state.application.wills.findIndex(
            (w) => w.willIndex === state.activeWillIndex
          );
          if (activeWillIdx < 0) return;

          const activeWill = state.application.wills[activeWillIdx];
          const filtered = activeWill.roleAssignments.filter(
            (ra) => ra.id !== roleAssignmentId
          );

          const updatedWills = [...state.application.wills];
          updatedWills[activeWillIdx] = {
            ...activeWill,
            roleAssignments: filtered,
            isDraftConfirmed: false,
          };

          set({
            application: {
              ...state.application,
              wills: updatedWills,
            },
          });
        },

      copyWillToPartnerWill: async () => {
        const state = get();
        if (!state.application || state.application.wills.length < 2) return false;

        const will1 = state.application.wills[0];
        const will2 = state.application.wills[1];

        const testator1 = will1.testatorPerson;
        const testator2 = will2.testatorPerson;

        // Clone beneficiaries and guardians, swapping testator1 and testator2
        const clonedAssignments: RoleAssignmentData[] = will1.roleAssignments
          .filter((ra) => ra.role === "BENEFICIARY" || ra.role.startsWith("GUARDIAN_") || ra.role === "CHILD")
          .map((ra) => {
            let targetPersonId = ra.personId;
            // Swap: if testator2 was beneficiary in Will 1, replace with testator1 in Will 2
            if (testator2 && ra.personId === testator2.id && testator1) {
              targetPersonId = testator1.id;
            }
            return {
              id: `clone-${Date.now()}-${Math.random()}`,
              willId: will2.id,
              personId: targetPersonId,
              role: ra.role,
              appointmentOrder: ra.appointmentOrder,
              sharePercentage: ra.sharePercentage,
            };
          });

        const updatedWills = [...state.application.wills];
        updatedWills[1] = {
          ...will2,
          roleAssignments: clonedAssignments,
          isDraftConfirmed: false,
        };

        set({
          application: {
            ...state.application,
            wills: updatedWills,
          },
        });

        return true;
      },

      isSectionComplete: (section) => {
        const state = get();
        if (!state.application) return false;
        const will = state.application.wills.find((w) => w.willIndex === state.activeWillIndex);
        if (!will) return false;

        switch (section) {
          case "details":
            return !!(will.testatorPerson?.fullName && will.testatorPerson?.passportNumber);
          case "children":
            // Complete if no children, or if all listed children have passports
            const children = will.roleAssignments.filter((ra) => ra.role === "CHILD");
            return children.length === 0 || children.every((c) => !!c.person?.passportNumber);
          case "executors":
            return will.roleAssignments.some((ra) => ra.role === "EXECUTOR_PRIMARY");
          case "guardians":
            const hasKids = will.roleAssignments.some((ra) => ra.role === "CHILD");
            if (!hasKids) return true;
            const hasPerm = will.roleAssignments.some((ra) => ra.role === "GUARDIAN_PERMANENT");
            const hasSubPerm = will.roleAssignments.some((ra) => ra.role === "GUARDIAN_SUBSTITUTE_PERM");
            return hasPerm && hasSubPerm;
          case "beneficiaries": {
            const primaries = will.roleAssignments.filter(
              (ra) => ra.role === "BENEFICIARY_PRIMARY" || ra.role === "BENEFICIARY"
            );
            const substitutes = will.roleAssignments.filter(
              (ra) => ra.role === "BENEFICIARY_SUBSTITUTE"
            );

            // 1. Primary rules: 1 to 3 appointments, positive shares summing to 100%
            if (primaries.length < 1 || primaries.length > 3) return false;
            const primarySum = primaries.reduce((acc, b) => acc + (Number(b.sharePercentage) || 0), 0);
            if (Math.abs(primarySum - 100) >= 0.01) return false;
            if (primaries.some((b) => (Number(b.sharePercentage) || 0) <= 0)) return false;
            if (new Set(primaries.map((p) => p.personId)).size !== primaries.length) return false;

            // 2. Substitute rules: 1 (A) or 2 (A & B) appointments, positive shares summing to 100%
            if (substitutes.length < 1 || substitutes.length > 2) return false;
            const subSum = substitutes.reduce((acc, b) => acc + (Number(b.sharePercentage) || 0), 0);
            if (Math.abs(subSum - 100) >= 0.01) return false;
            if (substitutes.some((b) => (Number(b.sharePercentage) || 0) <= 0)) return false;
            if (new Set(substitutes.map((s) => s.personId)).size !== substitutes.length) return false;

            // 3. Safeguards: Testator cannot be beneficiary; no primary can be substitute
            const testatorId = will.testatorPersonId;
            if (testatorId && (primaries.some((p) => p.personId === testatorId) || substitutes.some((s) => s.personId === testatorId))) {
              return false;
            }
            if (substitutes.some((s) => primaries.some((p) => p.personId === s.personId))) {
              return false;
            }

            return true;
          }
          case "review":
            return will.isDraftConfirmed;
          default:
            return false;
        }
      },
    };
  },
    {
      name: "owa_application_store",
      partialize: (state) => ({
        applicationId: state.applicationId,
        activeWillIndex: state.activeWillIndex,
        currentSection: state.currentSection,
        application: state.application,
      }),
    }
  )
);
