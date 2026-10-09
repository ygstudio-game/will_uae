import { useOwaStore } from "../store/useOwaStore";

async function runTest() {
  console.log("=== Testing OWA Store Beneficiary Actions ===");

  const store = useOwaStore.getState();
  console.log("Initial application present:", !!store.application);
  console.log("Initial application ID:", store.applicationId);
  console.log("Initial wills count:", store.application?.wills.length);

  // 1. Add Primary 1
  console.log("\n1. Adding Primary Beneficiary 1 (100%)...");
  const p1 = await store.addOrUpdatePerson({
    fullName: "Emma Claire Carter",
    relationship: "Spouse",
    nationality: "British",
    passportNumber: "GB98765432",
  });
  console.log("Created person p1:", p1?.fullName, "ID:", p1?.id);
  if (!p1) throw new Error("Failed to create p1");

  store.assignPersonToRole(p1.id, "BENEFICIARY_PRIMARY", 1, 100);

  let state = useOwaStore.getState();
  let will = state.application?.wills.find((w) => w.willIndex === state.activeWillIndex);
  let primaries = (will?.roleAssignments || []).filter(
    (ra) => ra.role === "BENEFICIARY_PRIMARY" || ra.role === "BENEFICIARY"
  );
  console.log("Primaries count:", primaries.length, "Share:", primaries[0]?.sharePercentage);
  if (primaries.length !== 1 || primaries[0]?.sharePercentage !== 100) {
    throw new Error("Primary 1 not assigned properly");
  }

  // 2. Add Primary 2
  console.log("\n2. Adding Primary Beneficiary 2 (adjusting shares to 60% / 40%)...");
  const p2 = await store.addOrUpdatePerson({
    fullName: "Oliver James Carter",
    relationship: "Son",
    nationality: "British",
    passportNumber: "GB55443322",
  });
  if (!p2) throw new Error("Failed to create p2");

  // Re-adjust p1 to 60%, assign p2 to 40%
  store.assignPersonToRole(p1.id, "BENEFICIARY_PRIMARY", 1, 60);
  store.assignPersonToRole(p2.id, "BENEFICIARY_PRIMARY", 2, 40);

  state = useOwaStore.getState();
  will = state.application?.wills.find((w) => w.willIndex === state.activeWillIndex);
  primaries = (will?.roleAssignments || []).filter(
    (ra) => ra.role === "BENEFICIARY_PRIMARY" || ra.role === "BENEFICIARY"
  );
  console.log("Primaries count:", primaries.length);
  const totalPri = primaries.reduce((s, r) => s + (Number(r.sharePercentage) || 0), 0);
  console.log("Total primary share:", totalPri);
  if (primaries.length !== 2 || totalPri !== 100) {
    throw new Error("Primary 2 allocation failed");
  }

  // 3. Add Substitute A
  console.log("\n3. Adding Substitute Beneficiary A (100%)...");
  const subA = await store.addOrUpdatePerson({
    fullName: "David Alan Whitfield",
    relationship: "Brother",
    nationality: "British",
    passportNumber: "GB11223344",
  });
  if (!subA) throw new Error("Failed to create subA");

  store.assignPersonToRole(subA.id, "BENEFICIARY_SUBSTITUTE", 1, 100);

  state = useOwaStore.getState();
  will = state.application?.wills.find((w) => w.willIndex === state.activeWillIndex);
  let substitutes = (will?.roleAssignments || []).filter(
    (ra) => ra.role === "BENEFICIARY_SUBSTITUTE"
  );
  console.log("Substitutes count:", substitutes.length, "Share:", substitutes[0]?.sharePercentage);
  if (substitutes.length !== 1 || substitutes[0]?.sharePercentage !== 100) {
    throw new Error("Substitute A allocation failed");
  }

  // 4. Test isSectionComplete("beneficiaries")
  console.log("\n4. Checking isSectionComplete('beneficiaries')...");
  const isComplete = state.isSectionComplete("beneficiaries");
  console.log("isSectionComplete('beneficiaries'):", isComplete);
  if (!isComplete) throw new Error("Section E should be valid with 2 primaries (100%) and 1 substitute (100%)");

  console.log("\n✓ ALL OWA STORE BENEFICIARY ACTIONS PASSED SUCCESSFULLY!");
}

runTest().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
