import nodemailer from "nodemailer";

/**
 * Hostinger SMTP Transporter Singleton
 */
const host = process.env.SMTP_HOST || "smtp.hostinger.com";
const port = Number(process.env.SMTP_PORT || 465);
const secure = process.env.SMTP_SECURE === "true" || port === 465;
const user = process.env.SMTP_USER || "noreply@onlinewillsadvisor.com";
const pass = process.env.SMTP_PASS || "";
const defaultFrom = process.env.SMTP_FROM || `"Online Wills Advisor" <${user}>`;
const supportEmail = process.env.SUPPORT_EMAIL || "support@onlinewillsadvisor.com";

export const transporter = nodemailer.createTransport({
  host,
  port,
  secure,
  auth: {
    user,
    pass,
  },
  tls: {
    rejectUnauthorized: true,
  },
});

/**
 * Editorial Luxury Master HTML Template
 * Follows AGENTS.md Design Guidelines:
 * - Canvas: #FBF9F5
 * - Primary Navy: #0B1528
 * - Warm Bronze: #A37E44
 * - Borders: #E5E0D8
 * - Legal Entity: SP LEGAL FZ LLE
 */
function wrapLuxuryEmail(content: string, previewText: string = ""): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Online Wills Advisor</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #FBF9F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  ${previewText ? `<div style="display:none;font-size:1px;color:#FBF9F5;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${previewText}</div>` : ""}
  
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #FBF9F5; width: 100%;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; width: 100%; background-color: #FFFFFF; border: 1px solid #E5E0D8; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 16px rgba(11, 21, 40, 0.04);">
          
          <!-- Header Bar with Obsidian Navy & Warm Bronze Accents -->
          <tr>
            <td style="background-color: #0B1528; padding: 28px 32px; text-align: left; border-bottom: 3px solid #A37E44;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #D4B896; font-weight: 600; display: block; margin-bottom: 4px;">
                      ADJD Civil Family Court Will Preparation
                    </span>
                    <h1 style="margin: 0; font-family: Georgia, 'Playfair Display', serif; font-size: 24px; color: #FFFFFF; font-weight: 700; letter-spacing: -0.5px;">
                      Online Wills Advisor
                    </h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body Content -->
          <tr>
            <td style="padding: 36px 32px 32px 32px; color: #2D3748; font-size: 15px; line-height: 1.6;">
              ${content}
            </td>
          </tr>

          <!-- Footer Information & Statutory Notice -->
          <tr>
            <td style="background-color: #F7F5F0; padding: 24px 32px; border-top: 1px solid #E5E0D8; color: #718096; font-size: 12px; line-height: 1.5;">
              <p style="margin: 0 0 8px 0; color: #4A5568; font-weight: 600;">
                Online Wills Advisor · SP LEGAL FZ LLE
              </p>
              <p style="margin: 0 0 8px 0;">
                Operated by SP LEGAL FZ LLE, a legal consultancy licensed in Fujairah Creative City. A legal expert reviews every Will prior to ADJD submission.
              </p>
              <p style="margin: 0; color: #A0AEC0;">
                Support: <a href="mailto:${supportEmail}" style="color: #A37E44; text-decoration: none;">${supportEmail}</a> · Confidential Legal Communication
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * 1. Send 6-Digit Email Verification OTP
 */
