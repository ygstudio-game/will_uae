import { chromium } from "playwright-core";
import * as fs from "fs";
import * as path from "path";

const outputDir = path.join(process.cwd(), "test-documents");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Find system browser
const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const executablePath = fs.existsSync(edgePath) ? edgePath : chromePath;

function getPassportHtml(data: {
  country: string;
  countryCode: string;
  passportNo: string;
  surname: string;
  givenNames: string;
  nationality: string;
  dob: string;
  sex: string;
  placeOfBirth: string;
  issueDate: string;
  expiryDate: string;
  mrz1: string;
  mrz2: string;
}) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body {
    margin: 0;
    padding: 24px;
    background: #0d1520;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .passport-card {
    width: 880px;
    height: 580px;
    background: #fbf8f2 linear-gradient(135deg, #fbf8f2 0%, #f4ede1 50%, #f8f3ea 100%);
    border-radius: 16px;
    box-shadow: 0 15px 35px rgba(0,0,0,0.4);
    position: relative;
    padding: 30px;
    box-sizing: border-box;
    border: 3px solid #d4c5b0;
    overflow: hidden;
  }
  .watermark {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-25deg);
    font-size: 56px;
    font-weight: 900;
    color: rgba(163, 126, 68, 0.12);
    letter-spacing: 6px;
    white-space: nowrap;
    pointer-events: none;
    text-transform: uppercase;
  }
  .header {
    border-bottom: 2px solid #a37e44;
    padding-bottom: 12px;
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .header-left {
    font-size: 13px;
    font-weight: 800;
    letter-spacing: 2px;
    color: #0b1528;
    text-transform: uppercase;
  }
  .header-right {
    font-size: 16px;
    font-weight: 800;
    color: #a37e44;
    letter-spacing: 1px;
  }
  .main-body {
    display: flex;
    gap: 28px;
  }
  .photo-box {
    width: 175px;
    height: 235px;
    background: #e8e2d5;
    border: 2px solid #c2b7a3;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #635b4d;
    position: relative;
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.06);
  }
  .avatar-icon {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: #b5aa96;
    margin-bottom: 12px;
  }
  .specimen-badge {
    position: absolute;
    bottom: 8px;
    background: #0b1528;
    color: #fff;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1px;
    padding: 3px 10px;
    border-radius: 4px;
  }
  .data-grid {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 12px 16px;
  }
  .data-item {
    display: flex;
    flex-direction: column;
  }
  .data-item.span-2 {
    grid-column: span 2;
  }
  .data-item.span-3 {
    grid-column: span 3;
  }
  .label {
    font-size: 9px;
    font-weight: 700;
    color: #7d7261;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 2px;
  }
  .value {
    font-size: 15px;
    font-weight: 800;
    color: #0b1528;
    letter-spacing: 0.5px;
  }
  .value.highlight {
    color: #a37e44;
    font-size: 16px;
  }
  .mrz-container {
    position: absolute;
    bottom: 24px;
    left: 30px;
    right: 30px;
    background: rgba(255,255,255,0.85);
    padding: 12px 18px;
    border-radius: 6px;
    border: 1px solid #dcd4c6;
    font-family: "Courier New", Courier, monospace;
    font-size: 18px;
    font-weight: 700;
    line-height: 1.35;
    letter-spacing: 3.5px;
    color: #111;
  }
