# Test Documents & Legal Dataset Reference Suite
## Project: UAE Will Preparation Platform (ADJD Non-Muslim Will)

This directory contains court-compliant test data, profiles, and ready-to-upload mock documents for testing the complete end-to-end flow of the **UAE Will Preparation Platform (ADJD Civil Family Court)**.

---

## 📋 Quick Test Cheat Sheet (Copy & Paste per Wizard Step)

### Section A · Testator Details & Documents (`/wizard/details`)
- **Document to Upload**: `01_testator_passport_daniel_carter.png` or `01_testator_passport_daniel_carter.pdf`
- **Emirates ID to Upload**: `02_testator_emirates_id_daniel_carter.png`
- **Proof of Address to Upload**: `03_testator_proof_of_address_saadiyat.pdf`
- **Full Legal Name**: `Daniel Michael Carter`
- **Arabic Name**: `دانيال مايكل كارتر` *(auto-populates on blur or OCR)*
- **Date of Birth**: `1982-05-14`
- **Nationality**: `British`
- **Passport Number**: `GBR98412034`
- **Emirates ID**: `784-1982-3920194-1`
- **UAE Resident**: `Yes`
- **Residential Address**: `Villa 14, Saadiyat Beach Residences, Saadiyat Island, Abu Dhabi, UAE`
- **Country of Domicile**: `United Kingdom`
- **Email**: `daniel.carter@example.com`
- **Phone**: `+971 50 984 1203`

---

### Section B · Children (`/wizard/children`)
Select **"Yes, I have minor children"** and test both children:

#### Child 1 (Liam)
- **Document to Upload**: `06_child1_passport_liam_carter.png`
- **Emirates ID (Optional)**: `07_child1_emirates_id_liam_carter.png`
- **Full Legal Name**: `Liam Alexander Carter`
- **Arabic Name**: `ليام ألكسندر كارتر`
- **Date of Birth**: `2018-10-05`
- **Nationality**: `British`
- **Passport Number**: `GBR65192837`
- **Live in the UAE?**: `Yes, In UAE`
- **Emirates ID**: `784-2018-9182736-5`

#### Child 2 (Emily)
- **Document to Upload**: `08_child2_passport_emily_carter.png`
- **Emirates ID (Optional)**: `09_child2_emirates_id_emily_carter.png`
- **Full Legal Name**: `Emily Rose Carter`
- **Arabic Name**: `إيميلي روز كارتر`
- **Date of Birth**: `2021-03-18`
- **Nationality**: `British`
- **Passport Number**: `GBR49281726`
- **Live in the UAE?**: `Yes, In UAE`
- **Emirates ID**: `784-2021-8273645-8`

---

### Section C · Executors (`/wizard/executors`)

#### Slot 1: Primary Executor
- **Document to Upload**: `10_primary_executor_passport_david_whitfield.png`
- **Emirates ID**: `11_primary_executor_emirates_id_david_whitfield.png`
- **Full Legal Name**: `David Alan Whitfield`
- **Arabic Name**: `ديفيد ألان ويتفيلد`
- **Relationship**: `Colleague / Trusted Friend`
- **Nationality**: `Canadian`
- **Passport Number**: `CAN82910482`
- **UAE Resident**: `Yes`
- **Residential Address**: `Apartment 1204, Oceanscape Tower, Al Reem Island, Abu Dhabi, UAE`

#### Slot 2: Substitute Executor
- **Document to Upload**: `12_substitute_executor_passport_marcus_vance.png`
- **Emirates ID**: `13_substitute_executor_emirates_id_marcus_vance.png`
- **Full Legal Name**: `Marcus James Vance`
- **Arabic Name**: `ماركوس جيمس فانس`
- **Relationship**: `Senior Financial Associate`
- **Nationality**: `Australian`
- **Passport Number**: `AUS51029384`
- **UAE Resident**: `Yes`
- **Residential Address**: `Unit 402, Marina Gate 1, Dubai Marina, Dubai, UAE`

---

### Section D · Guardians (`/wizard/guardians`)

#### Slot 1: Permanent Guardian
- **Action**: Click **"Appoint Surviving Spouse"** (1-click preset)
- **Assignee**: `Sarah Claire Carter` *(Spouse)*
- **Passport Number**: `GBR87321045`

#### Slot 2: Substitute Permanent Guardian (Non-UAE Family Member)
- **Document to Upload**: `14_substitute_guardian_overseas_brother_james_carter_passport.png`
- **Full Legal Name**: `James Robert Carter`
- **Arabic Name**: `جيمس روبرت كارتر`
- **Relationship**: `Brother`
- **Nationality**: `British`
- **Passport Number**: `GBR31920485`
- **UAE Resident**: `No (Overseas)`
- **Residential Address**: `42 Kensington High Street, London W8 5SA, United Kingdom`

#### Slot 3: Temporary / Interim Guardian (Local UAE Resident)
- **Document to Upload**: `15_temporary_guardian_uae_oliver_brooks_passport.png`
- **Emirates ID**: `16_temporary_guardian_uae_oliver_brooks_emirates_id.png`
- **Full Legal Name**: `Oliver Henry Brooks`
- **Arabic Name**: `أوليفر هنري بروكس`
- **Relationship**: `UAE Resident Family Friend`
- **Nationality**: `New Zealand`
- **Passport Number**: `NZL71928340`
- **UAE Resident**: `Yes` *(Mandatory under ADJD Clause 6)*
- **Residential Address**: `Apartment 803, Building 4, Al Muneera, Al Raha Beach, Abu Dhabi, UAE`

---

### Section E · Beneficiaries (`/wizard/beneficiaries`)

#### Sub-Page 1: Primary Beneficiary
- **Action**: Click **"Appoint Spouse as 100% Primary Beneficiary"** (1-click preset)
- **Beneficiary**: `Sarah Claire Carter` (100.0%)

#### Sub-Page 2: Shared Substitutes Group
- **Substitute A (50%)**: `Liam Alexander Carter` *(Son - 50.0%)*
- **Substitute B (50%)**: `Emily Rose Carter` *(Daughter - 50.0%)*

---

### Section F · Review Draft & Verification (`/wizard/review`)
- Verify all **5 Pre-Court Registration Readiness Audit Cards** show green checkmarks:
  1. `Testator Details` (Verified personal details)
  2. `Court Documents` (3 files attached: Passport, Emirates ID, Proof of Address)
  3. `Primary Executor` (Clause 4 valid)
  4. `Primary (100%)` (100% fully allocated to Spouse)
  5. `Substitute (100%)` (100% divided between 2 children)
- Verify that **Attached Evidence Badges** display each document with OCR verification tags.
