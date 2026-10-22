"use client";

import React, { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Users,
  UserPlus,
  Edit3,
  CheckCircle2,
  AlertCircle,
  FileText,
  Shield,
  ArrowRight,
  Globe,
  MapPin,
  X,
  UploadCloud,
  Check,
} from "lucide-react";
import { useOwaStore } from "@/store/useOwaStore";
import { PersonData, RoleType } from "@/types/owa";
import { CustomerSubNav } from "@/components/navigation/CustomerSubNav";
import { OwaFooter } from "@/components/common/OwaFooter";

function PeopleContent() {
  const searchParams = useSearchParams();
  const {
    application,
    applicationId,
    activeWillIndex,
    addOrUpdatePerson,
  } = useOwaStore();

  const [editingPerson, setEditingPerson] = useState<PersonData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSavingPerson, setIsSavingPerson] = useState(false);

  // Form State for Editing/Adding
  const [formData, setFormData] = useState<Partial<PersonData>>({});

  const activeApp = application;
  const currentWill = activeApp?.wills?.[activeWillIndex];

  // Consolidate all unique people from the application
  const peopleList = useMemo(() => {
    const list: PersonData[] = [];
    const seenIds = new Set<string>();

    const addIfNew = (p?: PersonData | null) => {
      if (p && p.id && !seenIds.has(p.id)) {
        seenIds.add(p.id);
        list.push(p);
      }
    };

    // Testator of current will
    if (currentWill?.testatorPerson) {
      addIfNew(currentWill.testatorPerson);
    }

    // Other will testators (if couples)
    activeApp?.wills?.forEach((w) => {
      if (w.testatorPerson) addIfNew(w.testatorPerson);
    });

    // People from application repository
    activeApp?.persons?.forEach((p) => {
      addIfNew(p);
    });

    // People from role assignments
    currentWill?.roleAssignments?.forEach((ra) => {
      if (ra.person) addIfNew(ra.person);
    });

    return list;
  }, [activeApp, currentWill]);

  // Map roles for each person to show role badges
  const personRolesMap = useMemo(() => {
    const map = new Map<string, string[]>();

    if (!currentWill) return map;

    // Testator
    if (currentWill.testatorPersonId) {
      const existing = map.get(currentWill.testatorPersonId) || [];
      existing.push("Testator");
      map.set(currentWill.testatorPersonId, existing);
    }

    // Partner testator
    if (activeApp?.packageType === "COUPLES") {
      activeApp.wills.forEach((w, idx) => {
        if (idx !== activeWillIndex && w.testatorPersonId) {
          const existing = map.get(w.testatorPersonId) || [];
          if (!existing.includes("Partner Testator")) {
            existing.push("Partner Testator");
          }
          map.set(w.testatorPersonId, existing);
        }
      });
    }

    // Role assignments
    currentWill.roleAssignments?.forEach((ra) => {
      const existing = map.get(ra.personId) || [];
      let label = "";
      switch (ra.role) {
        case "EXECUTOR_PRIMARY":
          label = "1st Executor";
          break;
        case "EXECUTOR_SUBSTITUTE":
          label = "Substitute Executor";
          break;
        case "EXECUTOR_FURTHER":
          label = "3rd Executor";
          break;
        case "GUARDIAN_PERMANENT":
          label = "Permanent Guardian";
          break;
        case "GUARDIAN_SUBSTITUTE_PERM":
          label = "Substitute Guardian";
          break;
        case "GUARDIAN_TEMPORARY":
          label = "Temporary Guardian (UAE)";
          break;
        case "BENEFICIARY_PRIMARY":
          label = `Primary Beneficiary (${ra.sharePercentage || 100}%)`;
          break;
        case "BENEFICIARY_SUBSTITUTE":
          label = `Substitute Beneficiary (${ra.sharePercentage || 100}%)`;
          break;
        case "CHILD":
          label = "Child";
          break;
        default:
          label = ra.role.replace(/_/g, " ");
      }
      if (label && !existing.includes(label)) {
        existing.push(label);
      }
      map.set(ra.personId, existing);
    });

    return map;
  }, [currentWill, activeApp, activeWillIndex]);

  // Check completeness of a person profile
  const isProfileComplete = (p: PersonData) => {
    return Boolean(
      p.fullName?.trim() &&
        p.dob &&
        p.nationality?.trim() &&
        p.passportNumber?.trim() &&
        p.address?.trim()
    );
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "P";
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join("");
  };

  const handleOpenEdit = (p?: PersonData) => {
    if (p) {
      setEditingPerson(p);
      setFormData({ ...p });
    } else {
      setEditingPerson(null);
      setFormData({
        fullName: "",
        arabicName: "",
        nationality: "",
        passportNumber: "",
        emiratesId: "",
        isUaeResident: true,
        address: "",
        email: "",
        phone: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSavePerson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName?.trim()) {
      alert("Please provide the full legal name.");
      return;
    }

    setIsSavingPerson(true);
    try {
      await addOrUpdatePerson({
        ...formData,
        id: editingPerson?.id || `person-${Date.now()}`,
      });
      setIsModalOpen(false);
      setEditingPerson(null);
    } catch (err) {
      console.error("Failed to save person:", err);
    } finally {
      setIsSavingPerson(false);
    }
  };

  const appId = searchParams.get("applicationId") || applicationId;
  const querySuffix = appId ? `?applicationId=${encodeURIComponent(appId)}` : "";

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#29213F] flex flex-col justify-between">
      <div>
        {/* Blended Customer Sub-Navigation Bar */}
        <CustomerSubNav />

        {/* Main Content Area */}
        <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-6">
          {/* Breadcrumb & Page Head */}
          <div>
            <div className="text-[11px] text-[#797287] font-medium mb-1">
              <Link href={`/dashboard${querySuffix}`} className="hover:underline">
                My application
              </Link>{" "}
              <span className="px-1.5 text-[#E4DFEE]">/</span> My people
            </div>
            <div className="text-[10px] tracking-[1.5px] uppercase font-semibold text-[#6243AD] mb-1 font-mono">
              YOUR OWA WORKSPACE
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
              <div>
                <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#29213F]">
                  The people in your Will.
                </h1>
                <p className="text-xs sm:text-sm text-[#797287] mt-1 max-w-xl">
                  One profile per person. Reuse their details and documents for every appointment across your Will.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleOpenEdit()}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#6243AD] hover:bg-[#443074] text-white text-xs font-semibold shadow-sm transition-all self-start sm:self-auto cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Add a person</span>
              </button>
            </div>
          </div>

          {/* Subheader info counter */}
          <div className="flex items-center justify-between py-2 border-b border-[#E4DFEE] text-xs text-[#797287]">
            <span>
              {peopleList.length} saved {peopleList.length === 1 ? "profile" : "profiles"} in your application
            </span>
            <span className="text-[11px] text-[#797287] flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#6243AD]" />
              Court-ready identity verification
            </span>
          </div>

          {/* Grid of People Cards */}
          {peopleList.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#E4DFEE] p-12 text-center shadow-xs">
              <Users className="w-12 h-12 text-[#6243AD]/40 mx-auto mb-3" />
              <h3 className="font-serif text-lg font-normal text-[#29213F]">No profiles added yet</h3>
              <p className="text-xs text-[#797287] max-w-md mx-auto mt-1 mb-5">
                Profiles added in your questionnaire (testator, spouse, children, executors, guardians, and beneficiaries) will automatically appear here.
              </p>
              <button
                type="button"
                onClick={() => handleOpenEdit()}
                className="px-4 py-2 rounded-lg bg-[#6243AD] text-white text-xs font-medium hover:bg-[#443074] transition-colors"
              >
                + Add your first profile
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {peopleList.map((person) => {
                const complete = isProfileComplete(person);
                const roles = personRolesMap.get(person.id) || [];

                return (
                  <div
                    key={person.id}
                    className="bg-white rounded-xl border border-[#E4DFEE] p-6 shadow-xs hover:border-[#C9B9E2] transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Person Top Row */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-11 h-11 rounded-full bg-[#F0EBF9] text-[#6243AD] flex items-center justify-center font-bold text-sm shrink-0 border border-[#DFD2EF]">
                            {getInitials(person.fullName)}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-medium text-[15px] text-[#29213F] truncate">
                              {person.fullName || "Unnamed person"}
                            </h3>
                            {person.arabicName ? (
                              <p className="text-xs text-[#8A6233] font-arabic font-medium truncate" dir="rtl">
                                {person.arabicName}
                              </p>
                            ) : (
                              <p className="text-xs text-[#797287]">
                                {person.nationality || "Nationality needed"}
                              </p>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleOpenEdit(person)}
                          className="text-xs text-[#6243AD] hover:text-[#443074] font-medium inline-flex items-center gap-1 shrink-0 px-2.5 py-1 rounded-md hover:bg-[#F7F4FC] transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit →</span>
                        </button>
                      </div>

                      {/* Address / Location snippet */}
                      <div className="mt-4 pt-3 border-t border-[#F0EBF9] space-y-1.5">
                        <div className="flex items-start gap-1.5 text-xs text-[#797287]">
                          <MapPin className="w-3.5 h-3.5 text-[#797287]/60 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">
                            {person.address || (person.isUaeResident ? "UAE resident" : "Residential address needed")}
                          </span>
                        </div>

                        {person.passportNumber && (
                          <div className="flex items-center gap-1.5 text-[11px] text-[#797287]">
                            <FileText className="w-3.5 h-3.5 text-[#797287]/60 shrink-0" />
                            <span>Passport: {person.passportNumber}</span>
                            {person.emiratesId && (
                              <span> · EID: {person.emiratesId}</span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Role Badges */}
                      {roles.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {roles.map((role, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#FAF9F6] text-[#29213F] border border-[#E4DFEE]"
                            >
                              {role}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Status & Residence Indicators */}
                    <div className="mt-5 pt-3 border-t border-[#E4DFEE]/70 flex items-center justify-between text-xs">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                          complete
                            ? "bg-[#EDF5F0] text-[#366D58] border-[#BCD4C7]"
                            : "bg-[#FBF2E6] text-[#95652B] border-[#F2D7B2]"
                        }`}
                      >
                        {complete ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-[#366D58]" />
                            Profile complete
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3 h-3 text-[#95652B]" />
                            Needs details
                          </>
                        )}
                      </span>

                      <span className="text-[11px] text-[#797287]">
                        {person.isUaeResident ? "UAE resident" : "Outside UAE"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Contextual guidance card */}
          <div className="bg-[#F7F4FC] rounded-xl border border-[#DFD2EF] p-5 flex items-start gap-3.5">
            <Shield className="w-5 h-5 text-[#6243AD] shrink-0 mt-0.5" />
            <div className="text-xs text-[#29213F] space-y-1">
              <strong className="font-semibold text-sm block">How shared profiles work</strong>
              <p className="text-[#797287] leading-relaxed">
                When you appoint an executor or guardian who is also a beneficiary, updating their details here updates their profile across all appointments in your Will. No duplicate data entry required.
              </p>
            </div>
          </div>
        </main>
      </div>

      {/* Edit / Add Person Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#29213F]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E4DFEE] max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 animate-in fade-in-50 zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E4DFEE]">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-normal text-[#29213F]">
                  {editingPerson ? "Edit Person Profile" : "Add a New Person"}
                </h2>
                <p className="text-xs text-[#797287] mt-0.5">
                  Enter official passport details matching government documents.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-[#797287] hover:text-[#29213F] hover:bg-[#F0EBF9] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSavePerson} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#29213F] mb-1">
                  Full Legal Name (English) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName || ""}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. John Michael Smith"
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-[#DCD4E7] focus:outline-none focus:border-[#6243AD] focus:ring-1 focus:ring-[#6243AD]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#29213F] mb-1">
                  Name in Arabic (if available)
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={formData.arabicName || ""}
                  onChange={(e) => setFormData({ ...formData, arabicName: e.target.value })}
                  placeholder="جون مايكل سميث"
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-[#DCD4E7] focus:outline-none focus:border-[#6243AD] focus:ring-1 focus:ring-[#6243AD] font-arabic text-[#8A6233] font-medium"
                />
                <span className="text-[10px] text-[#797287] mt-1 block">
                  ADJD court requires phonetic transliteration. Leave blank if unsure; our legal team will provide verified Arabic.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#29213F] mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.dob || ""}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-lg border border-[#DCD4E7] focus:outline-none focus:border-[#6243AD]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#29213F] mb-1">
                    Nationality
                  </label>
                  <input
                    type="text"
                    value={formData.nationality || ""}
                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                    placeholder="e.g. British, Canadian"
                    className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-lg border border-[#DCD4E7] focus:outline-none focus:border-[#6243AD]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#29213F] mb-1">
                    Passport Number
                  </label>
                  <input
                    type="text"
                    value={formData.passportNumber || ""}
                    onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value })}
                    placeholder="e.g. G12345678"
                    className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-lg border border-[#DCD4E7] focus:outline-none focus:border-[#6243AD]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#29213F] mb-1">
                    UAE Resident?
                  </label>
                  <select
                    value={formData.isUaeResident ? "yes" : "no"}
                    onChange={(e) =>
                      setFormData({ ...formData, isUaeResident: e.target.value === "yes" })
                    }
                    className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-lg border border-[#DCD4E7] focus:outline-none focus:border-[#6243AD] bg-white"
                  >
                    <option value="yes">Yes · UAE Resident</option>
                    <option value="no">No · Living Outside UAE</option>
                  </select>
                </div>
              </div>

              {formData.isUaeResident && (
                <div>
                  <label className="block text-xs font-semibold text-[#29213F] mb-1">
                    Emirates ID (784-XXXX-XXXXXXX-X)
                  </label>
                  <input
                    type="text"
                    value={formData.emiratesId || ""}
                    onChange={(e) => setFormData({ ...formData, emiratesId: e.target.value })}
                    placeholder="784-1980-1234567-1"
                    className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-lg border border-[#DCD4E7] focus:outline-none focus:border-[#6243AD]"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#29213F] mb-1">
                  Residential Address
                </label>
                <textarea
                  rows={2}
                  value={formData.address || ""}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Building, street, apartment, city"
                  className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-lg border border-[#DCD4E7] focus:outline-none focus:border-[#6243AD]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#29213F] mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@example.com"
                    className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-lg border border-[#DCD4E7] focus:outline-none focus:border-[#6243AD]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#29213F] mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone || ""}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+971 50 123 4567"
                    className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-lg border border-[#DCD4E7] focus:outline-none focus:border-[#6243AD]"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-[#E4DFEE] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-lg border border-[#DCD4E7] text-xs font-medium text-[#797287] hover:bg-[#F0EBF9] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingPerson}
                  className="px-5 py-2.5 rounded-lg bg-[#6243AD] hover:bg-[#443074] text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
                >
                  {isSavingPerson ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <OwaFooter />
    </div>
  );
}

export default function PeoplePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-8 text-gray-500">
          Loading profiles...
        </div>
      }
    >
      <PeopleContent />
    </Suspense>
  );
}
