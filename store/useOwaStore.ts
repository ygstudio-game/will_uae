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
  isNavigatingSection: boolean;
  navigatingTarget: OwaSectionId | null;
  isLoadingData: boolean;
  loadingMessage: string | null;

  // Actions
  setNavigatingSection: (
    isNavigating: boolean,
    target?: OwaSectionId | null,
    message?: string | null
  ) => void;
  setApplicationId: (id: string | null) => void;
  setActiveWillIndex: (index: number) => void;
  setCurrentSection: (section: OwaSectionId) => void;
  setApplication: (app: ApplicationData | null) => void;
  loadApplicationFromDb: (id: string) => Promise<boolean>;
  syncWithDbAccount: () => Promise<boolean>;
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
  updateRoleShares: (
    role: RoleType,
    updates: { assignmentId?: string; personId?: string; sharePercentage: number }[]
  ) => void;
  removeRoleAssignment: (roleAssignmentId: string) => void;

  // Active Will Updates
  updateActiveWill: (updates: Partial<WillData>) => void;

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
    fullName: "",
    arabicName: "",
    isArabicApproved: false,
    dob: null,
    nationality: "",
    relationship: "Self",
    passportNumber: "",
    emiratesId: "",
    isUaeResident: true,
    address: "",
    email: "",
    phone: "",
    documents: [],
    signatureDataUrl: null,
  };

  const defaultWill: WillData = {
    id: DEFAULT_WILL_ID,
    applicationId: DEFAULT_APPLICATION_ID,
    willIndex: 1,
    versionTag: "ADJD-NM0723-07-03",
    testatorPersonId: DEFAULT_TESTATOR_ID,
    testatorPerson: defaultTestator,
    domicileCountry: "",
    declarationConfirmed: false,
    hasChildrenUnder18: false,
    childrenAnswered: false,
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
    qualMarried: false,
    qualChildrenUnder18: false,
    account: {
      id: "draft-account-local",
      email: "",
      fullName: "",
      phoneNumber: "",
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

function mergeLocalSignatures(incomingApp: any, localApp?: any): any {
  if (!incomingApp) return incomingApp;
  let cachedSig: string | null = null;
  if (typeof window !== "undefined") {
    try {
      cachedSig = localStorage.getItem("owa_signature_latest");
    } catch (_) {}
  }

  const mergedPersons = (incomingApp.persons || []).map((p: any) => {
    let personSig = p.signatureDataUrl;
    if (!personSig && typeof window !== "undefined") {
      try {
        personSig = localStorage.getItem(`owa_signature_${p.id}`);
      } catch (_) {}
    }
    const localP = localApp?.persons?.find((ep: any) => ep.id === p.id || ep.fullName === p.fullName);
    return {
      ...p,
      signatureDataUrl: personSig || localP?.signatureDataUrl || (p.relationship === "Self" ? cachedSig : null) || null,
    };
  });

  const mergedWills = (incomingApp.wills || []).map((w: any) => {
    const localW = localApp?.wills?.find((ew: any) => ew.id === w.id || ew.willIndex === w.willIndex);
    let testator = w.testatorPerson || localW?.testatorPerson;
    if (testator) {
      const matchP = mergedPersons.find((mp: any) => mp.id === testator.id || mp.relationship === "Self");
      testator = {
        ...testator,
        signatureDataUrl:
          testator.signatureDataUrl ||
          matchP?.signatureDataUrl ||
          localW?.testatorPerson?.signatureDataUrl ||
          cachedSig ||
          null,
      };
    }
    return {
      ...w,
      testatorPerson: testator,
    };
  });

  return {
    ...incomingApp,
    persons: mergedPersons,
    wills: mergedWills,
  };
}

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
        isNavigatingSection: false,
        navigatingTarget: null,
        isLoadingData: false,
        loadingMessage: null,

        setNavigatingSection: (isNavigating, target = null, message = null) =>
          set({
            isNavigatingSection: isNavigating,
            navigatingTarget: target,
            loadingMessage: message,
          }),
        setApplicationId: (id) => set({ applicationId: id }),
        setActiveWillIndex: (index) => set({ activeWillIndex: index }),
        setCurrentSection: (section) =>
          set({
            currentSection: section,
            isNavigatingSection: false,
            navigatingTarget: null,
            isLoadingData: false,
            loadingMessage: null,
          }),
        setApplication: (app) => set({ application: app }),

        loadApplicationFromDb: async (id: string) => {
          if (!id || id.startsWith("draft-")) return false;
          set({ isLoadingData: true, loadingMessage: "Loading court application records..." });
          try {
            const res = await fetch(`/api/applications/${id}`);
            const data = await res.json();
            if (data.success && data.application) {
              const state = get();
              const merged = mergeLocalSignatures(data.application, state.application);
              set({
                applicationId: id,
                application: merged,
                isLoadingData: false,
                loadingMessage: null,
                saveError: null,
              });
              return true;
            }
            set({ isLoadingData: false, loadingMessage: null });
            return false;
          } catch (err: any) {
            console.error("Failed to load application from DB:", err);
            set({ isLoadingData: false, loadingMessage: null });
            return false;
          }
        },

        syncWithDbAccount: async () => {
          set({ isLoadingData: true, loadingMessage: "Syncing application with your account..." });
          try {
            const state = get();
            const hasLocalDraftData =
              Boolean(state.application?.wills?.[0]?.testatorPerson?.fullName?.trim()) ||
              (Boolean(state.application?.persons) && (state.application?.persons?.length || 0) > 1);

            let res;
            if (hasLocalDraftData && state.applicationId?.startsWith("draft-")) {
              res = await fetch("/api/applications/current", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ localApp: state.application }),
              });
            } else {
              res = await fetch("/api/applications/current");
            }

            const data = await res.json();
            if (data.success && data.application) {
              const merged = mergeLocalSignatures(data.application, state.application);
              set({
                applicationId: data.application.id,
                application: merged,
                isLoadingData: false,
                loadingMessage: null,
                isSaving: false,
                saveError: null,
              });
              return true;
            }
            set({ isLoadingData: false, loadingMessage: null });
            return false;
          } catch (err: any) {
            console.error("Failed to sync with DB account:", err);
            set({ isLoadingData: false, loadingMessage: null });
            return false;
          }
        },

        saveCurrentSectionToDb: async () => {
          const state = get();
          if (!state.application) return false;

          let targetAppId = state.applicationId;

          // If in local draft mode, attempt to auto-sync with DB account
          if (!targetAppId || targetAppId.startsWith("draft-")) {
            try {
              const syncRes = await fetch("/api/applications/current");
              const syncData = await syncRes.json();
              if (syncData.success && syncData.application) {
                targetAppId = syncData.application.id;
                set({ applicationId: targetAppId });
              } else {
                return true; // Not logged in yet, saved to localStorage
              }
            } catch {
              return true;
            }
          }

          const activeWill = state.application.wills.find(
            (w) => w.willIndex === state.activeWillIndex
          );
          if (!activeWill) return false;

          set({ isSaving: true, saveError: null });

          try {
            const res = await fetch(`/api/applications/${targetAppId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                willId: activeWill.id,
                domicileCountry: activeWill.domicileCountry,
                hasChildrenUnder18: activeWill.hasChildrenUnder18,
                childrenAnswered: activeWill.childrenAnswered,
                isDraftConfirmed: activeWill.isDraftConfirmed,
                testatorPerson: activeWill.testatorPerson,
                persons: state.application.persons,
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

            if (data.application) {
              const merged = mergeLocalSignatures(data.application, state.application);
              set({
                application: merged,
                applicationId: data.application.id,
                isSaving: false,
              });
            } else {
              set({ isSaving: false });
            }
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
            signatureDataUrl:
              personData.signatureDataUrl !== undefined
                ? personData.signatureDataUrl
                : existingPerson?.signatureDataUrl || null,
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
              will.testatorPersonId === personId ||
              will.testatorPerson?.id === personId ||
              (will.willIndex === 1 && (personData.relationship === "Self" || existingPerson?.relationship === "Self"))
                ? updatedPerson
                : will.testatorPerson,
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

          // Sync signature to localStorage for bulletproof offline fallback
          if (typeof window !== "undefined" && personData.signatureDataUrl !== undefined) {
            try {
              if (personData.signatureDataUrl) {
                localStorage.setItem(`owa_signature_${personId}`, personData.signatureDataUrl);
                if (personData.relationship === "Self" || existingPerson?.relationship === "Self" || currentApp.wills[0]?.testatorPersonId === personId) {
                  localStorage.setItem("owa_signature_latest", personData.signatureDataUrl);
                }
              } else {
                localStorage.removeItem(`owa_signature_${personId}`);
              }
            } catch (_) {}
          }

          // Server background sync if authenticated and not in local-only draft mode
          if (currentAppId && !currentAppId.startsWith("draft-")) {
            try {
              fetch("/api/persons", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  ...personData,
                  signatureDataUrl: updatedPerson.signatureDataUrl,
                  id: personId,
                  applicationId: currentAppId,
                }),
              }).catch(() => {});
            } catch (_) {}
          } else {
            // Check if user is authenticated and sync automatically
            fetch("/api/applications/current")
              .then((r) => r.json())
              .then((d) => {
                if (d.success && d.application?.id) {
                  set({ applicationId: d.application.id });
                  fetch("/api/persons", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      ...personData,
                      signatureDataUrl: updatedPerson.signatureDataUrl,
                      id: personId,
                      applicationId: d.application.id,
                    }),
                  }).catch(() => {});
                }
              })
              .catch(() => {});
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
              domicileCountry: "",
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

          const existingAssignment = activeWill.roleAssignments.find(
            (ra) => (ra.role === role && ra.appointmentOrder === order) || (ra.role === role && ra.personId === personId)
          );

          let filtered = activeWill.roleAssignments.filter(
            (ra) => !(ra.role === role && (ra.appointmentOrder === order || ra.personId === personId))
          );

          const newAssignment: RoleAssignmentData = {
            id: existingAssignment ? existingAssignment.id : `role-assign-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            willId: activeWill.id,
            personId,
            role,
            appointmentOrder: order,
            sharePercentage: sharePercentage !== undefined ? sharePercentage : (existingAssignment?.sharePercentage ?? null),
            person: person || existingAssignment?.person,
          };

          filtered.push(newAssignment);

          updatedWills[activeWillIdx] = {
            ...activeWill,
            roleAssignments: filtered,
            isDraftConfirmed: false,
            ...(role === "CHILD" ? { hasChildrenUnder18: true, childrenAnswered: true } : {}),
          };

          set({
            application: {
              ...currentApp,
              wills: updatedWills,
            },
          });
        },

        updateRoleShares: (role, updates) => {
          const state = get();
          if (!state.application) return;

          const activeWillIdx = state.application.wills.findIndex(
            (w) => w.willIndex === state.activeWillIndex
          );
          if (activeWillIdx < 0) return;

          const activeWill = state.application.wills[activeWillIdx];
          const updatedAssignments = activeWill.roleAssignments.map((ra) => {
            if (ra.role !== role && !(role === "BENEFICIARY_PRIMARY" && ra.role === "BENEFICIARY")) {
              return ra;
            }
            const update = updates.find(
              (u) =>
                (u.assignmentId && u.assignmentId === ra.id) ||
                (u.personId && u.personId === ra.personId)
            );
            if (update !== undefined) {
              return {
                ...ra,
                sharePercentage: update.sharePercentage,
              };
            }
            return ra;
          });

          const updatedWills = [...state.application.wills];
          updatedWills[activeWillIdx] = {
            ...activeWill,
            roleAssignments: updatedAssignments,
            isDraftConfirmed: false,
          };

          set({
            application: {
              ...state.application,
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
          const targetAssignment = activeWill.roleAssignments.find(
            (ra) => ra.id === roleAssignmentId
          );
          const filtered = activeWill.roleAssignments.filter(
            (ra) => ra.id !== roleAssignmentId
          );

          const updatedWills = [...state.application.wills];
          updatedWills[activeWillIdx] = {
            ...activeWill,
            roleAssignments: filtered,
            isDraftConfirmed: false,
          };

          // Clean up orphan person if not used elsewhere
          let updatedPersons = state.application.persons;
          if (targetAssignment?.personId) {
            const isUsedElsewhere = updatedWills.some(
              (w) =>
                w.roleAssignments.some((ra) => ra.personId === targetAssignment.personId) ||
                w.testatorPersonId === targetAssignment.personId
            );
            if (!isUsedElsewhere) {
              updatedPersons = updatedPersons.filter(
                (p) => p.id !== targetAssignment.personId
              );
            }
          }

          set({
            application: {
              ...state.application,
              persons: updatedPersons,
              wills: updatedWills,
            },
          });
        },

        updateActiveWill: (updates: Partial<WillData>) => {
          const state = get();
          if (!state.application) return;
          const activeWillIdx = state.application.wills.findIndex(
            (w) => w.willIndex === state.activeWillIndex
          );
          if (activeWillIdx < 0) return;

          const updatedWills = [...state.application.wills];
          updatedWills[activeWillIdx] = {
            ...updatedWills[activeWillIdx],
            ...updates,
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
          case "details": {
            const p = will.testatorPerson;
            const eidOk = !p?.isUaeResident || Boolean(p?.emiratesId?.trim());
            return !!(
              p?.fullName?.trim() &&
              p?.dob &&
              p?.nationality?.trim() &&
              p?.passportNumber?.trim() &&
              p?.address?.trim() &&
              will.domicileCountry?.trim() &&
              p?.phone?.trim() &&
              p?.email?.trim() &&
              eidOk
            );
          }
          case "children": {
            const children = will.roleAssignments.filter((ra) => ra.role === "CHILD");
            // Must be explicitly answered or have children added
            if (!will.childrenAnswered && children.length === 0) {
              return false;
            }
            if (will.hasChildrenUnder18) {
              return (
                children.length > 0 &&
                children.every((c) => {
                  const p = c.person || state.application?.persons.find((ep) => ep.id === c.personId);
                  return !!(p?.fullName?.trim() && p?.passportNumber?.trim());
                })
              );
            }
            // Explicitly confirmed no children
            return will.childrenAnswered === true;
          }
          case "executors":
            return will.roleAssignments.some((ra) => ra.role === "EXECUTOR_PRIMARY");
          case "guardians": {
            // If testator answered children question and has no children under 18, guardianship does not apply
            if (will.childrenAnswered && !will.hasChildrenUnder18) {
              return true;
            }
            const children = will.roleAssignments.filter((ra) => ra.role === "CHILD");
            // Guardians requires Children section to be answered first
            if (!will.childrenAnswered && children.length === 0) {
              return false;
            }
            if (!will.hasChildrenUnder18) return true;
            const hasPerm = will.roleAssignments.some((ra) => ra.role === "GUARDIAN_PERMANENT");
            const hasSubPerm = will.roleAssignments.some((ra) => ra.role === "GUARDIAN_SUBSTITUTE_PERM");
            return hasPerm && hasSubPerm;
          }
          case "beneficiaries": {
            const primaries = will.roleAssignments.filter(
              (ra) => ra.role === "BENEFICIARY_PRIMARY" || ra.role === "BENEFICIARY"
            );
            const substitutes = will.roleAssignments.filter(
              (ra) => ra.role === "BENEFICIARY_SUBSTITUTE"
            );

            // 1. Primary rules: 1 to 4 appointments, positive shares summing to 100%
            if (primaries.length < 1 || primaries.length > 4) return false;
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