export async function sendOTPEmail(email: string, otp: string): Promise<boolean> {
  const preview = `Your verification code is ${otp}. Valid for 15 minutes.`;
  const html = wrapLuxuryEmail(`
    <p style="margin-top: 0; font-size: 16px; color: #0B1528; font-weight: 600;">
      Email Verification Code
    </p>
    <p>
      Please enter the following 6-digit security code to verify your email address and secure your Will application on Online Wills Advisor:
    </p>

    <div style="margin: 28px 0; text-align: center;">
      <div style="display: inline-block; background-color: #FBF9F5; border: 2px dashed #A37E44; border-radius: 10px; padding: 16px 32px;">
        <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 700; letter-spacing: 10px; color: #0B1528;">
          ${otp}
        </span>
      </div>
    </div>

    <p style="font-size: 13.5px; color: #718096; line-height: 1.5;">
      ⏰ <strong>This security code expires in 15 minutes.</strong><br/>
      🔒 For your security, never share this code with anyone. Our legal advisors will never ask for your verification code.
    </p>
    
    <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #E5E0D8; font-size: 13px; color: #718096;">
      If you did not request this code, you can safely ignore this email. No changes will be made to your account.
    </div>
  `, preview);

  try {
    const info = await transporter.sendMail({
      from: defaultFrom,
      to: email,
      subject: `Your Verification Code: ${otp} · Online Wills Advisor`,
      html,
    });
    console.log(`[EMAIL-OTP] Sent code to ${email}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`[EMAIL-OTP-ERROR] Failed to send OTP to ${email}:`, error);
    return false;
  }
}

/**
 * 2. Send Welcome Onboarding Email (Post-Verification / Account Creation)
 */
export async function sendOnboardingWelcomeEmail(email: string, name: string): Promise<boolean> {
  const displayName = name && name.trim() ? name.trim() : "Valued Client";
  const preview = `Welcome to Online Wills Advisor, ${displayName}. Your ADJD Will preparation journey starts here.`;
  
  const html = wrapLuxuryEmail(`
    <p style="margin-top: 0; font-size: 16px; color: #0B1528; font-weight: 600;">
      Welcome to Online Wills Advisor, ${displayName}
    </p>
    <p>
      Your account has been authenticated and linked to your ADJD Non-Muslim Will application. You can safely save your progress and return to your application at any time.
    </p>

    <div style="background-color: #FBF9F5; border-left: 4px solid #A37E44; padding: 18px 20px; margin: 24px 0; border-radius: 0 8px 8px 0;">
      <h3 style="margin: 0 0 10px 0; font-size: 15px; color: #0B1528;">Your 3-Stage Will Journey:</h3>
      <ol style="margin: 0; padding-left: 20px; font-size: 14px; color: #4A5568; line-height: 1.6;">
        <li style="margin-bottom: 6px;"><strong>Questionnaire:</strong> Provide testator, executor, guardian, and beneficiary details with automatic auto-save.</li>
        <li style="margin-bottom: 6px;"><strong>Bilingual Draft Generation:</strong> Review your official English & Arabic side-by-side ADJD legal template.</li>
        <li><strong>ADJD Registration:</strong> Review with our legal team and submission to Abu Dhabi Civil Family Court.</li>
      </ol>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://onlinewillsadvisor.com"}/dashboard" 
         style="display: inline-block; background-color: #0B1528; color: #FFFFFF; font-weight: 600; font-size: 15px; padding: 14px 28px; text-decoration: none; border-radius: 8px; box-shadow: 0 2px 6px rgba(11, 21, 40, 0.2);">
        Go to Your Dashboard →
      </a>
    </div>

    <p style="font-size: 13.5px; color: #718096;">
      Need assistance? Our legal support desk is available directly inside your dashboard or via <a href="mailto:${supportEmail}" style="color: #A37E44; text-decoration: underline;">${supportEmail}</a>.
    </p>
  `, preview);

  try {
    const info = await transporter.sendMail({
      from: defaultFrom,
      to: email,
      subject: `Welcome to Online Wills Advisor · ADJD Will Preparation`,
      html,
    });
    console.log(`[EMAIL-WELCOME] Sent welcome email to ${email}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`[EMAIL-WELCOME-ERROR] Failed to send welcome email to ${email}:`, error);
    return false;
  }
}

/**
 * 3. Send Payment Confirmation & Onboarding Receipt
 */
interface PaymentReceiptParams {
  email: string;
  name?: string;
  amountAed: number;
  transactionRef: string;
  packageType: "INDIVIDUAL" | "COUPLES" | string;
}