</style>
</head>
<body>
  <div class="passport-card">
    <div class="watermark">OFFICIAL SPECIMEN · COURT TEST</div>
    <div class="header">
      <div class="header-left">${data.country} · PASSPORT / PASSEPORT</div>
      <div class="header-right">${data.countryCode}</div>
    </div>
    <div class="main-body">
      <div class="photo-box">
        <div class="avatar-icon"></div>
        <div style="font-size: 11px; font-weight: 700; text-align: center;">PHOTO SPECIMEN</div>
        <div class="specimen-badge">TEST SAMPLE</div>
      </div>
      <div class="data-grid">
        <div class="data-item">
          <div class="label">Type / Type</div>
          <div class="value">P</div>
        </div>
        <div class="data-item">
          <div class="label">Country Code</div>
          <div class="value">${data.countryCode}</div>
        </div>
        <div class="data-item">
          <div class="label">Passport No. / N° de passeport</div>
          <div class="value highlight">${data.passportNo}</div>
        </div>
        <div class="data-item span-3">
          <div class="label">Surname / Nom</div>
          <div class="value">${data.surname}</div>
        </div>
        <div class="data-item span-3">
          <div class="label">Given Names / Prénoms</div>
          <div class="value">${data.givenNames}</div>
        </div>
        <div class="data-item span-2">
          <div class="label">Nationality / Nationalité</div>
          <div class="value">${data.nationality}</div>
        </div>
        <div class="data-item">
          <div class="label">Date of Birth / Date de naissance</div>
          <div class="value">${data.dob}</div>
        </div>
        <div class="data-item">
          <div class="label">Sex / Sexe</div>
          <div class="value">${data.sex}</div>
        </div>
        <div class="data-item">
          <div class="label">Place of Birth / Lieu de naissance</div>
          <div class="value">${data.placeOfBirth}</div>
        </div>
        <div class="data-item">
          <div class="label">Date of Issue / Délivrance</div>
          <div class="value">${data.issueDate}</div>
        </div>
        <div class="data-item">
          <div class="label">Date of Expiry / Expiration</div>
          <div class="value highlight">${data.expiryDate}</div>
        </div>
      </div>
    </div>
    <div class="mrz-container">
      <div>${data.mrz1}</div>
      <div>${data.mrz2}</div>
    </div>
  </div>
