import * as fs from "fs";
import * as path from "path";

const dashboardPath = path.join(process.cwd(), "app/dashboard/page.tsx");
const content = fs.readFileSync(dashboardPath, "utf-8");

// Check 1: Must contain friendly support heading
if (!content.includes("Need assistance or have any doubts?")) {
  console.error("FAIL: Dashboard does not contain 'Need assistance or have any doubts?'");
  process.exit(1);
}

// Check 2: Must check if payment is fully complete and conditionally render milestone billing
if (!content.includes("isPaymentFullyComplete") && !content.includes("!isPaymentComplete")) {
  console.error("FAIL: Dashboard does not have conditional logic to hide milestone billing when fully paid");
  process.exit(1);
}

// Check 3: Active court registration filing status card when paid
if (!content.includes("ADJD Civil Court Filing In Progress") && !content.includes("Court Application Submitted & Active")) {
  console.error("FAIL: Dashboard does not have active court filing badge when paid");
  process.exit(1);
}

console.log("PASS: Dashboard billing card conditional logic and support copy verified");