export async function sendPaymentReceiptEmail(params: PaymentReceiptParams): Promise<boolean> {
  const { email, name, amountAed, transactionRef, packageType } = params;
  const isCouples = packageType === "COUPLES";
  const packageTitle = isCouples ? "Wills for Couples (Two Wills)" : "Individual Will";
  const preview = `Payment Confirmed: AED ${amountAed.toLocaleString("en-US")} · Ref: ${transactionRef}`;

  const html = wrapLuxuryEmail(`
    <div style="text-align: center; margin-bottom: 24px;">
      <span style="display: inline-block; background-color: #E6F4EA; color: #137333; font-weight: 700; font-size: 12px; padding: 6px 14px; border-radius: 20px; letter-spacing: 0.5px;">
        ✓ PAYMENT CONFIRMED
      </span>
      <h2 style="margin: 12px 0 4px 0; color: #0B1528; font-family: Georgia, serif; font-size: 22px;">
        Thank You for Your Order
      </h2>
      <p style="margin: 0; color: #718096; font-size: 14px;">
        Your initial service fee has been received and your questionnaire is unlocked.
      </p>
    </div>

    <!-- Receipt Summary Table -->
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #FBF9F5; border: 1px solid #E5E0D8; border-radius: 8px; margin-bottom: 24px;">
      <tr>
        <td style="padding: 16px 20px; border-bottom: 1px solid #E5E0D8; font-size: 13.5px; color: #718096;">Package</td>
        <td style="padding: 16px 20px; border-bottom: 1px solid #E5E0D8; font-size: 14px; font-weight: 600; color: #0B1528; text-align: right;">${packageTitle}</td>
      </tr>
      <tr>
        <td style="padding: 16px 20px; border-bottom: 1px solid #E5E0D8; font-size: 13.5px; color: #718096;">Transaction Reference</td>
        <td style="padding: 16px 20px; border-bottom: 1px solid #E5E0D8; font-family: monospace; font-size: 13px; color: #0B1528; text-align: right;">${transactionRef}</td>
      </tr>
      <tr>
        <td style="padding: 16px 20px; border-bottom: 1px solid #E5E0D8; font-size: 13.5px; color: #718096;">Date</td>
        <td style="padding: 16px 20px; border-bottom: 1px solid #E5E0D8; font-size: 13.5px; color: #0B1528; text-align: right;">${new Date().toLocaleDateString("en-AE", { dateStyle: "long" })}</td>
      </tr>
      <tr>
        <td style="padding: 16px 20px; font-size: 15px; font-weight: 700; color: #0B1528;">Total Paid</td>
        <td style="padding: 16px 20px; font-size: 18px; font-weight: 700; color: #A37E44; text-align: right;">AED ${amountAed.toLocaleString("en-US")}</td>
      </tr>
    </table>

    <div style="background-color: #F8F9FA; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
      <h4 style="margin: 0 0 10px 0; color: #0B1528; font-size: 14.5px;">What to Prepare for the Questionnaire:</h4>
      <ul style="margin: 0; padding-left: 20px; font-size: 13.5px; color: #4A5568; line-height: 1.6;">
        <li>Valid Passports for all named individuals (Testator, Executors, Beneficiaries, Guardians).</li>
        <li>Emirates IDs (for UAE residents).</li>
        <li>Residential addresses and contact details.</li>
      </ul>
    </div>

    <div style="text-align: center; margin: 28px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://onlinewillsadvisor.com"}/start" 
         style="display: inline-block; background-color: #A37E44; color: #FFFFFF; font-weight: 600; font-size: 15px; padding: 14px 28px; text-decoration: none; border-radius: 8px;">
        Resume Your Will Questionnaire →
      </a>
    </div>

    <p style="font-size: 12.5px; color: #718096; margin-bottom: 0;">
      Note: Official ADJD court registration fee (AED 950 per Will) is paid directly to the Abu Dhabi Judicial Department later during the court registration stage.
    </p>
  `, preview);

  try {
    const info = await transporter.sendMail({
      from: defaultFrom,
      to: email,
      subject: `Order Receipt: ${packageTitle} · Online Wills Advisor (Ref: ${transactionRef})`,
      html,
    });
    console.log(`[EMAIL-RECEIPT] Sent receipt to ${email}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`[EMAIL-RECEIPT-ERROR] Failed to send receipt to ${email}:`, error);
    return false;
  }
}

/**
 * 4. Send Support Ticket Alert to support@onlinewillsadvisor.com
 */
interface TicketAlertParams {
  ticketNumber: string | number;
  subject: string;
  message: string;
  senderName: string;
  senderEmail?: string;
  applicationId?: string;
}

export async function sendTicketAlertToSupport(params: TicketAlertParams): Promise<boolean> {
  const { ticketNumber, subject, message, senderName, senderEmail, applicationId } = params;
  const preview = `[Support Ticket #${ticketNumber}] ${subject} from ${senderName}`;

  const html = wrapLuxuryEmail(`
    <div style="background-color: #FEF3C7; border: 1px solid #F59E0B; border-radius: 6px; padding: 10px 14px; margin-bottom: 18px; font-size: 13px; color: #92400E; font-weight: 600;">
      NEW SUPPORT DESK TICKET RECEIVED
    </div>

    <h2 style="margin: 0 0 16px 0; color: #0B1528; font-size: 20px;">
      #${ticketNumber}: ${subject}
    </h2>

    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 20px; font-size: 13.5px;">
      <tr>
        <td style="width: 140px; color: #718096; padding: 4px 0;"><strong>Client Name:</strong></td>
        <td style="color: #0B1528; padding: 4px 0;">${senderName}</td>
      </tr>
      ${senderEmail ? `
      <tr>
        <td style="color: #718096; padding: 4px 0;"><strong>Client Email:</strong></td>
        <td style="color: #0B1528; padding: 4px 0;"><a href="mailto:${senderEmail}" style="color: #A37E44;">${senderEmail}</a></td>
      </tr>` : ""}
      ${applicationId ? `
      <tr>
        <td style="color: #718096; padding: 4px 0;"><strong>Application ID:</strong></td>
        <td style="color: #0B1528; padding: 4px 0; font-family: monospace;">${applicationId}</td>
      </tr>` : ""}
    </table>

    <div style="background-color: #F8F9FA; border: 1px solid #E5E0D8; border-radius: 8px; padding: 18px; font-size: 14px; line-height: 1.6; color: #2D3748; white-space: pre-wrap;">
${message}
    </div>

    <div style="margin-top: 24px; text-align: center;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://onlinewillsadvisor.com"}/admin/tickets" 
         style="display: inline-block; background-color: #0B1528; color: #FFFFFF; font-weight: 600; font-size: 14px; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
        Open Admin Ticket Desk →
      </a>
    </div>
  `, preview);

  try {
    const info = await transporter.sendMail({
      from: defaultFrom,
      to: supportEmail,
      replyTo: senderEmail || undefined,
      subject: `[OWA Support #${ticketNumber}] ${subject} (${senderName})`,
      html,
    });
    console.log(`[EMAIL-TICKET-ALERT] Sent ticket alert #${ticketNumber} to ${supportEmail}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`[EMAIL-TICKET-ALERT-ERROR] Failed to send ticket alert #${ticketNumber}:`, error);
    return false;
  }
}

/**
 * 5. Send Support Reply to User
 */
interface TicketReplyParams {
  userEmail: string;
  userName: string;
  ticketNumber: string | number;
  subject: string;
  replyMessage: string;
  senderRole: string;
}

export async function sendTicketReplyToUser(params: TicketReplyParams): Promise<boolean> {
  const { userEmail, userName, ticketNumber, subject, replyMessage, senderRole } = params;
  const staffTitle = senderRole === "ADMIN" ? "OWA Legal Consultancy Team" : "Support Advisor";
  const preview = `Reply received on your ticket #${ticketNumber}: ${subject}`;

  const html = wrapLuxuryEmail(`
    <p style="margin-top: 0; font-size: 16px; color: #0B1528; font-weight: 600;">
      Dear ${userName || "Client"},
    </p>
    <p>
      Our legal team has posted a reply to your support inquiry regarding <strong>"${subject}"</strong> (Ticket #${ticketNumber}):
    </p>

    <div style="background-color: #F8F9FA; border-left: 4px solid #0B1528; padding: 18px 20px; margin: 20px 0; border-radius: 0 8px 8px 0; font-size: 14.5px; line-height: 1.6; color: #2D3748; white-space: pre-wrap;">
${replyMessage}
    </div>

    <p style="font-size: 13.5px; color: #718096;">
      Responded by: <strong>${staffTitle}</strong>
    </p>

    <div style="margin: 28px 0; text-align: center;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://onlinewillsadvisor.com"}/dashboard/support" 
         style="display: inline-block; background-color: #A37E44; color: #FFFFFF; font-weight: 600; font-size: 14px; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
        View Ticket & Respond →
      </a>
    </div>

    <p style="font-size: 12.5px; color: #718096;">
      You can also reply directly to this email or visit your in-app support desk at any time.
    </p>
  `, preview);

  try {
    const info = await transporter.sendMail({
      from: defaultFrom,
      to: userEmail,
      replyTo: supportEmail,
      subject: `Reply on Ticket #${ticketNumber}: ${subject} · Online Wills Advisor`,
      html,
    });
    console.log(`[EMAIL-TICKET-REPLY] Sent reply for ticket #${ticketNumber} to ${userEmail}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`[EMAIL-TICKET-REPLY-ERROR] Failed to send reply for ticket #${ticketNumber}:`, error);
    return false;
  }
}

export default transporter;