</body>
</html>`;
}

function getEmiratesIdHtml(data: {
  idNumber: string;
  fullName: string;
  arabicName: string;
  nationalityEn: string;
  nationalityAr: string;
  dob: string;
  expiryDate: string;
  sex: string;
}) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body {
    margin: 0;
    padding: 24px;
    background: #0d1520;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .id-card {
    width: 820px;
    height: 520px;
    background: #fdfbf7 linear-gradient(135deg, #fdfbf7 0%, #f4eee2 50%, #faf5eb 100%);
    border-radius: 18px;
    border: 3px solid #d4c19c;
    box-shadow: 0 16px 36px rgba(0,0,0,0.4);
    position: relative;
    padding: 24px 30px;
    box-sizing: border-box;
    overflow: hidden;
  }
  .falcon-watermark {
    position: absolute;
    right: 25px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 110px;
    opacity: 0.08;
    font-weight: bold;
    color: #a37e44;
    pointer-events: none;
  }
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid #a37e44;
    padding-bottom: 10px;
    margin-bottom: 16px;
  }
  .header-titles {
    flex: 1;
  }
  .uae-title-ar {
    font-family: 'Amiri', 'Traditional Arabic', serif;
    font-size: 18px;
    font-weight: 700;
    color: #0b1528;
    direction: rtl;
  }
  .uae-title-en {
    font-size: 12px;
    font-weight: 800;
    color: #0b1528;
    letter-spacing: 1.5px;
  }
  .icp-subtitle {
    font-size: 9px;
    font-weight: 600;
    color: #a37e44;
    letter-spacing: 0.5px;
  }
  .emblem {
    width: 48px;
    height: 48px;
    background: #a37e44;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-weight: 900;
    font-size: 18px;
    box-shadow: 0 2px 6px rgba(163,126,68,0.4);
  }
  .id-row {
    background: #0b1528;
    color: #fff;
    padding: 8px 16px;
    border-radius: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  .id-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1px;
    color: #d4c5b0;
  }
  .id-number {
    font-family: "Courier New", monospace;
    font-size: 24px;
    font-weight: 800;
    letter-spacing: 2px;
    color: #f7d598;
  }
  .card-content {
    display: flex;
    gap: 26px;
  }
  .photo-area {
    width: 160px;
    height: 215px;
    background: #e8e2d4;
    border: 2px solid #c9bda5;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
  }
  .chip-graphic {
    width: 45px;
    height: 35px;
    background: #d4af37 linear-gradient(135deg, #d4af37, #f3e5ab);
    border: 1px solid #997a15;
    border-radius: 5px;
    margin-bottom: 16px;
  }
  .details-area {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px 20px;
  }
  .field {
    display: flex;
    flex-direction: column;
  }
  .field.full {
    grid-column: span 2;
  }
  .field-label {
    font-size: 9px;
    font-weight: 700;
    color: #7d7261;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .field-value {
    font-size: 16px;
    font-weight: 800;
    color: #0b1528;
    margin-top: 2px;
  }
  .field-value.arabic {
    font-family: 'Amiri', 'Traditional Arabic', serif;
    font-size: 20px;
    direction: rtl;
    text-align: right;
    color: #0b1528;
  }
  .specimen-footer {
    position: absolute;
    bottom: 16px;
    left: 30px;
    right: 30px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px dashed #c9bda5;
    padding-top: 8px;
    font-size: 10px;
    color: #a37e44;
    font-weight: 700;
  }
</style>
</head>
<body>
  <div class="id-card">
    <div class="falcon-watermark">UAE</div>
    <div class="card-header">
      <div class="header-titles">
        <div class="uae-title-ar">الإمارات العربية المتحدة · بطاقة الهوية</div>
        <div class="uae-title-en">UNITED ARAB EMIRATES · IDENTITY CARD</div>
        <div class="icp-subtitle">FEDERAL AUTHORITY FOR IDENTITY, CITIZENSHIP, CUSTOMS & PORT SECURITY</div>
      </div>
      <div class="emblem">★</div>
    </div>
    <div class="id-row">
      <div class="id-label">IDENTITY NUMBER / رقم الهوية</div>
      <div class="id-number">${data.idNumber}</div>
    </div>
    <div class="card-content">
      <div class="photo-area">
        <div class="chip-graphic"></div>
        <div style="font-size: 11px; font-weight: 700; color: #5a5245;">PHOTO</div>
        <div style="font-size: 10px; font-weight: 800; color: #a37e44; margin-top: 4px;">SPECIMEN</div>
      </div>
      <div class="details-area">
        <div class="field full">
          <div class="field-label">Full Name / الاسم الكامل</div>
          <div class="field-value">${data.fullName}</div>
        </div>
        <div class="field full">
          <div class="field-label" style="text-align: right;">الاسم باللغة العربية</div>
          <div class="field-value arabic">${data.arabicName}</div>
        </div>
        <div class="field">
          <div class="field-label">Nationality / الجنسية</div>
          <div class="field-value">${data.nationalityEn}</div>
        </div>
        <div class="field">
          <div class="field-label">Date of Birth / تاريخ الميلاد</div>
          <div class="field-value">${data.dob}</div>
        </div>
        <div class="field">
          <div class="field-label">Sex / الجنس</div>
          <div class="field-value">${data.sex}</div>
        </div>
        <div class="field">
          <div class="field-label">Expiry Date / تاريخ الانتهاء</div>
          <div class="field-value" style="color: #a37e44;">${data.expiryDate}</div>
        </div>
      </div>
    </div>
    <div class="specimen-footer">
      <span>OFFICIAL TEST SPECIMEN · FOR COURT WILL PREPARATION</span>
      <span>FEDERAL IDENTITY SYSTEM · UAE ICP VERIFIED</span>
    </div>
  </div>
</body>
</html>`;
}

