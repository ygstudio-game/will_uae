import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  WillType,
  Party,
  Child,
  Asset,
  UploadedDoc,
  TestatorDetails,
  StatutoryConfirmations,
} from "@/types/will";
import { DANIEL_CARTER_FIXTURE } from "@/prisma/seed-data";

interface WillState {
  activeWillId: string | null;
  currentStep: number;
  willType: WillType;
  testator: TestatorDetails;
  parties: Party[];
  children: Child[];
  assets: Asset[];
  documents: UploadedDoc[];
  confirmations: StatutoryConfirmations;
  isSaving: boolean;

  // Actions
  setActiveWillId: (id: string | null) => void;
  setCurrentStep: (step: number) => void;
  setWillType: (type: WillType) => void;
  updateTestator: (data: Partial<TestatorDetails>) => void;
  addParty: (party: Party) => void;
  updateParty: (id: string, data: Partial<Party>) => void;
  removeParty: (id: string) => void;
  addChild: (child: Child) => void;
  updateChild: (id: string, data: Partial<Child>) => void;
  removeChild: (id: string) => void;
  addAsset: (asset: Asset) => void;
  removeAsset: (id: string) => void;
  addDocument: (doc: UploadedDoc) => void;
  removeDocument: (id: string) => void;
  updateConfirmations: (data: Partial<StatutoryConfirmations>) => void;
  approveArabicName: (id: string, arabicName: string) => void;
  loadSampleData: () => void;
  resetToEmpty: () => void;
  loadWillFromDatabase: (id: string) => Promise<boolean>;
  saveCurrentStep: (step: number) => Promise<boolean>;
  isStepValid: (step: number) => boolean;
}

// Clean, empty default state for real users
const getEmptyState = () => ({
  activeWillId: null as string | null,
  currentStep: 1,
  willType: "INDIVIDUAL" as WillType,
  testator: {
    fullName: "",
    arabicName: "",
    isArabicApproved: false,
    dob: "",
    nationality: "British",
    passportNumber: "",
    emiratesId: "",
    isUaeResident: true,
    residentialAddress: "",
    emailAddress: "",
    contactNumber: "",
    domicileCountry: "United Arab Emirates",
    hasChildren: false,
    hasTitledAssets: false,
  },
  parties: [] as Party[],
  children: [] as Child[],
  assets: [] as Asset[],
  documents: [] as UploadedDoc[],
  confirmations: {
    declaration: false,
    debts: false,
    wishes: false,
    jurisdiction: false,
    insurance: false,
    powers: false,
    execution: false,
  },
  isSaving: false,
});

// Sample data loader for evaluation & demo testing
const getSampleFixtureState = () => {
  const fixture = DANIEL_CARTER_FIXTURE;

  const initialParties: Party[] = [
    ...fixture.executors.map((e, idx) => ({
      ...e,
      id: `exec-${idx + 1}`,
      role: e.partyType,
    })),
    {
      ...fixture.beneficiaries.primary,
      id: "ben-primary",
      role: fixture.beneficiaries.primary.partyType,
    },
    ...fixture.beneficiaries.substitutes.map((s, idx) => ({
      ...s,
      id: `ben-sub-${idx + 1}`,
      role: s.partyType,
    })),
    ...fixture.guardians.map((g, idx) => ({
      ...g,
      id: `guard-${idx + 1}`,
      role: g.partyType,
      isUaeResident: idx === 1,
    })),
  ];

  const initialChildren: Child[] = fixture.children.map((c, idx) => ({
    ...c,
    id: `child-${idx + 1}`,
  }));

  const initialAssets: Asset[] = fixture.assets.map((a, idx) => ({
    ...a,
    id: `asset-${idx + 1}`,
    assetType: a.assetType as any,
  }));

  const initialDocs: UploadedDoc[] = [
    {
      id: "doc-1",
      type: "PASSPORT",
      fileName: "Daniel_Carter_Passport_Bio.pdf",
      fileSize: 1845000,
      extracted: true,
      confidence: 99,
    },
    {
      id: "doc-2",
      type: "EMIRATES_ID",
      fileName: "Daniel_Carter_Emirates_ID.jpg",
      fileSize: 945000,
      extracted: true,
      confidence: 98,
    },
  ];

  return {
    willType: "INDIVIDUAL" as WillType,
    testator: {
      ...fixture.testator,
      isArabicApproved: true,
    },
    parties: initialParties,
    children: initialChildren,
    assets: initialAssets,
    documents: initialDocs,
    confirmations: {
      declaration: true,
      debts: true,
      wishes: true,
      jurisdiction: true,
      insurance: true,
      powers: true,
      execution: true,
    },
  };
};

