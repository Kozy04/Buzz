/**
 * SmartRename AI - Automated Cold Outreach Dispatcher
 * 
 * Features:
 * - Reads prospects from leads.json
 * - Injects personalized hooks into high-converting email templates
 * - DRY RUN mode by default: preview all drafted emails without sending
 * - Staggered human-like delay (60 - 90 seconds) between sends to protect domain reputation
 * - Automatically saves sent state to leads_log.json
 * 
 * Usage:
 *   node send_outreach.js --dry-run          (Previews all drafted emails)
 *   node send_outreach.js --send             (Sends via SMTP with delay)
 */

const fs = require("fs");
const path = require("path");

// Try loading nodemailer from local or parent directory
let nodemailer;
try {
  nodemailer = require("nodemailer");
} catch (e) {
  try {
    nodemailer = require("../../AINamer/node_modules/nodemailer");
  } catch (e2) {
    console.error("Nodemailer not found. Run 'npm install nodemailer' or run with --dry-run");
  }
}

// Config: SMTP Settings (set via environment variables or replace directly)
const SMTP_CONFIG = {
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "465", 10),
  secure: true, // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER || "your-email@gmail.com",
    pass: process.env.SMTP_PASS || "your-app-password",
  },
};

const SENDER_INFO = {
  name: process.env.SENDER_NAME || "Founder, SmartRename AI",
  email: process.env.SMTP_USER || "hello@smartrenameai.online",
  productUrl: "https://smartrenameai.online",
};

// Delays in milliseconds between sends (60 to 90 seconds)
const MIN_DELAY_MS = 60 * 1000;
const MAX_DELAY_MS = 90 * 1000;

function getRandomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Generate high-converting personalized email content
function generateEmail(lead) {
  const subject = `receipt & invoice naming at ${lead.firmName}`;

  const body = `Hi ${lead.firstName},

I came across ${lead.firmName} and ${lead.personalHook}.

Quick question: during monthly close and tax prep, how much time does your team spend opening, reading, and renaming client receipts and invoices that arrive with chaotic names like "scan_0042.pdf" or iPhone photo numbers?

We built SmartRename AI (${SENDER_INFO.productUrl}) specifically to eliminate that manual bottleneck.

Our system uses vision AI and OCR to instantly read the vendor, invoice date, and total from inside any PDF or receipt image, renames the file to your exact standard (e.g., "2026-09-11_Adobe_INV-9821_Receipt.pdf"), and automatically organizes them into client/year folder structures in one batch.

Would you be open to a quick, zero-obligation test?

If you send over 15-20 of your messiest sample client receipts or PDFs, I will run them through the system and send you back a cleanly standardized ZIP in 5 minutes—free of charge so you can see how it works on your own files.

Best regards,

${SENDER_INFO.name}
SmartRename AI
${SENDER_INFO.productUrl}`;

  return { subject, body };
}

async function main() {
  const args = process.argv.slice(2);
  const isSendMode = args.includes("--send");
  const isDryRun = !isSendMode || args.includes("--dry-run");

  const leadsPath = path.join(__dirname, "leads.json");
  const logPath = path.join(__dirname, "leads_log.json");

  if (!fs.existsSync(leadsPath)) {
    console.error("leads.json not found in scripts directory.");
    return;
  }

  const leads = JSON.parse(fs.readFileSync(leadsPath, "utf-8"));
  let sentLog = {};
  if (fs.existsSync(logPath)) {
    sentLog = JSON.parse(fs.readFileSync(logPath, "utf-8"));
  }

  console.log("==================================================");
  console.log("  SmartRename AI — Automated Outreach Engine      ");
  console.log(`  Mode: ${isDryRun ? "DRY RUN (Preview Only)" : "LIVE SENDING MODE"}`);
  console.log(`  Total Leads Loaded: ${leads.length}`);
  console.log("==================================================\n");

  let transporter = null;
  if (!isDryRun) {
    if (!nodemailer) {
      console.error("Error: nodemailer is required for sending. Run npm install nodemailer");
      process.exit(1);
    }
    transporter = nodemailer.createTransport(SMTP_CONFIG);
  }

  const draftsDir = path.join(__dirname, "drafts");
  if (isDryRun && !fs.existsSync(draftsDir)) {
    fs.mkdirSync(draftsDir, { recursive: true });
  }

  for (let i = 0; i < leads.length; i++) {
    const lead = leads[i];

    if (sentLog[lead.email] && !isDryRun) {
      console.log(`[SKIP] Already sent to ${lead.email} on ${sentLog[lead.email].sentAt}`);
      continue;
    }

    const emailContent = generateEmail(lead);

    if (isDryRun) {
      console.log(`--- [DRAFT ${i + 1}/${leads.length}] To: ${lead.email} (${lead.firmName}) ---`);
      console.log(`Subject: ${emailContent.subject}`);
      console.log(`\n${emailContent.body}\n`);
      console.log("------------------------------------------------------------------------\n");

      // Save draft file
      const draftFileName = `${lead.id}_${lead.firmName.replace(/[^a-zA-Z0-9]/g, "_")}.txt`;
      fs.writeFileSync(
        path.join(draftsDir, draftFileName),
        `To: ${lead.email}\nSubject: ${emailContent.subject}\n\n${emailContent.body}`
      );
    } else {
      console.log(`[SENDING ${i + 1}/${leads.length}] Dispatching to ${lead.email} (${lead.firmName})...`);

      try {
        await transporter.sendMail({
          from: `"${SENDER_INFO.name}" <${SENDER_INFO.email}>`,
          to: lead.email,
          subject: emailContent.subject,
          text: emailContent.body,
        });

        console.log(`[SUCCESS] Email delivered to ${lead.email}`);
        sentLog[lead.email] = {
          firmName: lead.firmName,
          sentAt: new Date().toISOString(),
          status: "delivered",
        };
        fs.writeFileSync(logPath, JSON.stringify(sentLog, null, 2));

        if (i < leads.length - 1) {
          const delay = getRandomDelay(MIN_DELAY_MS, MAX_DELAY_MS);
          console.log(`[SAFETY DELAY] Waiting ${(delay / 1000).toFixed(0)}s before next email to protect sender reputation...\n`);
          await sleep(delay);
        }
      } catch (err) {
        console.error(`[FAILED] Could not send to ${lead.email}:`, err.message);
      }
    }
  }

  if (isDryRun) {
    console.log(`\n[COMPLETE] All ${leads.length} drafts generated and saved in: ${draftsDir}`);
    console.log("To send for real: configure your SMTP credentials and run with '--send'");
  } else {
    console.log("\n[COMPLETE] Cold outreach batch completed!");
  }
}

main().catch(console.error);