function getProofOfAddressHtml() {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body {
    margin: 0;
    padding: 30px;
    background: #ffffff;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
    color: #1a202c;
  }
  .invoice-box {
    max-width: 800px;
    margin: auto;
    padding: 35px;
    border: 2px solid #e2e8f0;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    background: #fff;
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 3px solid #0b1528;
    padding-bottom: 20px;
    margin-bottom: 25px;
  }
  .brand-title {
    font-size: 22px;
    font-weight: 800;
    color: #0b1528;
  }
  .brand-sub {
    font-size: 13px;
    color: #a37e44;
    font-weight: 600;
    margin-top: 4px;
  }
  .bill-badge {
    background: #0b1528;
    color: #fff;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    text-align: right;
  }
  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 30px;
    background: #f8fafc;
    padding: 20px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
  }
  .info-block h4 {
    margin: 0 0 8px 0;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #64748b;
  }
  .info-block p {
    margin: 0;
    font-size: 14px;
    font-weight: 700;
    color: #0f172a;
    line-height: 1.4;
  }
  .highlight-address {
    color: #0b1528;
    font-size: 15px;
    font-weight: 800;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 25px;
  }
  th {
    background: #f1f5f9;
    padding: 10px 14px;
    text-align: left;
    font-size: 11px;
    font-weight: 700;
    color: #475569;
    text-transform: uppercase;
    border-bottom: 2px solid #cbd5e1;
  }
  td {
    padding: 12px 14px;
    border-bottom: 1px solid #e2e8f0;
    font-size: 13px;
  }
  .total-row {
    font-size: 16px;
    font-weight: 800;
    color: #0b1528;
  }
  .footer-note {
    border-top: 1px solid #e2e8f0;
    padding-top: 15px;
    font-size: 11px;
    color: #64748b;
    line-height: 1.5;
  }
</style>
</head>
<body>
  <div class="invoice-box">
    <div class="header">
      <div>
        <div class="brand-title">Abu Dhabi Distribution Company (ADDC)</div>
        <div class="brand-sub">شركة أبوظبي للتوزيع · Water & Electricity Account Statement</div>
      </div>
      <div class="bill-badge">
        PROOF OF RESIDENCE<br>
        <span style="font-size: 10px; color: #f7d598;">TAWTHEEQ CERTIFIED</span>
      </div>
    </div>

    <div class="info-grid">
      <div class="info-block">
        <h4>Customer / Account Holder</h4>
        <p>Daniel Michael Carter</p>
        <p style="font-weight: 500; font-size: 12px; color: #475569;">Account ID: ADDC-98412034-01</p>
        <p style="font-weight: 500; font-size: 12px; color: #475569;">Bill Issue Date: 01 October 2026</p>
      </div>
      <div class="info-block">
        <h4>Registered Premises Residential Address</h4>
        <p class="highlight-address">Villa 14, Saadiyat Beach Residences</p>
        <p class="highlight-address">Saadiyat Island, Abu Dhabi, UAE</p>
        <p style="font-weight: 600; font-size: 12px; color: #a37e44; margin-top: 4px;">Tawtheeq Tenancy Contract: AD-TWQ-2026-98412</p>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th>Premises Type</th>
          <th>Billing Period</th>
          <th style="text-align: right;">Amount (AED)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Residential Electricity Service</td>
          <td>Villa 14, Saadiyat Beach</td>
          <td>01/09/2026 - 30/09/2026</td>
          <td style="text-align: right; font-weight: 600;">850.50</td>
        </tr>
        <tr>
          <td>Residential Water Consumption</td>
          <td>Villa 14, Saadiyat Beach</td>
          <td>01/09/2026 - 30/09/2026</td>
          <td style="text-align: right; font-weight: 600;">570.00</td>
        </tr>
        <tr class="total-row">
          <td colspan="3">Total Current Charges (Paid in Full)</td>
          <td style="text-align: right; color: #0b1528;">AED 1,420.50</td>
        </tr>
      </tbody>
    </table>

    <div class="footer-note">
      This utility statement serves as an official verified residential address document for the Abu Dhabi Judicial Department (ADJD) Non-Muslim Civil Family Court will registration and notary public submissions under Law No. 14 of 2021.
    </div>
  </div>