export const useWillStore = create<WillState>()(
  persist(
    (set, get) => ({
      ...getEmptyState(),

      setActiveWillId: (id) => set({ activeWillId: id }),

      setCurrentStep: (step) => set({ currentStep: step }),

      setWillType: (willType) => set({ willType }),

      updateTestator: (data) =>
        set((state) => ({
          testator: { ...state.testator, ...data },
        })),

      addParty: (party) =>
        set((state) => ({
          parties: [...state.parties, party],
        })),

      updateParty: (id, data) =>
        set((state) => ({
          parties: state.parties.map((p) => (p.id === id ? { ...p, ...data } : p)),
        })),

      removeParty: (id) =>
        set((state) => ({
          parties: state.parties.filter((p) => p.id !== id),
        })),

      addChild: (child) =>
        set((state) => ({
          children: [...state.children, child],
        })),

      updateChild: (id, data) =>
        set((state) => ({
          children: state.children.map((c) => (c.id === id ? { ...c, ...data } : c)),
        })),

      removeChild: (id) =>
        set((state) => ({
          children: state.children.filter((c) => c.id !== id),
        })),

      addAsset: (asset) =>
        set((state) => ({
          assets: [...state.assets, asset],
        })),

      removeAsset: (id) =>
        set((state) => ({
          assets: state.assets.filter((a) => a.id !== id),
        })),

      addDocument: (doc) =>
        set((state) => ({
          documents: [...state.documents, doc],
        })),

      removeDocument: (id) =>
        set((state) => ({
          documents: state.documents.filter((d) => d.id !== id),
        })),

      updateConfirmations: (data) =>
        set((state) => ({
          confirmations: { ...state.confirmations, ...data },
        })),

      approveArabicName: (id, arabicName) =>
        set((state) => {
          if (id === "testator") {
            return {
              testator: { ...state.testator, arabicName, isArabicApproved: true },
            };
          }
          return {
            parties: state.parties.map((p) =>
              p.id === id ? { ...p, arabicName, isArabicApproved: true } : p
            ),
            children: state.children.map((c) =>
              c.id === id ? { ...c, arabicName, isArabicApproved: true } : c
            ),
          };
        }),

      loadSampleData: () => {
        set((state) => ({
          ...state,
          ...getSampleFixtureState(),
        }));
      },

      resetToEmpty: () => {
        set(getEmptyState());
      },

      // Database Hydration
      loadWillFromDatabase: async (willId: string) => {
        try {
          const res = await fetch(`/api/wills/${willId}`);
          if (!res.ok) return false;
          const data = await res.json();
          if (!data.success || !data.will) return false;

          const w = data.will;
          set({
            activeWillId: w.id,
            currentStep: w.currentStep || 1,
            willType: w.willType || "INDIVIDUAL",
            testator: {
              fullName: w.fullName || "",
              arabicName: w.arabicName || "",
              isArabicApproved: !!w.arabicName,
              dob: w.dob ? new Date(w.dob).toISOString().split("T")[0] : "",
              nationality: w.nationality || "British",
              passportNumber: w.passportNumber || "",
              emiratesId: w.emiratesId || "",
              isUaeResident: w.isUaeResident ?? true,
              residentialAddress: w.residentialAddress || "",
              emailAddress: w.emailAddress || "",
              contactNumber: w.contactNumber || "",
              domicileCountry: w.domicileCountry || "United Arab Emirates",
              hasChildren: w.hasChildren || false,
              hasTitledAssets: w.hasTitledAssets || false,
            },
            parties: (w.parties || []).map((p: any) => ({
              id: p.id,
              role: p.partyType,
              fullName: p.fullName,
              arabicName: p.arabicName || "",
              isArabicApproved: p.isArabicApproved || false,
              dob: p.dob ? new Date(p.dob).toISOString().split("T")[0] : "",
              nationality: p.nationality || "",
              passportNumber: p.passportNumber || "",
              emiratesId: p.emiratesId || "",
              isUaeResident: p.isUaeResident || false,
              residentialAddress: p.address || "",
              emailAddress: p.email || "",
              contactNumber: p.phone || "",
              sharePercentage: p.sharePercentage,
            })),
            children: (w.children || []).map((c: any) => ({
              id: c.id,
              fullName: c.fullName,
              arabicName: c.arabicName || "",
              dob: c.dob ? new Date(c.dob).toISOString().split("T")[0] : "",
              nationality: c.nationality || "",
              passportNumber: c.passportNumber || "",
            })),
            assets: (w.assets || []).map((a: any) => ({
              id: a.id,
              assetType: a.assetType,
              titleDescription: a.description,
              emirate: a.emirate || "Dubai",
              assetIdentifier: a.titleDeedNumber || "",
            })),
            confirmations: {
              declaration: w.declarationConfirmed || false,
              debts: w.debtsConfirmed || false,
              wishes: w.wishesConfirmed || false,
              jurisdiction: w.jurisdictionConfirmed || false,
              insurance: w.insuranceConfirmed || false,
              powers: w.powersConfirmed || false,
              execution: w.executionConfirmed || false,
            },
          });
          return true;
        } catch (e) {
          console.error("Failed to load will from database:", e);
          return false;
        }
      },

      // Database Step Auto-Save
      saveCurrentStep: async (step: number) => {
        const state = get();
        set({ isSaving: true });

        try {
          let willId = state.activeWillId;

          // If no active draft yet, create one in the DB
          if (!willId) {
            const createRes = await fetch("/api/wills", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ willType: state.willType }),
            });
            if (createRes.ok) {
              const createData = await createRes.json();
              if (createData.will?.id) {
                willId = createData.will.id;
                set({ activeWillId: willId });
              }
            }
          }

          if (!willId) {
            set({ isSaving: false });
            return true; // Still allow navigation if unauthenticated or offline
          }

          // Payload mapping
          const payload = {
            currentStep: step,
            willType: state.willType,
            testator: state.testator,
            confirmations: {
              declarationConfirmed: state.confirmations.declaration,
              debtsConfirmed: state.confirmations.debts,
              wishesConfirmed: state.confirmations.wishes,
              jurisdictionConfirmed: state.confirmations.jurisdiction,
              insuranceConfirmed: state.confirmations.insurance,
              powersConfirmed: state.confirmations.powers,
              executionConfirmed: state.confirmations.execution,
            },
            parties: state.parties,
            children: state.children,
            assets: state.assets,
          };

          const patchRes = await fetch(`/api/wills/${willId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          set({ isSaving: false });
          return patchRes.ok;
        } catch (err) {
          console.error("Step auto-save error:", err);
          set({ isSaving: false });
          return false;
        }
      },

      isStepValid: (step) => {
        const state = get();
        switch (step) {
          case 1:
            return true;
          case 2:
            return !!(
              state.testator.fullName?.trim() &&
              state.testator.nationality?.trim() &&
              state.testator.passportNumber?.trim()
            );
          case 3:
            return state.confirmations.declaration;
          case 4:
            return state.parties.some(
              (p) => p.role === "PRIMARY_EXECUTOR" && p.fullName?.trim()
            );
          case 5:
            return state.confirmations.debts;
          case 6:
            return state.confirmations.wishes;
          case 7:
            return state.confirmations.jurisdiction;
          case 8:
            return state.confirmations.insurance;
          case 9: {
            const primaries = state.parties.filter(
              (p) => p.role === "PRIMARY_BENEFICIARY" && p.fullName?.trim()
            );
            const substitutes = state.parties.filter(
              (p) => p.role === "SUBSTITUTE_BENEFICIARY" && p.fullName?.trim()
            );

            // Primary group validation
            if (primaries.length < 1 || primaries.length > 3) return false;
            const primarySum = primaries.reduce((acc, p) => acc + (p.sharePercentage || 0), 0);
            if (Math.abs(primarySum - 100) >= 0.01) return false;
            if (primaries.some((p) => (p.sharePercentage || 0) <= 0)) return false;

            // Substitute group validation
            if (substitutes.length < 1 || substitutes.length > 2) return false;
            const subSum = substitutes.reduce((acc, p) => acc + (p.sharePercentage || 0), 0);
            if (Math.abs(subSum - 100) >= 0.01) return false;
            if (substitutes.some((p) => (p.sharePercentage || 0) <= 0)) return false;

            // Cross-group check (no primary as substitute)
            if (substitutes.some((s) => primaries.some((p) => p.fullName.trim().toLowerCase() === s.fullName.trim().toLowerCase()))) {
              return false;
            }

            return true;
          }
          case 10:
            return !state.testator.hasTitledAssets || state.assets.length > 0;
          case 11:
            return !state.testator.hasChildren || state.children.length > 0;
          case 12:
            return state.confirmations.powers;
          case 13:
            return (
              !state.testator.hasChildren ||
              state.parties.some((p) => p.role === "PERMANENT_GUARDIAN")
            );
          case 14:
            return state.confirmations.execution;
          case 15:
            return (
              state.testator.isArabicApproved &&
              state.parties.every((p) => !p.arabicName || p.isArabicApproved)
            );
          case 16:
            return true;
          default:
            return true;
        }
      },
    }),
    {
      name: "uae-will-storage-v2",
    }
  )
);
