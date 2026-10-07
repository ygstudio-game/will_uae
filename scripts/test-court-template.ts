import React from "react";
import ReactDOMServer from "react-dom/server";
import { ADJDBilingualWillDocument } from "../components/court/ADJDBilingualWillDocument";
import { PersonData, RoleAssignmentData, WillData } from "../types/owa";

const mockTestator: PersonData = {
  id: "testator-1",
  applicationId: "app-1",
  fullName: "Daniel Michael Carter",
  arabicName: "دانيال مايكل كارتر",
  isArabicApproved: true,
  dob: "1985-06-15",
  nationality: "British",
  passportNumber: "GB98765432",
  emiratesId: "784-1985-1234567-1",
  isUaeResident: true,
  address: "Villa 14, Al Reef, Abu Dhabi, UAE",
  email: "daniel.carter@example.com",
  phone: "+971501234567",
};

const mockPrimaryExec: PersonData = {
  id: "exec-1",
  applicationId: "app-1",
  fullName: "Sarah Elizabeth Carter",
  arabicName: "سارة إليزابيث كارتر",
  isArabicApproved: true,
  dob: "1988-09-22",
  nationality: "British",
  passportNumber: "GB11223344",
  emiratesId: "784-1988-7654321-2",
  isUaeResident: true,
  address: "Apartment 402, Al Reem Island, Abu Dhabi, UAE",
};

const mockBeneficiary1: PersonData = {
  id: "ben-1",
  applicationId: "app-1",
  fullName: "Emma Claire Carter",
  arabicName: "إيما كلير كارتر",
  isArabicApproved: true,
  dob: "1987-03-10",
  nationality: "British",
  passportNumber: "GB55667788",
  emiratesId: "784-1987-9988776-3",
  isUaeResident: true,
  address: "Villa 14, Al Reef, Abu Dhabi, UAE",
};

const mockChild: PersonData = {
  id: "child-1",
  applicationId: "app-1",
  fullName: "Liam Carter",
  arabicName: "ليام كارتر",
  isArabicApproved: true,
  dob: "2018-04-12",
  nationality: "British",
  passportNumber: "GB33445566",
  isUaeResident: true,
  address: "Villa 14, Al Reef, Abu Dhabi, UAE",
};

const mockAssignments: RoleAssignmentData[] = [
  {
    id: "role-1",
    willId: "will-1",
    personId: "exec-1",
    role: "EXECUTOR_PRIMARY",
    appointmentOrder: 1,
    person: mockPrimaryExec,
  },
  {
    id: "role-2",
    willId: "will-1",
    personId: "ben-1",
    role: "BENEFICIARY",
    appointmentOrder: 1,
    sharePercentage: 100,
    person: mockBeneficiary1,
  },
  {
    id: "role-3",
    willId: "will-1",
    personId: "exec-1",
    role: "GUARDIAN_PERMANENT",
    appointmentOrder: 1,
    person: mockPrimaryExec,
  },
  {
    id: "role-4",
    willId: "will-1",
    personId: "child-1",
    role: "CHILD",
    appointmentOrder: 1,
    person: mockChild,
  },
];

const mockWill: WillData = {
  id: "will-1",
  applicationId: "app-1",
  willIndex: 1,
  versionTag: "ADJD-NM0723-07-03",
  testatorPersonId: "testator-1",
  testatorPerson: mockTestator,
  domicileCountry: "United Kingdom",
  declarationConfirmed: true,
  hasChildrenUnder18: true,
  isDraftConfirmed: false,
  roleAssignments: mockAssignments,
};

function runTest() {
  console.log("Rendering ADJDBilingualWillDocument...");
  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(ADJDBilingualWillDocument, {
      will: mockWill,
      testator: mockTestator,
      assignments: mockAssignments,
    })
  );

  // Assert official court code
  if (!html.includes("ADJD-NM0723-07-03")) {
    throw new Error("Missing official reference code ADJD-NM0723-07-03");
  }

  // Assert hotline
  if (!html.includes("600 599 799")) {
    throw new Error("Missing court hotline 600 599 799");
  }

  // Assert removal of the old survivorship introductory clause
  if (html.includes("does not survive me, but in such event only")) {
    throw new Error("Found prohibited introductory survivorship condition in Section 7!");
  }

  // Assert English & Arabic titles
  if (!html.includes("LAST WILL AND TESTAMENT") || !html.includes("نموذج وصيـة مدنيـة")) {
    throw new Error("Missing bilingual header titles");
  }

  // Assert Page 8 Domicile
  if (!html.includes("country of domicile is") || !html.includes("United Kingdom")) {
    throw new Error("Missing country of domicile declaration in Section 10");
  }

  console.log("✓ ADJDBilingualWillDocument passed all court template tests!");
}

runTest();