</body>
</html>`;
}

async function generateAllTestDocuments() {
  console.log("======================================================================");
  console.log("   Generating High-Resolution Court Test Documents Suite              ");
  console.log(`   Output Folder: ${outputDir}`);
  console.log("======================================================================");

  const browser = await chromium.launch({
    executablePath,
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1200, height: 800 },
    deviceScaleFactor: 2, // Crisp 2x retina images for OCR clarity
  });

  const page = await context.newPage();

  // 1. Testator (Daniel Michael Carter)
  console.log("--> Generating Testator documents...");
  await page.setContent(
    getPassportHtml({
      country: "UNITED KINGDOM OF GREAT BRITAIN AND NORTHERN IRELAND",
      countryCode: "GBR",
      passportNo: "GBR98412034",
      surname: "CARTER",
      givenNames: "DANIEL MICHAEL",
      nationality: "BRITISH CITIZEN",
      dob: "14 MAY 1982",
      sex: "M",
      placeOfBirth: "LONDON",
      issueDate: "10 JAN 2021",
      expiryDate: "10 JAN 2031",
      mrz1: "P<GBRCARTER<<DANIEL<MICHAEL<<<<<<<<<<<<<<<<<",
      mrz2: "98412034<4GBR8205148M3101104<<<<<<<<<<<<<<02",
    })
  );
  await page.locator(".passport-card").screenshot({
    path: path.join(outputDir, "01_testator_passport_daniel_carter.png"),
  });

  await page.setContent(
    getEmiratesIdHtml({
      idNumber: "784-1982-3920194-1",
      fullName: "Daniel Michael Carter",
      arabicName: "دانيال مايكل كارتر",
      nationalityEn: "United Kingdom",
      nationalityAr: "المملكة المتحدة",
      dob: "14/05/1982",
      expiryDate: "25/08/2028",
      sex: "M",
    })
  );
  await page.locator(".id-card").screenshot({
    path: path.join(outputDir, "02_testator_emirates_id_daniel_carter.png"),
  });

  await page.setContent(getProofOfAddressHtml());
  await page.pdf({
    path: path.join(outputDir, "03_testator_proof_of_address_saadiyat.pdf"),
    format: "A4",
    printBackground: true,
  });

  // 2. Spouse (Sarah Claire Carter)
  console.log("--> Generating Spouse documents...");
  await page.setContent(
    getPassportHtml({
      country: "UNITED KINGDOM OF GREAT BRITAIN AND NORTHERN IRELAND",
      countryCode: "GBR",
      passportNo: "GBR87321045",
      surname: "CARTER",
      givenNames: "SARAH CLAIRE",
      nationality: "BRITISH CITIZEN",
      dob: "22 AUG 1988",
      sex: "F",
      placeOfBirth: "MANCHESTER",
      issueDate: "15 MAR 2021",
      expiryDate: "15 MAR 2031",
      mrz1: "P<GBRCARTER<<SARAH<CLAIRE<<<<<<<<<<<<<<<<<<",
      mrz2: "87321045<8GBR8808226F3103152<<<<<<<<<<<<<<04",
    })
  );
  await page.locator(".passport-card").screenshot({
    path: path.join(outputDir, "04_spouse_passport_sarah_carter.png"),
  });

  await page.setContent(
    getEmiratesIdHtml({
      idNumber: "784-1988-1029384-2",
      fullName: "Sarah Claire Carter",
      arabicName: "سارة كلير كارتر",
      nationalityEn: "United Kingdom",
      nationalityAr: "المملكة المتحدة",
      dob: "22/08/1988",
      expiryDate: "15/04/2029",
      sex: "F",
    })
  );
  await page.locator(".id-card").screenshot({
    path: path.join(outputDir, "05_spouse_emirates_id_sarah_carter.png"),
  });

  // 3. Child 1 (Liam Alexander Carter - Age 8)
  console.log("--> Generating Child 1 documents...");
  await page.setContent(
    getPassportHtml({
      country: "UNITED KINGDOM OF GREAT BRITAIN AND NORTHERN IRELAND",
      countryCode: "GBR",
      passportNo: "GBR65192837",
      surname: "CARTER",
      givenNames: "LIAM ALEXANDER",
      nationality: "BRITISH CITIZEN",
      dob: "05 OCT 2018",
      sex: "M",
      placeOfBirth: "ABU DHABI",
      issueDate: "20 OCT 2023",
      expiryDate: "20 OCT 2028",
      mrz1: "P<GBRCARTER<<LIAM<ALEXANDER<<<<<<<<<<<<<<<<<",
      mrz2: "65192837<1GBR1810052M2810208<<<<<<<<<<<<<<06",
    })
  );
  await page.locator(".passport-card").screenshot({
    path: path.join(outputDir, "06_child1_passport_liam_carter.png"),
  });

  await page.setContent(
    getEmiratesIdHtml({
      idNumber: "784-2018-9182736-5",
      fullName: "Liam Alexander Carter",
      arabicName: "ليام ألكسندر كارتر",
      nationalityEn: "United Kingdom",
      nationalityAr: "المملكة المتحدة",
      dob: "05/10/2018",
      expiryDate: "20/10/2028",
      sex: "M",
    })
  );
  await page.locator(".id-card").screenshot({
    path: path.join(outputDir, "07_child1_emirates_id_liam_carter.png"),
  });

  // 4. Child 2 (Emily Rose Carter - Age 5)
  console.log("--> Generating Child 2 documents...");
  await page.setContent(
    getPassportHtml({
      country: "UNITED KINGDOM OF GREAT BRITAIN AND NORTHERN IRELAND",
      countryCode: "GBR",
      passportNo: "GBR49281726",
      surname: "CARTER",
      givenNames: "EMILY ROSE",
      nationality: "BRITISH CITIZEN",
      dob: "18 MAR 2021",
      sex: "F",
      placeOfBirth: "ABU DHABI",
      issueDate: "25 MAR 2023",
      expiryDate: "25 MAR 2028",
      mrz1: "P<GBRCARTER<<EMILY<ROSE<<<<<<<<<<<<<<<<<<<<<",
      mrz2: "49281726<6GBR2103185F2803254<<<<<<<<<<<<<<08",
    })
  );
  await page.locator(".passport-card").screenshot({
    path: path.join(outputDir, "08_child2_passport_emily_carter.png"),
  });

  await page.setContent(
    getEmiratesIdHtml({
      idNumber: "784-2021-8273645-8",
      fullName: "Emily Rose Carter",
      arabicName: "إيميلي روز كارتر",
      nationalityEn: "United Kingdom",
      nationalityAr: "المملكة المتحدة",
      dob: "18/03/2021",
      expiryDate: "25/03/2028",
      sex: "F",
    })
  );
  await page.locator(".id-card").screenshot({
    path: path.join(outputDir, "09_child2_emirates_id_emily_carter.png"),
  });

  // 5. Primary Executor (David Alan Whitfield - Canada / UAE)
  console.log("--> Generating Primary Executor documents...");
  await page.setContent(
    getPassportHtml({
      country: "CANADA",
      countryCode: "CAN",
      passportNo: "CAN82910482",
      surname: "WHITFIELD",
      givenNames: "DAVID ALAN",
      nationality: "CANADIAN / CANADIENNE",
      dob: "11 NOV 1980",
      sex: "M",
      placeOfBirth: "TORONTO",
      issueDate: "12 MAY 2021",
      expiryDate: "12 MAY 2031",
      mrz1: "P<CANWHITFIELD<<DAVID<ALAN<<<<<<<<<<<<<<<<<<",
      mrz2: "82910482<3CAN8011116M3105128<<<<<<<<<<<<<<10",
    })
  );
  await page.locator(".passport-card").screenshot({
    path: path.join(outputDir, "10_primary_executor_passport_david_whitfield.png"),
  });

  await page.setContent(
    getEmiratesIdHtml({
      idNumber: "784-1980-4920182-3",
      fullName: "David Alan Whitfield",
      arabicName: "ديفيد ألان ويتفيلد",
      nationalityEn: "Canada",
      nationalityAr: "كندا",
      dob: "11/11/1980",
      expiryDate: "05/06/2029",
      sex: "M",
    })
  );
  await page.locator(".id-card").screenshot({
    path: path.join(outputDir, "11_primary_executor_emirates_id_david_whitfield.png"),
  });

  // 6. Substitute Executor (Marcus James Vance - Australia / UAE)
  console.log("--> Generating Substitute Executor documents...");
  await page.setContent(
    getPassportHtml({
      country: "AUSTRALIA",
      countryCode: "AUS",
      passportNo: "AUS51029384",
      surname: "VANCE",
      givenNames: "MARCUS JAMES",
      nationality: "AUSTRALIAN",
      dob: "03 FEB 1983",
      sex: "M",
      placeOfBirth: "SYDNEY",
      issueDate: "18 AUG 2021",
      expiryDate: "18 AUG 2031",
      mrz1: "P<AUSVANCE<<MARCUS<JAMES<<<<<<<<<<<<<<<<<<<<",
      mrz2: "51029384<7AUS8302035M3108182<<<<<<<<<<<<<<12",
    })
  );
  await page.locator(".passport-card").screenshot({
    path: path.join(outputDir, "12_substitute_executor_passport_marcus_vance.png"),
  });

  await page.setContent(
    getEmiratesIdHtml({
      idNumber: "784-1983-5019283-7",
      fullName: "Marcus James Vance",
      arabicName: "ماركوس جيمس فانس",
      nationalityEn: "Australia",
      nationalityAr: "أستراليا",
      dob: "03/02/1983",
      expiryDate: "14/09/2028",
      sex: "M",
    })
  );
  await page.locator(".id-card").screenshot({
    path: path.join(outputDir, "13_substitute_executor_emirates_id_marcus_vance.png"),
  });

  // 7. Substitute Guardian (James Robert Carter - Brother, UK Overseas)
  console.log("--> Generating Substitute Guardian (Overseas Brother) documents...");
  await page.setContent(
    getPassportHtml({
      country: "UNITED KINGDOM OF GREAT BRITAIN AND NORTHERN IRELAND",
      countryCode: "GBR",
      passportNo: "GBR31920485",
      surname: "CARTER",
      givenNames: "JAMES ROBERT",
      nationality: "BRITISH CITIZEN",
      dob: "19 JUN 1985",
      sex: "M",
      placeOfBirth: "LONDON",
      issueDate: "04 APR 2021",
      expiryDate: "04 APR 2031",
      mrz1: "P<GBRCARTER<<JAMES<ROBERT<<<<<<<<<<<<<<<<<<<",
      mrz2: "31920485<2GBR8506194M3104046<<<<<<<<<<<<<<14",
    })
  );
  await page.locator(".passport-card").screenshot({
    path: path.join(outputDir, "14_substitute_guardian_overseas_brother_james_carter_passport.png"),
  });

  // 8. Temporary Guardian (Oliver Henry Brooks - New Zealand / UAE)
  console.log("--> Generating Temporary Guardian (UAE Resident) documents...");
  await page.setContent(
    getPassportHtml({
      country: "NEW ZEALAND",
      countryCode: "NZL",
      passportNo: "NZL71928340",
      surname: "BROOKS",
      givenNames: "OLIVER HENRY",
      nationality: "NEW ZEALAND CITIZEN",
      dob: "14 DEC 1986",
      sex: "M",
      placeOfBirth: "AUCKLAND",
      issueDate: "08 JUL 2021",
      expiryDate: "08 JUL 2031",
      mrz1: "P<NZLBROOKS<<OLIVER<HENRY<<<<<<<<<<<<<<<<<<<",
      mrz2: "71928340<9NZL8612143M3107085<<<<<<<<<<<<<<16",
    })
  );
  await page.locator(".passport-card").screenshot({
    path: path.join(outputDir, "15_temporary_guardian_uae_oliver_brooks_passport.png"),
  });

  await page.setContent(
    getEmiratesIdHtml({
      idNumber: "784-1986-7192834-9",
      fullName: "Oliver Henry Brooks",
      arabicName: "أوليفر هنري بروكس",
      nationalityEn: "New Zealand",
      nationalityAr: "نيوزيلندا",
      dob: "14/12/1986",
      expiryDate: "20/11/2029",
      sex: "M",
    })
  );
  await page.locator(".id-card").screenshot({
    path: path.join(outputDir, "16_temporary_guardian_uae_oliver_brooks_emirates_id.png"),
  });

  await browser.close();
  console.log("======================================================================");
  console.log("🎉 ALL 16 COURT TEST DOCUMENTS GENERATED IN: test-documents/");
  console.log("======================================================================");
}

generateAllTestDocuments().catch((err) => {
  console.error("Test document generation failed:", err);
  process.exit(1);
});
