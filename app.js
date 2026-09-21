/**
 * Buzz Outreach PWA — Core Application Logic
 */

const STORAGE_KEY_LEADS = "buzz_leads_v1";
const STORAGE_KEY_SETTINGS = "buzz_settings_v1";

// Default seed data: 10 verified boutique bookkeeping prospects
const DEFAULT_LEADS = [
  {
    id: 1,
    firmName: "Bald Ginger",
    firstName: "Ed",
    email: "ed@baldginger.com",
    location: "Austin, TX",
    website: "https://www.baldginger.com",
    personalHook: "love your hands-on approach to bookkeeping and financial strategy for Austin businesses",
    status: "pending"
  },
  {
    id: 2,
    firmName: "Hollis CPA Firm",
    firstName: "Cameron",
    email: "cameron@holliscpa.com",
    location: "Austin, TX",
    website: "https://www.holliscpa.com",
    personalHook: "noticed the full-service tax and bookkeeping work your team does for small businesses across the Austin area",
    status: "contacted",
    lastContactedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    followUpDueAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    followUpCount: 1
  },
  {
    id: 3,
    firmName: "Tapia Bookkeeping",
    firstName: "Diego",
    email: "diego@tapiabookkeeping.com",
    location: "Austin, TX",
    website: "https://www.tapiabookkeeping.com",
    personalHook: "saw that you specialize in QuickBooks cleanups and monthly reconciliation for small businesses",
    status: "pending"
  },
  {
    id: 4,
    firmName: "Bittel Books & Taxes",
    firstName: "there",
    email: "hello@bittelbooks.com",
    location: "Austin, TX",
    website: "https://www.bittelbooks.com",
    personalHook: "noticed your specialized focus on bookkeeping and tax prep for freelancers and local LLCs",
    status: "contacted",
    lastContactedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    followUpDueAt: new Date().toISOString(),
    followUpCount: 1
  },
  {
    id: 5,
    firmName: "Swift Bookkeeping and More",
    firstName: "there",
    email: "hello@swiftnumbers.com",
    location: "Austin, TX",
    website: "https://www.swiftnumbers.com",
    personalHook: "noticed your dedicated monthly client bookkeeping and receipt reconciliation services",
    status: "contacted",
    lastContactedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    followUpDueAt: new Date(Date.now() + 2 * 86400000).toISOString(),
    followUpCount: 1
  },
  {
    id: 6,
    firmName: "AccuraBooks",
    firstName: "there",
    email: "help@accurabooks.com",
    location: "Austin, TX",
    website: "https://www.accurabooks.com",
    personalHook: "saw your emphasis on cloud accounting and streamlining financial records for growing companies",
    status: "pending"
  },
  {
    id: 7,
    firmName: "Kristy R. Cortez, CPA",
    firstName: "Kristy",
    email: "info@kristyrcortezcpa.com",
    location: "Austin, TX",
    website: "https://www.kristyrcortezcpa.com",
    personalHook: "came across your firm and noticed your focus on small business tax compliance and client document intake",
    status: "pending"
  },
  {
    id: 8,
    firmName: "Barmann Bookkeeping",
    firstName: "Sarah",
    email: "barmannbookkeeping@gmail.com",
    location: "Denver, CO",
    website: "https://www.barmannbookkeeping.com",
    personalHook: "noticed your boutique bookkeeping focus for hospitality and local service businesses",
    status: "pending"
  },
  {
    id: 9,
    firmName: "Sound Advice Bookkeeping",
    firstName: "there",
    email: "info@soundadvicebookkeeping.com",
    location: "Denver, CO",
    website: "https://soundadvicebookkeeping.com",
    personalHook: "saw your focus on monthly reconciliations and helping small business owners maximize efficiency",
    status: "pending"
  },
  {
    id: 10,
    firmName: "Ray CPA, P.C.",
    firstName: "Mr. Ray",
    email: "jray@raycpapc.com",
    location: "Round Rock, TX",
    website: "https://www.theroundrockcpa.com",
    personalHook: "noticed your specialized outsourced accounting and historical financial cleanup services",
    status: "pending"
  }
];

// App State
let leads = [];
let currentFilter = "all";
let currentSearch = "";
let activeLead = null;
let activeTemplate = "receipt";
let leadsPerPage = 40;
let currentVisiblePage = 1;

// Business / Campaign Presets
const BUSINESS_PRESETS = {
  smartrename: {
    businessName: "SmartRename AI",
    senderName: "Founder, SmartRename AI",
    productUrl: "https://smartrenameai.online",
    valueProp: "Eliminates hours of manual document sorting by using vision AI to auto-rename receipts, statements, and invoices and build clean client folders in seconds.",
    offer: "Process 15-20 of your messiest sample client files for free in 5 minutes so you can see the speed",
    targetNiche: "Boutique Bookkeeping & Accounting Firms"
  },
  agency: {
    businessName: "Apex Digital Studio",
    senderName: "Creative Director",
    productUrl: "https://apexstudio.design",
    valueProp: "Designs high-converting, lightning-fast modern websites that turn visitors into booked consultations and high-ticket clients.",
    offer: "Free 5-minute custom video audit of your current website with 3 immediate conversion fixes",
    targetNiche: "Boutique Law Firms & Legal Practices"
  },
  seo: {
    businessName: "RankPulse Growth",
    senderName: "Growth Partner",
    productUrl: "https://rankpulse.io",
    valueProp: "Generates high-intent inbound client leads through localized Google search optimization and content authority pipelines.",
    offer: "Free 1-page local competitor search breakdown showing where your firm is losing clients",
    targetNiche: "Real Estate Agencies & Property Managers"
  },
  consulting: {
    businessName: "Vanguard Advisory",
    senderName: "Managing Consultant",
    productUrl: "https://vanguardadvisory.com",
    valueProp: "Streamlines internal team operations, reduces overhead by 25%, and implements automated standard operating procedures.",
    offer: "Zero-cost 20-minute operational diagnostic to pinpoint your team's biggest profit leaks",
    targetNiche: "Construction & Subcontractors"
  },
  custom: {
    businessName: "",
    senderName: "",
    productUrl: "",
    valueProp: "",
    offer: "",
    targetNiche: ""
  }
};

let settings = {
  profileKey: "smartrename",
  businessName: "SmartRename AI",
  senderName: "Founder, SmartRename AI",
  productUrl: "https://smartrenameai.online",
  valueProp: "Eliminates hours of manual document sorting by using vision AI to auto-rename receipts, statements, and invoices and build clean client folders in seconds.",
  offer: "Process 15-20 of your messiest sample client files for free in 5 minutes so you can see the speed",
  targetNiche: "Boutique Bookkeeping & Accounting Firms",
  geminiApiKey: "",
  dispatchEngine: "cpanel",
  dispatchUrl: "",
  dispatchFromEmail: "",
  dispatchFromName: "",
  dispatchSecret: ""
};

let selectedFollowUpScheduleDays = 3;
let selectedLeadIds = new Set();
let autoPilotRunning = false;
let autoPilotPaused = false;

// Direct Dispatch Script Templates (1-Click Copy)
const CPANEL_PHP_CODE = `<?php
// Buzz Outreach Engine - cPanel Direct Email Bridge
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, X-Buzz-Secret, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }
$payload = json_decode(file_get_contents("php://input"), true);
if (!$payload) { http_response_code(400); echo json_encode(["status" => "error", "message" => "Invalid JSON"]); exit; }

$to = filter_var($payload['to'] ?? '', FILTER_VALIDATE_EMAIL);
$subject = $payload['subject'] ?? 'Hello';
$body = $payload['body'] ?? '';
$fromEmail = filter_var($payload['fromEmail'] ?? '', FILTER_VALIDATE_EMAIL) ?: "noreply@" . $_SERVER['HTTP_HOST'];
$fromName = $payload['fromName'] ?? 'Outreach Team';
$attachmentBase64 = $payload['attachmentBase64'] ?? '';
$attachmentName = $payload['attachmentName'] ?? 'workflow_mockup.jpg';

$boundary = "==Multipart_Boundary_x" . md5(time()) . "x";
$headers = "From: =?UTF-8?B?" . base64_encode($fromName) . "?= <{$fromEmail}>\\r\\n";
$headers .= "Reply-To: {$fromEmail}\\r\\nMIME-Version: 1.0\\r\\nContent-Type: multipart/mixed; boundary=\\"{$boundary}\\"\\r\\n";

$msg = "--{$boundary}\\r\\nContent-Type: text/plain; charset=UTF-8\\r\\nContent-Transfer-Encoding: 8bit\\r\\n\\r\\n{$body}\\r\\n\\r\\n";
if (!empty($attachmentBase64)) {
    $clean = preg_replace('/^data:image\\/\\w+;base64,/', '', $attachmentBase64);
    $encoded = chunk_split(base64_encode(base64_decode($clean)));
    $msg .= "--{$boundary}\\r\\nContent-Type: image/jpeg; name=\\"{$attachmentName}\\"\\r\\nContent-Disposition: attachment; filename=\\"{$attachmentName}\\"\\r\\nContent-Transfer-Encoding: base64\\r\\n\\r\\n{$encoded}\\r\\n\\r\\n";
}
$msg .= "--{$boundary}--";

if (@mail($to, "=?UTF-8?B?" . base64_encode($subject) . "?=", $msg, $headers, "-f" . $fromEmail)) {
    echo json_encode(["status" => "success", "recipient" => $to]);
} else {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "mail() failed. Verify cPanel email service."]);
}
?>`;

const GOOGLE_APPS_SCRIPT_CODE = `function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var options = { name: data.fromName || "SmartRename AI" };
    if (data.fromEmail) options.from = data.fromEmail;
    
    if (data.attachmentBase64) {
      var cleanBase64 = data.attachmentBase64.replace(/^data:image\\/\\w+;base64,/, "");
      var blob = Utilities.newBlob(Utilities.base64Decode(cleanBase64), "image/jpeg", data.attachmentName || "workflow_mockup.jpg");
      options.attachments = [blob];
    }
    
    GmailApp.sendEmail(data.to, data.subject, data.body, options);
    return ContentService.createTextOutput(JSON.stringify({ status: "success", recipient: data.to })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}`;

// Templates (Initial Hooks + 3-Stage Follow-Up Cadence)
const TEMPLATES = {
  receipt: {
    name: "1. Core Pitch Hook",
    cadenceStage: "Initial Pitch",
    getSubject: (lead) => {
      if (settings.businessName === "SmartRename AI") {
        return `receipt & invoice naming at ${lead.firmName}`;
      }
      return `quick question re: ${lead.firmName}`;
    },
    getBody: (lead) => {
      if (settings.businessName === "SmartRename AI") {
        return `Hi ${lead.firstName},

I came across ${lead.firmName} and ${lead.personalHook}.

Quick question: during monthly close and tax prep, how much time does your team spend opening, reading, and renaming client receipts and invoices that arrive with chaotic names like "scan_0042.pdf" or iPhone photo numbers?

We built SmartRename AI (${settings.productUrl}) specifically to eliminate that manual bottleneck.

Our system uses vision AI and OCR to instantly read the vendor, invoice date, and total from inside any PDF or receipt image, renames the file to your exact standard (e.g., "2026-09-11_Adobe_INV-9821_Receipt.pdf"), and automatically organizes them into client/year folder structures in one batch.

Would you be open to a quick, zero-obligation test?

If you send over 15-20 of your messiest sample client receipts or PDFs, I will run them through the system and send you back a cleanly standardized ZIP in 5 minutes—free of charge so you can see how it works on your own files.

Best regards,

${settings.senderName}
SmartRename AI
${settings.productUrl}`;
      }

      // Universal Pitch Template
      return `Hi ${lead.firstName},

I came across ${lead.firmName} and ${lead.personalHook}.

Quick question: how is your team currently handling ${settings.valueProp ? settings.valueProp.toLowerCase() : "your operational workflow"}?

We built ${settings.businessName} (${settings.productUrl}) specifically to solve this for teams like yours.

${settings.offer ? `We'd love to offer: ${settings.offer}.` : "Would you be open to a quick, zero-obligation preview on your workflow?"}

Best regards,

${settings.senderName}
${settings.businessName}
${settings.productUrl}`;
    }
  },

  cpa: {
    name: "1. Direct Value Hook",
    cadenceStage: "Initial Pitch",
    getSubject: (lead) => {
      if (settings.businessName === "SmartRename AI") {
        return `eliminating manual document renaming at ${lead.firmName}`;
      }
      return `helping ${lead.firmName} with ${settings.businessName || "workflow growth"}`;
    },
    getBody: (lead) => {
      if (settings.businessName === "SmartRename AI") {
        return `Hi ${lead.firstName},

I noticed the full-service accounting and tax work your team does for businesses at ${lead.firmName}.

Quick question: when clients send batches of unorganized documents, bank statements, and tax receipts named things like "Untitled.pdf" or "IMG_4910.jpg", how much time does your team lose manually sorting and renaming them?

We built SmartRename AI (${settings.productUrl}) to automate that entire step.

It reads document contents via multi-modal OCR, extracts the vendor, date, and invoice numbers, formats the filenames to your firm's strict convention, and generates clean client folder hierarchies in seconds.

Could I process a sample batch of 15–20 unorganized documents for your team for free so you can see the speed and accuracy firsthand?

Best regards,

${settings.senderName}
SmartRename AI
${settings.productUrl}`;
      }

      // Universal Direct Value Hook
      return `Hi ${lead.firstName},

I noticed the specialized work your team does at ${lead.firmName}.

We help businesses in your space with ${settings.valueProp || "streamlining core operations"}.

Rather than a long pitch, ${settings.offer ? `we'd be happy to ${settings.offer.toLowerCase()}` : "would you be open to a 2-minute conversation"} so you can see if it's a fit for ${lead.firmName}?

Best regards,

${settings.senderName}
${settings.businessName}
${settings.productUrl}`;
    }
  },

  followup1: {
    name: "2. Bump (Day 3)",
    cadenceStage: "Follow-Up #1",
    getSubject: (lead) => `Re: ${TEMPLATES.receipt.getSubject(lead)}`,
    getBody: (lead) => `Hi ${lead.firstName},

Just bumping this to the top of your inbox in case it got buried earlier this week.

Did you get a quick moment to consider whether ${settings.valueProp ? settings.valueProp.toLowerCase() : "our platform"} could help ${lead.firmName}?

Happy to share a 45-second screen recording showing how ${settings.businessName} works if you're swamped.

Best,

${settings.senderName}`
  },

  followup2: {
    name: "3. Proof (Day 7)",
    cadenceStage: "Follow-Up #2",
    getSubject: (lead) => `quick proof point for ${lead.firmName}`,
    getBody: (lead) => `Hi ${lead.firstName},

I know you're busy running things at ${lead.firmName}, so I'll keep this under 30 seconds.

One of our clients recently shared that partnering with ${settings.businessName} helped them eliminate hours of manual bottlenecks each week.

${settings.offer ? `We would love to extend the same offer to ${lead.firmName}: ${settings.offer}.` : `Would you be open to testing this on your team?`}

Best regards,

${settings.senderName}
${settings.productUrl}`
  },

  followup3: {
    name: "4. Breakup (Day 14)",
    cadenceStage: "Follow-Up #3 (Final)",
    getSubject: (lead) => `closing the loop / ${lead.firmName}`,
    getBody: (lead) => `Hi ${lead.firstName},

I haven't heard back, so I assume ${settings.valueProp ? settings.valueProp.toLowerCase() : "this"} isn't a top priority for ${lead.firmName} right now. Completely understand!

I won't clutter your inbox with any further follow-ups.

If your team ever needs help with ${settings.valueProp ? settings.valueProp.toLowerCase() : "this area"}, feel free to check out ${settings.businessName} anytime at ${settings.productUrl}.

Wishing you and ${lead.firmName} continued success!

Best,

${settings.senderName}`
  }
};

// ==========================================
// Follow-Up Cadence Calculations & Helpers
// ==========================================
function getFollowUpStatus(lead) {
  if (lead.status !== "contacted") return null;

  const now = new Date();
  let dueDate = lead.followUpDueAt ? new Date(lead.followUpDueAt) : null;
  if (!dueDate && lead.lastContactedAt) {
    dueDate = new Date(new Date(lead.lastContactedAt).getTime() + 3 * 86400000);
  }
  if (!dueDate) {
    return {
      state: "due-today",
      badgeText: "Follow-up Due Today",
      icon: "⏰",
      stepNum: (lead.followUpCount || 0) + 1
    };
  }

  const msPerDay = 86400000;
  const todayZero = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const dueZero = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate()).getTime();
  const diffDays = Math.round((dueZero - todayZero) / msPerDay);
  const stepNum = (lead.followUpCount || 0) + 1;

  if (diffDays < 0) {
    const overdueDays = Math.abs(diffDays);
    return {
      state: "overdue",
      badgeText: `Follow-up #${stepNum} Overdue (${overdueDays}d)`,
      icon: "🔴",
      diffDays,
      stepNum
    };
  } else if (diffDays === 0) {
    return {
      state: "due-today",
      badgeText: `Follow-up #${stepNum} Due Today`,
      icon: "⏰",
      diffDays: 0,
      stepNum
    };
  } else {
    return {
      state: "upcoming",
      badgeText: `Follow-up #${stepNum} in ${diffDays}d`,
      icon: "⏳",
      diffDays,
      stepNum
    };
  }
}

function isFollowUpDue(lead) {
  const status = getFollowUpStatus(lead);
  return status && (status.state === "overdue" || status.state === "due-today");
}

function formatShortDate(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function snoozeLeadFollowUp(leadId, days = 3) {
  const lead = leads.find(l => l.id === leadId);
  if (!lead) return;
  const baseTime = lead.followUpDueAt && new Date(lead.followUpDueAt).getTime() > Date.now()
    ? new Date(lead.followUpDueAt).getTime()
    : Date.now();
  lead.followUpDueAt = new Date(baseTime + days * 86400000).toISOString();
  saveData();
  renderApp();
  showToast(`Snoozed follow-up for ${lead.firmName} by +${days} days ⏰`);
}

// ==========================================
// Initialization & Storage
// ==========================================
// ==========================================
// IndexedDB High-Capacity Storage Engine
// ==========================================
const DB_NAME = "buzz_crm_db";
const DB_VERSION = 1;
const STORE_LEADS = "leads";

function openBuzzDB() {
  return new Promise((resolve) => {
    if (!window.indexedDB) {
      resolve(null);
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_LEADS)) {
        db.createObjectStore(STORE_LEADS, { keyPath: "id" });
      }
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => {
      console.warn("IndexedDB unavailable, falling back to localStorage", e);
      resolve(null);
    };
  });
}

async function dbSaveAllLeads(leadsArray) {
  const db = await openBuzzDB();
  if (!db) {
    try {
      localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify(leadsArray));
    } catch (e) {
      console.warn("localStorage quota exceeded:", e);
    }
    return;
  }
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_LEADS, "readwrite");
    const store = tx.objectStore(STORE_LEADS);
    store.clear();
    for (const item of leadsArray) {
      store.put(item);
    }
    tx.oncomplete = () => {
      try {
        // Keep a light 50-lead mirror in localStorage for instant offline warm start
        localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify(leadsArray.slice(0, 50)));
      } catch (e) {}
      resolve();
    };
    tx.onerror = (err) => reject(err);
  });
}

async function dbGetAllLeads() {
  const db = await openBuzzDB();
  if (!db) {
    const saved = localStorage.getItem(STORAGE_KEY_LEADS);
    if (saved) {
      try { return JSON.parse(saved); } catch(e) {}
    }
    return null;
  }
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_LEADS, "readonly");
    const store = tx.objectStore(STORE_LEADS);
    const req = store.getAll();
    req.onsuccess = () => {
      const results = req.result;
      if (results && results.length > 0) {
        resolve(results);
      } else {
        // Migrate legacy localStorage leads if present
        const saved = localStorage.getItem(STORAGE_KEY_LEADS);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
              dbSaveAllLeads(parsed);
              resolve(parsed);
              return;
            }
          } catch(e) {}
        }
        resolve(null);
      }
    };
    req.onerror = () => resolve(null);
  });
}

async function init() {
  await loadData();
  setupEventListeners();
  renderApp();
}

async function loadData() {
  const storedLeads = await dbGetAllLeads();
  if (storedLeads && storedLeads.length > 0) {
    leads = storedLeads;
  } else {
    leads = [...DEFAULT_LEADS];
    await dbSaveAllLeads(leads);
  }

  const savedSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);
  if (savedSettings) {
    try {
      settings = { ...settings, ...JSON.parse(savedSettings) };
    } catch (e) {}
  }

  // Populate settings form elements
  const profileSelect = document.getElementById("settingsProfileSelect");
  if (profileSelect) profileSelect.value = settings.profileKey || "smartrename";

  const bName = document.getElementById("settingsBusinessName");
  if (bName) bName.value = settings.businessName || "SmartRename AI";

  const sName = document.getElementById("settingsSenderName");
  if (sName) sName.value = settings.senderName || "Founder, SmartRename AI";

  const pUrl = document.getElementById("settingsProductUrl");
  if (pUrl) pUrl.value = settings.productUrl || "https://smartrenameai.online";

  const vProp = document.getElementById("settingsValueProp");
  if (vProp) vProp.value = settings.valueProp || "Eliminates hours of manual document sorting by using vision AI to auto-rename receipts, statements, and invoices and build clean client folders in seconds.";

  const sOffer = document.getElementById("settingsOffer");
  if (sOffer) sOffer.value = settings.offer || "Process 15-20 of your messiest sample client files for free in 5 minutes so you can see the speed";

  const gKey = document.getElementById("settingsGeminiKey");
  if (gKey) gKey.value = settings.geminiApiKey || "";

  // Direct Dispatch Configuration
  const dEngine = document.getElementById("settingsDispatchEngine");
  if (dEngine) dEngine.value = settings.dispatchEngine || "cpanel";

  const dUrl = document.getElementById("settingsDispatchUrl");
  if (dUrl) dUrl.value = settings.dispatchUrl || "";

  const dFromEmail = document.getElementById("settingsDispatchFromEmail");
  if (dFromEmail) dFromEmail.value = settings.dispatchFromEmail || "";

  const dFromName = document.getElementById("settingsDispatchFromName");
  if (dFromName) dFromName.value = settings.dispatchFromName || "";

  const dSecret = document.getElementById("settingsDispatchSecret");
  if (dSecret) dSecret.value = settings.dispatchSecret || "";

  updateDispatchGuideUI();
  updateLaunchMailButtonText();
  updateHeaderBranding();
}

function updateHeaderBranding() {
  const tagEl = document.getElementById("headerBrandSub");
  if (tagEl) {
    tagEl.textContent = `${settings.businessName || "SmartRename AI"} Pipeline`;
  }
}

function saveData() {
  dbSaveAllLeads(leads);
  updateKpiAndCounts();
}

function saveSettings() {
  const profileSelect = document.getElementById("settingsProfileSelect");
  settings.profileKey = profileSelect ? profileSelect.value : "smartrename";
  settings.businessName = document.getElementById("settingsBusinessName")?.value.trim() || "SmartRename AI";
  settings.senderName = document.getElementById("settingsSenderName")?.value.trim() || "Founder, SmartRename AI";
  settings.productUrl = document.getElementById("settingsProductUrl")?.value.trim() || "https://smartrenameai.online";
  settings.valueProp = document.getElementById("settingsValueProp")?.value.trim() || "Automated file processing";
  settings.offer = document.getElementById("settingsOffer")?.value.trim() || "Free test on sample files";
  settings.geminiApiKey = document.getElementById("settingsGeminiKey")?.value.trim() || "";

  // Direct Dispatch Settings
  settings.dispatchEngine = document.getElementById("settingsDispatchEngine")?.value || "cpanel";
  settings.dispatchUrl = document.getElementById("settingsDispatchUrl")?.value.trim() || "";
  settings.dispatchFromEmail = document.getElementById("settingsDispatchFromEmail")?.value.trim() || "";
  settings.dispatchFromName = document.getElementById("settingsDispatchFromName")?.value.trim() || "";
  settings.dispatchSecret = document.getElementById("settingsDispatchSecret")?.value.trim() || "";

  localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  updateHeaderBranding();
  updateDispatchGuideUI();
  updateLaunchMailButtonText();
  if (activeLead) {
    updateDrafterContent();
  }
  showToast("Profile & Settings saved! 🏢");
}

function updateDispatchGuideUI() {
  const engine = document.getElementById("settingsDispatchEngine")?.value || settings.dispatchEngine || "cpanel";
  const configArea = document.getElementById("dispatchGatewayConfigArea");
  const lblUrl = document.getElementById("lblDispatchUrl");
  const inputUrl = document.getElementById("settingsDispatchUrl");
  const hintUrl = document.getElementById("hintDispatchUrl");
  const guideTitle = document.getElementById("dispatchGuideTitle");
  const btnDownload = document.getElementById("btnDownloadPhpScript");
  const btnCopy = document.getElementById("btnCopyDispatchScript");
  const guideInst = document.getElementById("dispatchGuideInstructions");

  if (!configArea) return;

  if (engine === "mailto") {
    configArea.style.display = "none";
    return;
  }

  configArea.style.display = "block";

  if (engine === "cpanel") {
    if (lblUrl) lblUrl.textContent = "cPanel Bridge URL *";
    if (inputUrl) inputUrl.placeholder = "https://yourdomain.com/buzz-send.php";
    if (hintUrl) hintUrl.innerHTML = "Upload <code>buzz-send.php</code> to your cPanel <code>public_html</code>.";
    if (guideTitle) guideTitle.textContent = "cPanel Quick Setup:";
    if (btnDownload) btnDownload.style.display = "inline-flex";
    if (btnCopy) btnCopy.textContent = "📋 Copy PHP Code";
    if (guideInst) {
      guideInst.innerHTML = `1. Upload <code>buzz-send.php</code> to your cPanel <code>public_html</code>.<br/>2. Enter your URL above (e.g. <code>https://yourdomain.com/buzz-send.php</code>).<br/>3. Enter your cPanel email (e.g. <code>you@yourdomain.com</code>) &amp; hit save!`;
    }
  } else if (engine === "googleScript") {
    if (lblUrl) lblUrl.textContent = "Google Apps Script Webhook URL *";
    if (inputUrl) inputUrl.placeholder = "https://script.google.com/macros/s/.../exec";
    if (hintUrl) hintUrl.innerHTML = "Paste the Web App URL deployed from Google Apps Script.";
    if (guideTitle) guideTitle.textContent = "Google Apps Script Setup:";
    if (btnDownload) btnDownload.style.display = "none";
    if (btnCopy) btnCopy.textContent = "📋 Copy Google Script Code";
    if (guideInst) {
      guideInst.innerHTML = `1. Go to <a href="https://script.google.com" target="_blank" style="color: var(--accent-cyan); text-decoration: underline;">script.google.com</a> &amp; create New Project.<br/>2. Click "Copy Google Script Code", paste it, then click <strong>Deploy &gt; New deployment &gt; Web app</strong>.<br/>3. Set <em>Execute as: Me</em> &amp; <em>Who has access: Anyone</em>, then paste the URL above!`;
    }
  }
}

function copyDispatchScript() {
  const engine = document.getElementById("settingsDispatchEngine")?.value || settings.dispatchEngine || "cpanel";
  const codeToCopy = (engine === "googleScript") ? GOOGLE_APPS_SCRIPT_CODE : CPANEL_PHP_CODE;
  const label = (engine === "googleScript") ? "Google Apps Script" : "cPanel PHP bridge";

  if (navigator.clipboard) {
    navigator.clipboard.writeText(codeToCopy).then(() => {
      showToast(`${label} code copied to clipboard! 📋`);
    }).catch(() => {
      fallbackCopy(codeToCopy);
      showToast(`${label} code copied! 📋`);
    });
  } else {
    fallbackCopy(codeToCopy);
    showToast(`${label} code copied! 📋`);
  }
}

function updateLaunchMailButtonText() {
  const btnText = document.getElementById("btnLaunchMailText");
  if (!btnText) return;

  const isDirect = (settings.dispatchEngine === "cpanel" || settings.dispatchEngine === "googleScript") && settings.dispatchUrl;
  if (isDirect) {
    btnText.textContent = "🚀 Send Directly (With Mockup)";
  } else {
    btnText.textContent = "Send via Mail App (mailto:)";
  }
}

// Direct Email Dispatch Engine Call
async function sendEmailDirectly({ to, subject, body, attachmentBase64, attachmentName }) {
  const engine = settings.dispatchEngine || "cpanel";
  const url = settings.dispatchUrl?.trim();

  if (engine === "mailto" || !url) {
    return { success: false, fallback: true, message: "Direct dispatch URL not configured in Settings." };
  }

  const payload = {
    to: to.trim(),
    subject: subject.trim(),
    body: body.trim(),
    fromEmail: settings.dispatchFromEmail?.trim() || "",
    fromName: settings.dispatchFromName?.trim() || settings.senderName || "SmartRename AI",
    secretKey: settings.dispatchSecret?.trim() || "",
    attachmentBase64: attachmentBase64 || "",
    attachmentName: attachmentName || "workflow_mockup.jpg"
  };

  try {
    let response;
    if (engine === "googleScript") {
      // Use text/plain to prevent browser preflight CORS block on Google Script webhooks
      response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(payload)
      });
    } else {
      // cPanel PHP Bridge
      response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(settings.dispatchSecret ? { "X-Buzz-Secret": settings.dispatchSecret } : {})
        },
        body: JSON.stringify(payload)
      });
    }

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      throw new Error(`Server returned HTTP ${response.status}: ${errText.slice(0, 120)}`);
    }

    const data = await response.json().catch(() => ({ status: "success" }));
    if (data.status === "error") {
      throw new Error(data.message || "Dispatch error occurred");
    }

    return { success: true, recipient: to };
  } catch (err) {
    console.error("Direct send failure:", err);
    return { success: false, fallback: false, message: err.message };
  }
}

// Test Direct Dispatch Connection
async function testDirectDispatch() {
  const url = document.getElementById("settingsDispatchUrl")?.value.trim();
  const fromEmail = document.getElementById("settingsDispatchFromEmail")?.value.trim();
  const engine = document.getElementById("settingsDispatchEngine")?.value || "cpanel";

  if (!url) {
    showToast("Please enter your Bridge / Webhook URL first.");
    return;
  }
  if (!fromEmail) {
    showToast("Please enter your sender email to receive test message.");
    return;
  }

  const btn = document.getElementById("btnTestDispatch");
  const origText = btn.textContent;
  btn.disabled = true;
  btn.textContent = "Testing dispatch connection...";

  // Temporarily update settings for the test
  settings.dispatchUrl = url;
  settings.dispatchFromEmail = fromEmail;
  settings.dispatchEngine = engine;
  settings.dispatchFromName = document.getElementById("settingsDispatchFromName")?.value.trim() || settings.senderName;
  settings.dispatchSecret = document.getElementById("settingsDispatchSecret")?.value.trim() || "";

  // Render sample canvas mockup attachment
  const sampleAttachment = generateCanvasMockup(
    "Connection Test Partner",
    "Tester",
    "Global",
    "beforeAfter",
    settings.businessName,
    settings.valueProp
  );

  const testResult = await sendEmailDirectly({
    to: fromEmail,
    subject: "Buzz Outreach Test - Connection Verified! 🚀",
    body: `Hello,\n\nGreat news! Your Buzz Outreach direct email bridge is functioning smoothly.\n\nGateway Engine: ${engine}\nSender: ${fromEmail}\nTimestamp: ${new Date().toLocaleString()}\n\nYou can now run automated 1-click single sends and Auto-Pilot bulk campaigns with high-resolution mockups attached!`,
    attachmentBase64: sampleAttachment,
    attachmentName: "test_verified_mockup.jpg"
  });

  btn.disabled = false;
  btn.textContent = origText;

  if (testResult.success) {
    alert(`✅ Success! Test email with branded mockup attachment dispatched directly to ${fromEmail}. Check your inbox!`);
    showToast("Test email dispatched successfully! 🎉");
  } else {
    alert(`❌ Direct Dispatch Test Failed:\n\n${testResult.message}\n\nPlease check that your script/webhook URL is correct and accessible.`);
    showToast(`Test failed: ${testResult.message}`);
  }
}

function handleProfilePresetChange(e) {
  const presetKey = e.target.value;
  const preset = BUSINESS_PRESETS[presetKey];
  if (!preset) return;

  if (presetKey !== "custom") {
    document.getElementById("settingsBusinessName").value = preset.businessName;
    document.getElementById("settingsSenderName").value = preset.senderName;
    document.getElementById("settingsProductUrl").value = preset.productUrl;
    document.getElementById("settingsValueProp").value = preset.valueProp;
    document.getElementById("settingsOffer").value = preset.offer;
  }
}

// ==========================================
// Rendering
// ==========================================
function renderApp() {
  updateKpiAndCounts();
  renderLeadsList();
}

function updateKpiAndCounts() {
  const total = leads.length;
  const contacted = leads.filter(l => l.status === "contacted").length;
  const sample = leads.filter(l => l.status === "sample").length;
  const wonLeads = leads.filter(l => l.status === "won");
  const won = wonLeads.length;
  const wonRevenue = wonLeads.reduce((sum, l) => sum + (Number(l.dealValue) || 0), 0);
  const pending = leads.filter(l => l.status === "pending").length;
  const followups = leads.filter(l => l.status === "contacted" && isFollowUpDue(l)).length;

  document.getElementById("kpiTotal").textContent = total;
  document.getElementById("kpiContacted").textContent = contacted;
  document.getElementById("kpiSample").textContent = sample;
  document.getElementById("kpiWon").textContent = won;

  const kpiWonRevenue = document.getElementById("kpiWonRevenue");
  if (kpiWonRevenue) {
    if (wonRevenue > 0) {
      kpiWonRevenue.style.display = "inline";
      kpiWonRevenue.textContent = `($${wonRevenue.toLocaleString()})`;
    } else {
      kpiWonRevenue.style.display = "none";
    }
  }

  document.getElementById("countAll").textContent = total;
  document.getElementById("countPending").textContent = pending;
  document.getElementById("countContacted").textContent = contacted;
  document.getElementById("countSample").textContent = sample;
  document.getElementById("countWon").textContent = won;

  const countFollowupsEl = document.getElementById("countFollowups");
  if (countFollowupsEl) {
    countFollowupsEl.textContent = followups;
    const filterChip = document.querySelector(".filter-chip-followup");
    if (filterChip) {
      filterChip.classList.toggle("has-due", followups > 0);
    }
  }
}

function renderLeadsList() {
  const container = document.getElementById("leadsList");
  const emptyState = document.getElementById("emptyState");
  const paginationBar = document.getElementById("paginationBar");
  const paginationInfo = document.getElementById("paginationInfo");
  const btnLoadMore = document.getElementById("btnLoadMoreLeads");
  container.innerHTML = "";

  const filtered = leads.filter(lead => {
    // Filter by tab
    if (currentFilter === "followups") {
      if (lead.status !== "contacted" || !isFollowUpDue(lead)) {
        return false;
      }
    } else if (currentFilter !== "all" && lead.status !== currentFilter) {
      return false;
    }
    // Filter by search
    if (currentSearch) {
      const q = currentSearch.toLowerCase();
      const matchName = (lead.firmName || "").toLowerCase().includes(q);
      const matchPerson = (lead.firstName || "").toLowerCase().includes(q);
      const matchRole = (lead.jobTitle || "").toLowerCase().includes(q);
      const matchLoc = (lead.location || "").toLowerCase().includes(q);
      const matchEmail = (lead.email || "").toLowerCase().includes(q);
      return matchName || matchPerson || matchRole || matchLoc || matchEmail;
    }
    return true;
  });

  if (filtered.length === 0) {
    emptyState.style.display = "block";
    if (paginationBar) paginationBar.style.display = "none";
    updateBulkUI();
    return;
  }
  emptyState.style.display = "none";

  // Virtualized progressive slice (40 leads per page)
  const visibleLimit = currentVisiblePage * leadsPerPage;
  const visibleSlice = filtered.slice(0, visibleLimit);

  visibleSlice.forEach(lead => {
    const isSelected = selectedLeadIds.has(lead.id);
    const card = document.createElement("div");
    card.className = `lead-card has-checkbox ${isSelected ? "selected-for-bulk" : ""}`;

    const statusBadgeClass = `badge-${lead.status}`;
    const statusLabelMap = {
      pending: "Pending",
      contacted: "Contacted",
      sample: "Sample Sent",
      won: "Won ($)"
    };

    const fu = getFollowUpStatus(lead);
    const isUrgent = fu && (fu.state === "overdue" || fu.state === "due-today");

    let followupRowHtml = "";
    if (fu) {
      followupRowHtml = `
        <div class="lead-followup-row">
          <span class="lead-followup-badge ${fu.state}">
            <span>${fu.icon}</span>
            <span>${fu.badgeText}</span>
          </span>
          ${lead.lastContactedAt ? `<span class="last-sent-hint">Sent: ${formatShortDate(lead.lastContactedAt)}</span>` : ""}
        </div>
      `;
    }

    let draftBtnText = "Draft & Send";
    let draftBtnClass = "btn-open-draft";
    if (isUrgent) {
      draftBtnClass = "btn-open-draft btn-urgent-followup";
      draftBtnText = `Send Follow-Up #${fu.stepNum}`;
    } else if (lead.status === "contacted") {
      draftBtnText = `Follow-Up #${fu ? fu.stepNum : 2}`;
    }

    card.innerHTML = `
      <div class="lead-card-checkbox-wrapper" onclick="event.stopPropagation()">
        <input type="checkbox" class="lead-select-chk custom-checkbox" data-id="${lead.id}" ${isSelected ? "checked" : ""} />
      </div>

      <div class="lead-card-header">
        <div>
          <h3 class="lead-firm-title">${escapeHtml(lead.firmName)}</h3>
          <div class="lead-contact-line">
            <span>👤 ${escapeHtml(lead.firstName)}</span>
            ${lead.jobTitle ? `<span class="lead-role-pill">${escapeHtml(lead.jobTitle)}</span>` : ""}
            <span class="dot">•</span>
            <span>${escapeHtml(lead.location || "USA")}</span>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 6px;">
          ${(lead.status === "won" && lead.dealValue && Number(lead.dealValue) > 0) ? `<span class="lead-deal-badge">💵 $${Number(lead.dealValue).toLocaleString()}</span>` : ""}
          <span class="status-badge ${statusBadgeClass}" data-id="${lead.id}" title="Tap to cycle status">
            ${statusLabelMap[lead.status] || "Pending"}
          </span>
        </div>
      </div>

      ${followupRowHtml}

      <div class="lead-hook-box">
        "${escapeHtml(lead.personalHook || "potential client")}"
      </div>

      ${(lead.notes && lead.notes.trim()) ? `
        <div class="lead-notes-box">
          <span class="lead-notes-label">📝 Notes:</span> ${escapeHtml(lead.notes.trim())}
        </div>
      ` : ""}

      <div class="lead-card-actions">
        <div class="action-btn-group">
          <button class="${draftBtnClass}" data-id="${lead.id}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            <span>${draftBtnText}</span>
          </button>

          ${lead.status === "contacted" ? `
            <button class="snooze-btn" data-id="${lead.id}" title="Snooze / Reschedule Follow-up +3 Days">
              +3d
            </button>
          ` : ""}
          
          <button class="icon-btn edit-lead-btn" data-id="${lead.id}" style="width: 36px; height: 36px;" title="Edit Lead">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
          </button>

          <button class="icon-btn delete-lead-btn" data-id="${lead.id}" style="width: 36px; height: 36px; color: var(--text-muted);" title="Delete Prospect">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>

        ${lead.website ? `
          <a href="${escapeHtml(lead.website)}" target="_blank" rel="noopener" class="btn-link-site" title="Visit Website">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
          </a>
        ` : ""}
      </div>
    `;

    // Checkbox event
    const chk = card.querySelector(".lead-select-chk");
    if (chk) {
      chk.addEventListener("change", (e) => {
        e.stopPropagation();
        toggleLeadSelection(lead.id, e.target.checked);
      });
    }

    // Event handlers inside card
    card.querySelector(".btn-open-draft").addEventListener("click", () => openDrafter(lead));
    card.querySelector(".edit-lead-btn").addEventListener("click", () => openEditLeadModal(lead));
    
    const cardDeleteBtn = card.querySelector(".delete-lead-btn");
    if (cardDeleteBtn) {
      cardDeleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        deleteLead(lead.id);
      });
    }
    
    const snoozeBtn = card.querySelector(".snooze-btn");
    if (snoozeBtn) {
      snoozeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        snoozeLeadFollowUp(lead.id, 3);
      });
    }

    // Tap badge to cycle status
    card.querySelector(".status-badge").addEventListener("click", (e) => {
      e.stopPropagation();
      cycleStatus(lead.id);
    });

    container.appendChild(card);
  });

  // Setup Pagination Bar
  if (paginationBar && paginationInfo) {
    if (filtered.length > visibleSlice.length) {
      paginationBar.style.display = "flex";
      paginationInfo.textContent = `Showing ${visibleSlice.length.toLocaleString()} of ${filtered.length.toLocaleString()} prospects`;
      if (btnLoadMore) {
        btnLoadMore.style.display = "inline-block";
        btnLoadMore.textContent = `Load More Prospects (${Math.min(leadsPerPage, filtered.length - visibleSlice.length)} more) ▾`;
      }
    } else {
      if (filtered.length > leadsPerPage) {
        paginationBar.style.display = "flex";
        paginationInfo.textContent = `Showing all ${filtered.length.toLocaleString()} prospects`;
        if (btnLoadMore) btnLoadMore.style.display = "none";
      } else {
        paginationBar.style.display = "none";
      }
    }
  }

  updateBulkUI();
}

function toggleLeadSelection(leadId, isSelected) {
  if (isSelected) {
    selectedLeadIds.add(leadId);
  } else {
    selectedLeadIds.delete(leadId);
  }
  updateBulkUI();
  // Update card selected style in place
  const cardChk = document.querySelector(`.lead-select-chk[data-id="${leadId}"]`);
  if (cardChk) {
    const card = cardChk.closest(".lead-card");
    if (card) {
      card.classList.toggle("selected-for-bulk", isSelected);
    }
  }
}

function toggleSelectAllPending(e) {
  const isChecked = e.target.checked;
  const pendingLeads = leads.filter(l => l.status === "pending");
  if (isChecked) {
    pendingLeads.forEach(l => selectedLeadIds.add(l.id));
  } else {
    pendingLeads.forEach(l => selectedLeadIds.delete(l.id));
  }
  updateBulkUI();
  renderLeadsList();
}

function updateBulkUI() {
  const pendingLeads = leads.filter(l => l.status === "pending");
  const pendingCount = pendingLeads.length;
  
  const countSelectablePending = document.getElementById("countSelectablePending");
  if (countSelectablePending) countSelectablePending.textContent = pendingCount;

  const count = selectedLeadIds.size;
  const floatingBulkBar = document.getElementById("floatingBulkBar");
  const floatingBulkCount = document.getElementById("floatingBulkCount");
  const bulkCountBadgeTop = document.getElementById("bulkCountBadgeTop");
  const btnTriggerAutoPilotTop = document.getElementById("btnTriggerAutoPilotTop");
  const chkSelectAll = document.getElementById("chkSelectAllLeads");

  if (floatingBulkBar) {
    floatingBulkBar.style.display = count > 0 ? "flex" : "none";
  }
  if (floatingBulkCount) {
    floatingBulkCount.textContent = `${count} Lead${count === 1 ? "" : "s"}`;
  }
  if (btnTriggerAutoPilotTop) {
    btnTriggerAutoPilotTop.style.display = count > 0 ? "inline-flex" : "none";
  }
  if (bulkCountBadgeTop) {
    bulkCountBadgeTop.textContent = count;
  }
  if (chkSelectAll && pendingCount > 0) {
    const allSelected = pendingLeads.every(l => selectedLeadIds.has(l.id));
    chkSelectAll.checked = allSelected;
  } else if (chkSelectAll) {
    chkSelectAll.checked = false;
  }
}

// ==========================================
// Drafter Modal Logic
// ==========================================
function openDrafter(lead) {
  activeLead = lead;
  document.getElementById("drafterTargetFirm").textContent = lead.firmName;
  document.getElementById("drafterTargetEmail").textContent = lead.email;
  
  // Smart-select cadence template based on lead status and followUpCount
  if (lead.status === "contacted") {
    const count = lead.followUpCount || 0;
    if (count <= 1) {
      activeTemplate = "followup1";
    } else if (count === 2) {
      activeTemplate = "followup2";
    } else {
      activeTemplate = "followup3";
    }
  } else {
    activeTemplate = "receipt";
  }

  // Set template pills active state
  document.querySelectorAll(".template-pill").forEach(p => {
    p.classList.toggle("active", p.dataset.template === activeTemplate);
  });

  // Reset follow-up schedule pills to default 3
  selectedFollowUpScheduleDays = 3;
  document.querySelectorAll(".sched-pill").forEach(pill => {
    pill.classList.toggle("active", parseInt(pill.dataset.days, 10) === selectedFollowUpScheduleDays);
  });

  // Reset Mockup Generator state
  const mockupPreview = document.getElementById("mockupPreviewArea");
  if (mockupPreview) mockupPreview.style.display = "none";
  const mockupLoading = document.getElementById("mockupLoadingArea");
  if (mockupLoading) mockupLoading.style.display = "none";
  const mockupError = document.getElementById("mockupErrorArea");
  if (mockupError) mockupError.style.display = "none";

  updateCadenceIndicator();
  updateDrafterContent();
  updateDrafterStatusPills(lead.status);

  document.getElementById("modalDrafter").style.display = "flex";
}

function updateCadenceIndicator() {
  const badge = document.getElementById("drafterCadenceStepText");
  if (!badge || !activeLead) return;
  const tmpl = TEMPLATES[activeTemplate];
  badge.textContent = tmpl?.cadenceStage || (activeLead.status === "contacted" ? `Follow-Up #${(activeLead.followUpCount || 0) + 1}` : "Initial Pitch");
}

function updateDrafterContent() {
  if (!activeLead) return;
  const tmpl = TEMPLATES[activeTemplate] || TEMPLATES.receipt;
  document.getElementById("drafterSubject").value = tmpl.getSubject(activeLead);
  document.getElementById("drafterBody").value = tmpl.getBody(activeLead);
}

// Generate with Google Gemini AI
async function generateWithGemini() {
  if (!activeLead) return;

  const apiKey = settings.geminiApiKey;
  if (!apiKey) {
    showToast("Please enter a fresh Gemini API Key in Settings (⚙️)");
    openSettingsModal();
    return;
  }

  const aiBtn = document.getElementById("btnAiDraft");
  const aiBtnText = document.getElementById("aiBtnText");
  const originalText = aiBtnText.textContent;

  aiBtn.classList.add("loading");
  aiBtnText.textContent = "AI Drafting...";

  const isSmartRename = (settings.businessName || "").toLowerCase().includes("smartrename");
  let promptText = "";

  if (isSmartRename) {
    if (activeTemplate === "followup1") {
      promptText = `You are an elite B2B cold email copywriter. Write a 45-word polite, ultra-brief follow-up email from "${settings.senderName}" to "${activeLead.firstName}" at "${activeLead.firmName}".
Context: Sent an email 3 days ago about SmartRename AI (${settings.productUrl}) to automate document and receipt renaming for ${activeLead.firmName}.
Goal: Friendly bump to the top of inbox. Mention you know they are busy with client files. Ask if they'd like a 45-second screen recording.
Strict Rules: Under 60 words, zero fluff, casual & respectful peer-to-peer tone.
Format strictly:
SUBJECT: Re: receipt & invoice naming at ${activeLead.firmName}
BODY:
[body]`;
    } else if (activeTemplate === "followup2") {
      promptText = `You are an elite B2B cold email copywriter. Write a 65-word value-proof follow-up email from "${settings.senderName}" to "${activeLead.firstName}" at "${activeLead.firmName}".
Context: Sent two emails earlier regarding SmartRename AI (${settings.productUrl}).
Goal: Share a quick real-world proof point: a bookkeeper saves 4+ hours every Friday by having messy incoming client files (scanned receipts, bank statements) automatically renamed and organized into client folders. Offer to process 10 sample files for free today.
Strict Rules: Under 75 words, no buzzwords.
Format strictly:
SUBJECT: saving 4+ hours on document cleanup at ${activeLead.firmName}
BODY:
[body]`;
    } else if (activeTemplate === "followup3") {
      promptText = `You are an elite B2B cold email copywriter. Write a 45-word polite "breakup / closing the file" email from "${settings.senderName}" to "${activeLead.firstName}" at "${activeLead.firmName}".
Context: Followed up twice with no response.
Goal: Politely assume automating client document renaming isn't a priority right now, promise not to email again, leave the link to SmartRename AI (${settings.productUrl}) in case tax season or file chaos ever becomes an issue. Wish them success.
Strict Rules: Under 50 words, completely non-passive-aggressive, warm and professional.
Format strictly:
SUBJECT: closing the loop / ${activeLead.firmName}
BODY:
[body]`;
    } else {
      // Initial pitch prompt for SmartRename AI
      promptText = `You are an elite B2B cold email copywriter. Write a concise, hyper-personalized, non-spammy cold outreach email from "${settings.senderName}" to "${activeLead.firstName}" at "${activeLead.firmName}".

Target Info:
- Firm: ${activeLead.firmName}
- Contact: ${activeLead.firstName}
- Location: ${activeLead.location || "USA"}
- Context / Observation: ${activeLead.personalHook}

Our Software: SmartRename AI (${settings.productUrl})
What it solves: It uses multi-modal OCR and Vision AI to read vendor names, invoice dates, and amounts directly from inside chaotic scanned receipts and PDFs (like scan_0042.pdf or iPhone photos). It automatically standardizes their filenames and builds client/year folder structures in one batch.

The Offer: Offer to process 15-20 of their messiest sample client receipts or PDFs for free in 5 minutes so they can see the accuracy on their own files.

Strict Rules:
- Keep the email body under 85 words.
- NO cheesy AI clichés (no "hope this email finds you well", no "in today's fast-paced digital world", no "supercharge your workflow").
- Sound like a busy software founder reaching out peer-to-peer.
- Output strictly in this exact format:
SUBJECT: [short lowercase subject]
BODY:
[complete email body]`;
    }
  } else {
    // Dynamic generation for ANY other business (Web Agency, SEO, Consulting, White-Label SaaS, etc.)
    if (activeTemplate === "followup1") {
      promptText = `You are an elite B2B cold email copywriter. Write a 45-word polite, ultra-brief follow-up email from "${settings.senderName}" of "${settings.businessName}" (${settings.productUrl}) to "${activeLead.firstName}" at "${activeLead.firmName}".
Context: Sent an email 3 days ago introducing our work (${settings.valueProp}).
Goal: Friendly bump to the top of inbox. Ask if they got a quick moment to review or if they'd prefer a 60-second summary.
Strict Rules: Under 60 words, zero fluff, casual & respectful peer-to-peer tone.
Format strictly:
SUBJECT: Re: quick note for ${activeLead.firmName}
BODY:
[body]`;
    } else if (activeTemplate === "followup2") {
      promptText = `You are an elite B2B cold email copywriter. Write a 65-word value-proof follow-up email from "${settings.senderName}" of "${settings.businessName}" (${settings.productUrl}) to "${activeLead.firstName}" at "${activeLead.firmName}".
Context: Sent two emails earlier regarding ${settings.businessName}.
Goal: Share a quick proof point of how we help businesses with "${settings.valueProp}". Reiterate our low-friction offer: "${settings.offer}".
Strict Rules: Under 75 words, no buzzwords.
Format strictly:
SUBJECT: quick proof point for ${activeLead.firmName}
BODY:
[body]`;
    } else if (activeTemplate === "followup3") {
      promptText = `You are an elite B2B cold email copywriter. Write a 45-word polite "breakup / closing the file" email from "${settings.senderName}" of "${settings.businessName}" to "${activeLead.firstName}" at "${activeLead.firmName}".
Context: Followed up twice with no response.
Goal: Politely assume this isn't a priority right now, promise not to clutter their inbox, leave the link (${settings.productUrl}) if they ever need assistance with ${settings.valueProp}. Wish them success.
Strict Rules: Under 50 words, warm and professional.
Format strictly:
SUBJECT: closing the loop / ${activeLead.firmName}
BODY:
[body]`;
    } else {
      // Initial pitch for custom business
      promptText = `You are an elite B2B cold email copywriter. Write a concise, hyper-personalized, non-spammy cold outreach email from "${settings.senderName}" representing "${settings.businessName}" (${settings.productUrl}) to "${activeLead.firstName}" at "${activeLead.firmName}".

Target Info:
- Company / Firm: ${activeLead.firmName}
- Contact Name: ${activeLead.firstName}
- Location: ${activeLead.location || "USA"}
- Context / Observation: ${activeLead.personalHook}

Our Business: ${settings.businessName} (${settings.productUrl})
What We Solve: ${settings.valueProp}
Our Offer / Call-To-Action: ${settings.offer}

Strict Rules:
- Keep the email body under 85 words.
- NO cheesy AI clichés (no "hope this email finds you well", no "in today's fast-paced digital world", no "supercharge your workflow").
- Sound authentic, peer-to-peer, and focused on direct value.
- Output strictly in this exact format:
SUBJECT: [short lowercase subject]
BODY:
[complete email body]`;
    }
  }

  try {
    const payload = {
      contents: [
        {
          parts: [{ text: promptText }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
        thinkingConfig: {
          thinkingBudget: 0
        }
      }
    };

    let response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    // Fallback if thinkingConfig is not supported on a specific API version
    if (!response.ok && response.status === 400) {
      delete payload.generationConfig.thinkingConfig;
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
    }

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      const msg = errJson?.error?.message || `API error: ${response.status}`;
      throw new Error(msg);
    }

    const data = await response.json();
    const candidateParts = data.candidates?.[0]?.content?.parts || [];
    
    // Extract visible text (filtering out thought/internal reasoning parts in Gemini 2.5)
    let candidateText = "";
    for (const part of candidateParts) {
      if (part.text && !part.thought) {
        candidateText += part.text;
      }
    }
    if (!candidateText && candidateParts[0]?.text) {
      candidateText = candidateParts[0].text;
    }

    if (candidateText) {
      // Support standard, bold (**SUBJECT:**), or lowercase subject headers
      const subjectMatch = candidateText.match(/(?:\*{0,2})SUBJECT(?:\*{0,2}):\s*(.*?)(?:\n|$)/i);
      const bodyMatch = candidateText.match(/(?:\*{0,2})BODY(?:\*{0,2}):?\s*([\s\S]*)/i);

      if (subjectMatch && subjectMatch[1]) {
        document.getElementById("drafterSubject").value = subjectMatch[1].trim().replace(/^\*+|\*+$/g, "");
      }

      let cleanBody = "";
      if (bodyMatch && bodyMatch[1] && bodyMatch[1].trim()) {
        cleanBody = bodyMatch[1].trim();
      } else {
        // Fallback: strip any SUBJECT header and lone BODY label from candidateText
        cleanBody = candidateText
          .replace(/(?:\*{0,2})SUBJECT(?:\*{0,2}):\s*.*?(?:\n+|$)/i, "")
          .replace(/^(?:\*{0,2})BODY(?:\*{0,2}):?\s*/i, "")
          .trim();
      }

      document.getElementById("drafterBody").value = cleanBody;
      showToast("Drafted with Gemini 2.5 Flash ✨");
    } else {
      throw new Error("Empty AI response");
    }
  } catch (err) {
    console.error("Gemini Generation Error:", err);
    showToast(err.message.includes("leaked") ? "API key was flagged. Please generate a new key in Settings (⚙️)" : `AI error: ${err.message}`);
  } finally {
    aiBtn.classList.remove("loading");
    aiBtnText.textContent = originalText;
  }
}

function updateDrafterStatusPills(status) {
  document.querySelectorAll(".status-pill-btn").forEach(btn => {
    btn.classList.toggle("active-pill", btn.dataset.setStatus === status);
  });
}

function closeDrafter() {
  document.getElementById("modalDrafter").style.display = "none";
  activeLead = null;
}

// Launch Email App (Direct Dispatch or mailto: fallback)
async function launchMailApp() {
  if (!activeLead) return;
  const subject = document.getElementById("drafterSubject").value;
  const body = document.getElementById("drafterBody").value;

  const isDirect = (settings.dispatchEngine === "cpanel" || settings.dispatchEngine === "googleScript") && settings.dispatchUrl;

  if (isDirect) {
    const btn = document.getElementById("btnLaunchMail");
    const btnText = document.getElementById("btnLaunchMailText");
    const origText = btnText ? btnText.textContent : "Send";
    if (btn) btn.disabled = true;
    if (btnText) btnText.textContent = "Dispatching directly...";

    try {
      // Ensure we have a high-resolution branded mockup to attach!
      let attachment = currentMockupBase64;
      if (!attachment) {
        attachment = generateCanvasMockup(
          activeLead.firmName,
          activeLead.firstName,
          activeLead.location,
          "beforeAfter",
          settings.businessName,
          settings.valueProp
        );
      }

      // Auto-append P.S. note if not present
      let finalBody = body;
      if (!finalBody.includes("P.S. I put together a quick visual preview")) {
        finalBody = finalBody.trim() + `\n\nP.S. I put together a quick visual preview of what ${activeLead.firmName}'s workflow looks like with ${settings.businessName}—see the attached image!`;
        document.getElementById("drafterBody").value = finalBody;
      }

      const cleanFirm = (activeLead.firmName || "lead").toLowerCase().replace(/[^a-z0-9]/g, "_");
      const result = await sendEmailDirectly({
        to: activeLead.email,
        subject,
        body: finalBody,
        attachmentBase64: attachment,
        attachmentName: `${cleanFirm}_workflow_mockup.jpg`
      });

      if (result.success) {
        // Advance cadence tracking
        activeLead.status = "contacted";
        activeLead.followUpCount = (activeLead.followUpCount || 0) + 1;
        activeLead.lastContactedAt = new Date().toISOString();
        if (selectedFollowUpScheduleDays > 0) {
          activeLead.followUpDueAt = new Date(Date.now() + selectedFollowUpScheduleDays * 86400000).toISOString();
        } else {
          activeLead.followUpDueAt = null;
        }

        saveData();
        renderApp();
        updateDrafterStatusPills("contacted");

        const schedMsg = selectedFollowUpScheduleDays > 0
          ? `Follow-up #${activeLead.followUpCount + 1} in +${selectedFollowUpScheduleDays} days 📅`
          : `Follow-up off`;

        showToast(`🚀 Dispatched directly to ${activeLead.email} with mockup attached! ${schedMsg}`);
        setTimeout(() => closeDrafter(), 800);
        return;
      } else {
        const tryFallback = confirm(`Direct send failed: ${result.message}\n\nWould you like to open your local Mail client (mailto:) instead?`);
        if (tryFallback) {
          triggerMailtoFallback(subject, body);
        }
      }
    } catch (err) {
      showToast(`Send error: ${err.message}`);
    } finally {
      if (btn) btn.disabled = false;
      if (btnText) btnText.textContent = origText;
    }
  } else {
    // Default fallback to local mailto:
    triggerMailtoFallback(subject, body);
  }
}

function triggerMailtoFallback(subject, body) {
  if (!activeLead) return;
  const mailtoUrl = `mailto:${encodeURIComponent(activeLead.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  // Advance cadence tracking
  activeLead.status = "contacted";
  activeLead.followUpCount = (activeLead.followUpCount || 0) + 1;
  activeLead.lastContactedAt = new Date().toISOString();

  if (selectedFollowUpScheduleDays > 0) {
    activeLead.followUpDueAt = new Date(Date.now() + selectedFollowUpScheduleDays * 86400000).toISOString();
  } else {
    activeLead.followUpDueAt = null;
  }

  saveData();
  renderApp();
  updateDrafterStatusPills("contacted");

  const schedMsg = selectedFollowUpScheduleDays > 0
    ? `Follow-up #${activeLead.followUpCount + 1} scheduled in +${selectedFollowUpScheduleDays} days 📅`
    : `Follow-up schedule off`;
  showToast(`Mail client launched! ${schedMsg}`);

  window.location.href = mailtoUrl;
}

// Copy Email to Clipboard
function copyEmailToClipboard() {
  const subject = document.getElementById("drafterSubject").value;
  const body = document.getElementById("drafterBody").value;
  const fullText = `Subject: ${subject}\n\n${body}`;

  if (navigator.clipboard) {
    navigator.clipboard.writeText(fullText).then(() => {
      showToast("Email text copied to clipboard!");
    }).catch(() => {
      fallbackCopy(fullText);
    });
  } else {
    fallbackCopy(fullText);
  }
}

function fallbackCopy(text) {
  const ta = document.createElement("textarea");
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  document.execCommand("copy");
  document.body.removeChild(ta);
  showToast("Email text copied!");
}

// ==========================================
// Visual Pitch Mockup Generator (Google Imagen 3)
// ==========================================
let currentMockupBase64 = null;

function toggleMockupArea() {
  const content = document.getElementById("mockupContentArea");
  const chevron = document.getElementById("mockupChevron");
  if (!content) return;
  const isHidden = content.style.display === "none";
  content.style.display = isHidden ? "block" : "none";
  if (chevron) {
    chevron.textContent = isHidden ? "▴ Collapse" : "▾ Expand";
  }
}

async function generateMockupWithImagen() {
  if (!activeLead) return;

  const apiKey = settings.geminiApiKey;
  const errorArea = document.getElementById("mockupErrorArea");
  const errorMsg = document.getElementById("mockupErrorMsg");
  const loadingArea = document.getElementById("mockupLoadingArea");
  const previewArea = document.getElementById("mockupPreviewArea");
  const imgResult = document.getElementById("mockupImgResult");
  const btn = document.getElementById("btnGenerateMockup");
  const btnText = document.getElementById("mockupBtnText");
  const downloadBtn = document.getElementById("btnDownloadMockup");

  if (errorArea) errorArea.style.display = "none";
  if (previewArea) previewArea.style.display = "none";

  if (!apiKey) {
    if (errorArea && errorMsg) {
      errorMsg.textContent = "Please add your Gemini API Key in Settings (⚙️) to generate visual mockups.";
      errorArea.style.display = "flex";
    }
    showToast("Please enter your Gemini API Key in Settings (⚙️)");
    openSettingsModal();
    return;
  }

  const concept = document.getElementById("mockupConceptSelect")?.value || "beforeAfter";
  const originalText = btnText.textContent;
  btn.disabled = true;
  btnText.textContent = "Crafting branded visual...";
  if (loadingArea) loadingArea.style.display = "flex";

  const isSmartRename = (settings.businessName || "").toLowerCase().includes("smartrename");
  const cleanFirm = (activeLead.firmName || "lead").toLowerCase().replace(/[^a-z0-9]/g, "_");

  // Formulate SVG prompt tailored to active lead and chosen concept with strict boundary geometry
  let svgPrompt = "";
  if (isSmartRename) {
    if (concept === "videoThumb") {
      svgPrompt = `Generate a sleek, dark-mode 16:9 presentation graphic as raw SVG code (width="1280" height="720" viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg") for "${activeLead.firmName}".
Concept: A premium video demo preview card. In the center, a glowing frosted-glass play button with text "30-Sec Demo for ${activeLead.firstName || "Team"} at ${activeLead.firmName}".
Background: Dark cyber obsidian (#080B11), ambient cyan (#00F0FF) and purple (#8B5CF6) glowing blur orbs. Shows clean automated document processing badges, "SmartRename AI Vision", and 85% time-savings tag.
Style: Premium typography, glassmorphic cards, modern tech aesthetic.

CRITICAL BOUNDARY CONSTRAINTS:
1. Main video player card: x="160", y="150", width="960", height="460", rx="24".
2. All text, badges, and the play button MUST be centered and strictly contained within the player frame with ample margins.
IMPORTANT: Return ONLY valid <svg ...> ... </svg> code. Do NOT wrap in markdown code blocks, do not include explanations.`;
    } else if (concept === "portalDashboard") {
      svgPrompt = `Generate a sleek, dark-mode 16:9 presentation graphic as raw SVG code (width="1280" height="720" viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg") for "${activeLead.firmName}" in ${activeLead.location || "USA"}.
Concept: A futuristic SaaS client document portal branded for "${activeLead.firmName}". Shows file extraction cards, OCR detection tags (Vendor, Date, Amount), glowing progress bar (50/50 files organized), and automated client folder queue.
Style: Dark obsidian (#080B11) background, neon cyan (#00F0FF) and violet (#8B5CF6) accents, glassmorphic panels, crisp modern typography.

CRITICAL BOUNDARY CONSTRAINTS:
1. Container cards must have at least 40px internal padding.
2. All text strings inside cards MUST be comfortably contained with at least 40px margin from any card border.
3. Queue list text must be under 38 characters and use font-size="14".
4. Add <clipPath> to container panels to guarantee zero overflow.
IMPORTANT: Return ONLY valid <svg ...> ... </svg> code. Do NOT wrap in markdown code blocks, do not include explanations.`;
    } else {
      // Before & After (Default)
      svgPrompt = `Generate a sleek, dark-mode 16:9 presentation graphic as raw SVG code (width="1280" height="720" viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg") for "${activeLead.firmName}".
Concept: Split-screen Before & After transformation comparison.
- Left Card: "BEFORE: Chaotic Client Files" (red-tinted dark glassmorphic card). Shows messy unorganized filenames: 'scan_0042.pdf', 'IMG_9102.jpg', 'receipt_coffee.pdf', 'invoice_temp.pdf'.
- Center: glowing neon cyan transition arrow with "AI" badge.
- Right Card: "AFTER: SmartRename AI" (electric cyan dark glassmorphic card). Shows organized client hierarchy with clean, short folder paths: '📁 Clients/Apex/2026_Adobe_INV.pdf', '📁 Clients/Beacon/2026_Staples_RCP.pdf', '📁 Clients/Zenith/2026_QuickBooks.pdf'.
Style: Dark obsidian (#080B11) background, glowing ambient circles, clean sans-serif typography, glassmorphism.

CRITICAL BOUNDARY & LAYOUT CONSTRAINTS (MANDATORY FOR QUALITY):
1. Left Card: x="80", y="180", width="510", height="440", rx="20".
2. Right Card: x="690", y="180", width="510", height="440", rx="20".
3. Text Padding: Inside cards, text MUST start at relative x="35" from the card left edge.
4. TEXT CONTAINMENT (VERY IMPORTANT): Under NO circumstance may text exceed or touch the card boundary. All text lines inside cards must be STRICTLY under 30 characters and use font-size="14" or "15" (monospace).
5. Add <clipPath> definitions for both cards to guarantee zero overflow beyond card borders.
IMPORTANT: Return ONLY valid <svg ...> ... </svg> code. Do NOT wrap in markdown code blocks, do not include explanations.`;
    }
  } else {
    // Custom business profile
    if (concept === "videoThumb") {
      svgPrompt = `Generate a sleek, dark-mode 16:9 presentation graphic as raw SVG code (width="1280" height="720" viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg") for "${activeLead.firmName}".
Concept: Video pitch player card with glowing play button reading "Brief Demo for ${activeLead.firstName || "Team"} at ${activeLead.firmName}". Illustrating ${settings.businessName} and "${settings.valueProp}".
Style: Deep dark obsidian (#080B11) background, cyan and purple accents, glassmorphism.
CRITICAL BOUNDARY CONSTRAINTS: All text and elements must remain strictly within the card with 40px margins.
IMPORTANT: Return ONLY valid <svg ...> ... </svg> code. No markdown fences.`;
    } else if (concept === "portalDashboard") {
      svgPrompt = `Generate a sleek, dark-mode 16:9 presentation graphic as raw SVG code (width="1280" height="720" viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg") for "${activeLead.firmName}".
Concept: Modern executive analytics dashboard branded for "${activeLead.firmName}" powered by ${settings.businessName}. Data cards demonstrating "${settings.valueProp}".
Style: Dark background, glowing accents, clean glass panels.
CRITICAL BOUNDARY CONSTRAINTS: All text and elements must remain strictly within the card with 40px margins.
IMPORTANT: Return ONLY valid <svg ...> ... </svg> code. No markdown fences.`;
    } else {
      svgPrompt = `Generate a sleek, dark-mode 16:9 presentation graphic as raw SVG code (width="1280" height="720" viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg") for "${activeLead.firmName}".
Concept: Split-screen visual transformation. Left: "BEFORE" manual workflow bottlenecks. Right: "AFTER: ${settings.businessName}" automated high-efficiency solution for "${settings.valueProp}".
Style: Deep dark obsidian (#080B11) background, glowing cyan and purple accents, glassmorphic cards.
CRITICAL BOUNDARY CONSTRAINTS: Left card x="80", w="510". Right card x="690", w="510". Text strictly under 30 characters and font-size="14". Define <clipPath> to prevent text overflowing card boundaries.
IMPORTANT: Return ONLY valid <svg ...> ... </svg> code. No markdown fences.`;
    }
  }

  let generatedDataUrl = null;
  let usedEngine = "";

  try {
    // TIER 1: Gemini 2.5 Flash Dynamic Vector Visualizer (SVG)
    try {
      btnText.textContent = "Synthesizing custom visual (Gemini)...";
      const payload = {
        contents: [{ parts: [{ text: svgPrompt }] }],
        generationConfig: {
          temperature: 0.5,
          maxOutputTokens: 8192,
          thinkingConfig: { thinkingBudget: 0 }
        }
      };

      let response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok && response.status === 400) {
        delete payload.generationConfig.thinkingConfig;
        response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      if (response.ok) {
        const data = await response.json();
        const rawText = data.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("") || "";
        const svgMatch = rawText.match(/<svg[\s\S]*<\/svg>/i);
        if (svgMatch && svgMatch[0]) {
          const sanitizedSvg = sanitizeAndContainSvg(svgMatch[0]);
          const converted = await svgToJpeg(sanitizedSvg, 1280, 720);
          generatedDataUrl = converted.dataUrl;
          usedEngine = "Gemini AI Vector (1280x720)";
        }
      }
    } catch (geminiErr) {
      console.warn("Gemini SVG generation failed, falling back:", geminiErr);
    }

    // TIER 2: Pollinations AI (Flux / SDXL Photorealistic) Fallback
    if (!generatedDataUrl) {
      try {
        btnText.textContent = "Rendering photorealistic visual...";
        const pollPrompt = `A photorealistic 16:9 split-screen B2B presentation mockup tailored for '${activeLead.firmName}' in ${activeLead.location || 'USA'}. Dark mode obsidian aesthetic, neon cyan and purple ambient glow, showing ${settings.businessName} automated workflow, 8k resolution, crisp graphic design.`;
        const pollUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(pollPrompt)}?width=1280&height=720&nologo=true&seed=${Date.now()}`;
        
        const pollResp = await fetch(pollUrl);
        if (pollResp.ok) {
          const blob = await pollResp.blob();
          generatedDataUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
          usedEngine = "AI Vision / Flux (1280x720)";
        }
      } catch (pollErr) {
        console.warn("Pollinations AI fetch failed, falling back:", pollErr);
      }
    }

    // TIER 3: Guaranteed Instant Client-Side HTML5 Canvas Fallback
    if (!generatedDataUrl) {
      btnText.textContent = "Composing local visual...";
      generatedDataUrl = generateCanvasMockup(activeLead.firmName, activeLead.firstName, activeLead.location, concept, settings.businessName, settings.valueProp);
      usedEngine = "High-Res Canvas Visualizer (1280x720)";
    }

    currentMockupBase64 = generatedDataUrl;
    if (imgResult) imgResult.src = currentMockupBase64;

    if (downloadBtn) {
      downloadBtn.href = currentMockupBase64;
      downloadBtn.download = `${cleanFirm}_workflow_mockup.jpg`;
    }

    if (loadingArea) loadingArea.style.display = "none";
    if (previewArea) previewArea.style.display = "block";
    showToast(`Branded mockup ready via ${usedEngine}! 🎨`);
  } catch (err) {
    console.error("Mockup Generation Error:", err);
    // Ultimate safety: render canvas so user NEVER sees a failed blank screen
    try {
      currentMockupBase64 = generateCanvasMockup(activeLead.firmName, activeLead.firstName, activeLead.location, concept, settings.businessName, settings.valueProp);
      if (imgResult) imgResult.src = currentMockupBase64;
      if (downloadBtn) {
        downloadBtn.href = currentMockupBase64;
        downloadBtn.download = `${cleanFirm}_workflow_mockup.jpg`;
      }
      if (loadingArea) loadingArea.style.display = "none";
      if (previewArea) previewArea.style.display = "block";
      showToast("Branded mockup composed via Local Engine! 🎨");
    } catch (canvasErr) {
      if (loadingArea) loadingArea.style.display = "none";
      if (errorArea && errorMsg) {
        errorMsg.textContent = `Image generation error: ${err.message}`;
        errorArea.style.display = "flex";
      }
      showToast(`Mockup error: ${err.message}`);
    }
  } finally {
    btn.disabled = false;
    btnText.textContent = originalText;
  }
}

// Sanitize and strictly contain SVG layout to prevent text from overflowing card boundaries
function sanitizeAndContainSvg(svgCode) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgCode, "image/svg+xml");
    const svg = doc.querySelector("svg");
    if (!svg || doc.querySelector("parsererror")) return svgCode;

    // Standardize viewBox and dimensions
    if (!svg.getAttribute("viewBox")) svg.setAttribute("viewBox", "0 0 1280 720");
    svg.setAttribute("width", "1280");
    svg.setAttribute("height", "720");

    let defs = svg.querySelector("defs");
    if (!defs) {
      defs = doc.createElementNS("http://www.w3.org/2000/svg", "defs");
      svg.insertBefore(defs, svg.firstChild);
    }

    // Universal typography style to ensure clean rendering on any device
    const style = doc.createElementNS("http://www.w3.org/2000/svg", "style");
    style.textContent = `
      text {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
        text-rendering: geometricPrecision;
      }
    `;
    defs.appendChild(style);

    // Strict containment: scan all text elements
    const textEls = doc.querySelectorAll("text");
    textEls.forEach(el => {
      const txt = el.textContent || "";
      const trimmed = txt.trim();

      // Check if it's a file list item or folder path
      const isFileOrPath = /\.(pdf|jpg|png|xlsx|docx|csv|txt)/i.test(trimmed) || 
                           trimmed.includes("📁") || 
                           trimmed.includes("📄") || 
                           trimmed.includes("Clients") ||
                           trimmed.includes("BEFORE") ||
                           trimmed.includes("AFTER");

      if (isFileOrPath) {
        // Enforce maximum font size of 14px for list items
        const currentFontSize = parseFloat(el.getAttribute("font-size") || "16");
        if (currentFontSize > 14 && !trimmed.startsWith("BEFORE") && !trimmed.startsWith("AFTER")) {
          el.setAttribute("font-size", "14");
        }

        // Condense any path longer than 30 characters so it cannot bleed past the card border
        if (trimmed.length > 30) {
          let clean = trimmed.replace(/\s*\/\s*/g, "/");
          if (clean.length > 30) {
            const parts = clean.split("/");
            if (parts.length >= 3) {
              const root = parts.slice(0, 2).join("/");
              const leaf = parts.slice(2).join("/");
              clean = `${root}/${leaf.slice(0, 14)}…${leaf.slice(-4)}`;
            } else {
              clean = clean.slice(0, 27) + "…";
            }
          }
          el.textContent = clean;
        }
      }
    });

    return new XMLSerializer().serializeToString(doc);
  } catch (err) {
    console.warn("SVG sanitization fallback:", err);
    return svgCode;
  }
}

// Convert SVG code to a high-resolution JPEG Data URL via HTML5 Canvas
function svgToJpeg(svgCode, width = 1280, height = 720) {
  return new Promise((resolve) => {
    const img = new Image();
    const svgBlob = new Blob([svgCode], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#080B11";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(url);
        resolve({
          dataUrl: canvas.toDataURL("image/jpeg", 0.92),
          format: "jpg"
        });
      } catch (e) {
        URL.revokeObjectURL(url);
        resolve({
          dataUrl: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgCode)}`,
          format: "svg"
        });
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({
        dataUrl: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgCode)}`,
        format: "svg"
      });
    };
    img.src = url;
  });
}

// High-Resolution Client-Side HTML5 Canvas Graphic Generator (100% Offline / Zero Failure)
function generateCanvasMockup(firmName, firstName, location, concept, businessName, valueProp) {
  const canvas = document.createElement("canvas");
  canvas.width = 1280;
  canvas.height = 720;
  const ctx = canvas.getContext("2d");

  // Helper for rounded rectangles
  const drawRoundRect = (x, y, w, h, r) => {
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, r);
      ctx.closePath();
    } else {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    }
  };

  // 1. Deep dark background
  const bgGrad = ctx.createLinearGradient(0, 0, 1280, 720);
  bgGrad.addColorStop(0, "#080B11");
  bgGrad.addColorStop(0.5, "#0D111A");
  bgGrad.addColorStop(1, "#121824");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1280, 720);

  // 2. Glowing ambient blur orbs
  const glow1 = ctx.createRadialGradient(200, 180, 10, 200, 180, 260);
  glow1.addColorStop(0, "rgba(0, 240, 255, 0.16)");
  glow1.addColorStop(1, "rgba(0, 240, 255, 0)");
  ctx.fillStyle = glow1;
  ctx.fillRect(0, 0, 600, 500);

  const glow2 = ctx.createRadialGradient(1080, 520, 10, 1080, 520, 280);
  glow2.addColorStop(0, "rgba(139, 92, 246, 0.18)");
  glow2.addColorStop(1, "rgba(139, 92, 246, 0)");
  ctx.fillStyle = glow2;
  ctx.fillRect(680, 200, 600, 520);

  // Header Title
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 42px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(firmName || "Client Workflow", 640, 95);

  ctx.fillStyle = "#00F0FF";
  ctx.font = "600 22px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText(`${businessName || "SmartRename AI"} Architecture • ${location || "USA"}`, 640, 138);

  if (concept === "videoThumb") {
    // Video Player Concept
    ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
    ctx.strokeStyle = "rgba(0, 240, 255, 0.4)";
    ctx.lineWidth = 2;
    drawRoundRect(160, 180, 960, 460, 24);
    ctx.fill();
    ctx.stroke();

    // Large Center Frosted Play Button
    ctx.fillStyle = "rgba(0, 240, 255, 0.15)";
    ctx.strokeStyle = "#00F0FF";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(640, 380, 60, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Play Triangle
    ctx.fillStyle = "#00F0FF";
    ctx.beginPath();
    ctx.moveTo(630, 355);
    ctx.lineTo(665, 380);
    ctx.lineTo(630, 405);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 28px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText(`30-Sec Workflow Demo for ${firstName || "Team"} at ${firmName}`, 640, 490);

    ctx.fillStyle = "#94A3B8";
    ctx.font = "18px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText(`Interactive walkthrough: ${valueProp || "Automated OCR Document Organization"}`, 640, 530);

    // Duration pill
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    drawRoundRect(1000, 580, 90, 34, 8);
    ctx.fill();
    ctx.fillStyle = "#00F0FF";
    ctx.font = "bold 15px monospace";
    ctx.fillText("00:45", 1045, 603);
  } else if (concept === "portalDashboard") {
    // SaaS Portal Dashboard Concept
    const cardDefs = [
      { x: 120, y: 190, w: 320, h: 200, title: "Total Scans Read", val: "142 Files", tag: "+100% OCR Accuracy", color: "#00F0FF" },
      { x: 480, y: 190, w: 320, h: 200, title: "Processing Latency", val: "0.8s / File", tag: "Multi-Modal Vision", color: "#8B5CF6" },
      { x: 840, y: 190, w: 320, h: 200, title: "Weekly Time Saved", val: "4.5 Hours", tag: "Per Bookkeeper", color: "#10B981" }
    ];

    cardDefs.forEach(c => {
      ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.lineWidth = 1.5;
      drawRoundRect(c.x, c.y, c.w, c.h, 16);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#94A3B8";
      ctx.font = "16px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(c.title, c.x + 24, c.y + 45);

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 34px sans-serif";
      ctx.fillText(c.val, c.x + 24, c.y + 105);

      ctx.fillStyle = c.color;
      ctx.font = "bold 15px sans-serif";
      ctx.fillText(`● ${c.tag}`, c.x + 24, c.y + 155);
    });

    // Queue Box
    ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
    ctx.strokeStyle = "rgba(0, 240, 255, 0.25)";
    drawRoundRect(120, 420, 1040, 230, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#00F0FF";
    ctx.font = "bold 20px sans-serif";
    ctx.fillText(`⚡ Live Filing Queue: ${firmName} Client Batches`, 150, 465);

    ctx.font = "14px monospace";
    ctx.fillStyle = "#A1A1AA";
    ctx.fillText("✓ 2026_Adobe_INV-891.pdf     ➔  /Clients/Apex/Invoices/    [EXTRACTED]", 150, 515);
    ctx.fillText("✓ 2026_HomeDepot_RCP-42.pdf  ➔  /Clients/Apex/Receipts/    [EXTRACTED]", 150, 555);
    ctx.fillText("✓ 2026_Chase_BankStmt.pdf    ➔  /Clients/Beacon/Banking/   [EXTRACTED]", 150, 595);
  } else {
    // Split Screen Before & After (Default)
    // Left Card: Before
    ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
    ctx.strokeStyle = "rgba(239, 68, 68, 0.4)";
    ctx.lineWidth = 2;
    drawRoundRect(80, 180, 510, 440, 20);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#EF4444";
    ctx.font = "bold 24px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("⚠️ BEFORE: Chaotic Client Files", 115, 235);

    // Save and clip to left card to strictly prevent text overflow
    ctx.save();
    drawRoundRect(80, 180, 510, 440, 20);
    ctx.clip();

    const messyFiles = [
      "📄 scan_0042.pdf",
      "📷 IMG_9102.jpg",
      "📄 receipt_coffee.pdf",
      "📄 invoice_temp.pdf",
      "📄 project_notes_v2.docx",
      "📷 IMG_2026_receipt.jpg"
    ];
    ctx.font = "14px 'SF Mono', Menlo, Consolas, monospace";
    ctx.fillStyle = "#94A3B8";
    messyFiles.forEach((file, idx) => {
      ctx.fillText(file, 115, 295 + (idx * 50));
    });
    ctx.restore();

    // Center Arrow
    ctx.fillStyle = "#00F0FF";
    ctx.font = "bold 44px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("➔", 640, 410);

    // Right Card: After
    ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
    ctx.strokeStyle = "rgba(0, 240, 255, 0.5)";
    ctx.lineWidth = 2;
    drawRoundRect(690, 180, 510, 440, 20);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#00F0FF";
    ctx.font = "bold 24px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`✨ AFTER: ${businessName || "SmartRename AI"}`, 725, 235);

    // Save and clip to right card to strictly prevent text overflow
    ctx.save();
    drawRoundRect(690, 180, 510, 440, 20);
    ctx.clip();

    const cleanFiles = [
      "📁 Clients/Apex/2026_Adobe_INV.pdf",
      "📁 Clients/Beacon/2026_Staples_RCP.pdf",
      "📁 Clients/Apex/2026_MeetingNotes.pdf",
      "📁 Clients/Zenith/2026_QuickBooks.pdf",
      "📁 Clients/Beacon/2026_Contract.pdf",
      "📁 Clients/Zenith/2026_Proposal.pdf"
    ];
    ctx.font = "14px 'SF Mono', Menlo, Consolas, monospace";
    ctx.fillStyle = "#34D399";
    cleanFiles.forEach((file, idx) => {
      ctx.fillText(file, 725, 295 + (idx * 50));
    });
    ctx.restore();
  }

  // Footer Tag
  ctx.fillStyle = "#64748B";
  ctx.font = "15px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`Generated exclusively for ${firmName} • Automated Architecture Preview`, 640, 685);

  return canvas.toDataURL("image/jpeg", 0.95);
}

function insertMockupNoteIntoEmail() {
  if (!activeLead) return;
  const bodyEl = document.getElementById("drafterBody");
  if (!bodyEl) return;
  
  const note = `\n\nP.S. I put together a quick visual preview of what ${activeLead.firmName}'s workflow looks like with ${settings.businessName}—see the attached image!`;
  if (!bodyEl.value.includes("P.S. I put together a quick visual preview")) {
    bodyEl.value = bodyEl.value.trim() + note;
    showToast("P.S. image attachment note added to email! 📎");
  } else {
    showToast("Note already present in email body.");
  }
}

// Status Management
function cycleStatus(leadId) {
  const order = ["pending", "contacted", "sample", "won"];
  const lead = leads.find(l => l.id === leadId);
  if (!lead) return;
  const nextIdx = (order.indexOf(lead.status) + 1) % order.length;
  setLeadStatus(leadId, order[nextIdx]);
}

function setLeadStatus(leadId, newStatus) {
  const lead = leads.find(l => l.id === leadId);
  if (lead) {
    lead.status = newStatus;
    saveData();
    renderApp();
    if (activeLead && activeLead.id === leadId) {
      updateDrafterStatusPills(newStatus);
    }
    showToast(`Status updated to ${newStatus}`);
  }
}

// ==========================================
// Lead Add / Edit Modal
// ==========================================
function openAddLeadModal() {
  document.getElementById("leadModalTitle").textContent = "Add New Prospect";
  document.getElementById("editLeadId").value = "";
  document.getElementById("leadForm").reset();
  const delBtn = document.getElementById("btnDeleteLeadModal");
  if (delBtn) delBtn.style.display = "none";
  const statusEl = document.getElementById("formStatus");
  if (statusEl) statusEl.value = "pending";
  const dealValEl = document.getElementById("formDealValue");
  if (dealValEl) dealValEl.value = "";
  const notesEl = document.getElementById("formNotes");
  if (notesEl) notesEl.value = "";
  const fuDateEl = document.getElementById("formFollowUpDate");
  if (fuDateEl) fuDateEl.value = "";
  const jobTitleEl = document.getElementById("formJobTitle");
  if (jobTitleEl) jobTitleEl.value = "";
  document.getElementById("modalLead").style.display = "flex";
}

function openEditLeadModal(lead) {
  document.getElementById("leadModalTitle").textContent = "Edit Prospect";
  document.getElementById("editLeadId").value = lead.id;
  document.getElementById("formFirmName").value = lead.firmName;
  document.getElementById("formFirstName").value = lead.firstName;
  const jobTitleEl = document.getElementById("formJobTitle");
  if (jobTitleEl) jobTitleEl.value = lead.jobTitle || "";
  document.getElementById("formLocation").value = lead.location || "";
  document.getElementById("formEmail").value = lead.email;
  document.getElementById("formWebsite").value = lead.website || "";
  document.getElementById("formHook").value = lead.personalHook || "";
  
  const dealValEl = document.getElementById("formDealValue");
  if (dealValEl) dealValEl.value = (lead.dealValue !== undefined && lead.dealValue !== null) ? lead.dealValue : "";
  const notesEl = document.getElementById("formNotes");
  if (notesEl) notesEl.value = lead.notes || "";

  const delBtn = document.getElementById("btnDeleteLeadModal");
  if (delBtn) delBtn.style.display = "inline-flex";

  const statusEl = document.getElementById("formStatus");
  if (statusEl) statusEl.value = lead.status || "pending";
  const fuDateEl = document.getElementById("formFollowUpDate");
  if (fuDateEl) {
    fuDateEl.value = lead.followUpDueAt ? lead.followUpDueAt.split("T")[0] : "";
  }
  
  document.getElementById("modalLead").style.display = "flex";
}

function deleteLead(leadId) {
  const target = leads.find(l => String(l.id) === String(leadId));
  if (!target) return;

  if (confirm(`Delete "${target.firmName}" from your pipeline?`)) {
    leads = leads.filter(l => String(l.id) !== String(leadId));
    saveData();
    renderApp();
    if (activeLead && String(activeLead.id) === String(leadId)) {
      closeDrafter();
    }
    closeLeadModal();
    showToast(`Deleted ${target.firmName} 🗑️`);
  }
}

function closeLeadModal() {
  document.getElementById("modalLead").style.display = "none";
}

function handleSaveLead(e) {
  e.preventDefault();
  const idVal = document.getElementById("editLeadId").value;
  const firmName = document.getElementById("formFirmName").value.trim();
  const firstName = document.getElementById("formFirstName").value.trim() || "there";
  const jobTitle = document.getElementById("formJobTitle") ? document.getElementById("formJobTitle").value.trim() : "";
  const location = document.getElementById("formLocation").value.trim() || "USA";
  const email = document.getElementById("formEmail").value.trim();
  const website = document.getElementById("formWebsite").value.trim();
  const personalHook = document.getElementById("formHook").value.trim() || "noticed your client services";
  
  const statusVal = document.getElementById("formStatus") ? document.getElementById("formStatus").value : "pending";
  const dealValueVal = document.getElementById("formDealValue") ? parseFloat(document.getElementById("formDealValue").value) || 0 : 0;
  const notesVal = document.getElementById("formNotes") ? document.getElementById("formNotes").value.trim() : "";
  const followUpDateVal = document.getElementById("formFollowUpDate") ? document.getElementById("formFollowUpDate").value : "";

  if (!firmName || !email) {
    showToast("Please provide firm name and email.");
    return;
  }

  if (idVal) {
    // Edit existing
    const lead = leads.find(l => l.id === Number(idVal));
    if (lead) {
      lead.firmName = firmName;
      lead.firstName = firstName;
      lead.jobTitle = jobTitle;
      lead.location = location;
      lead.email = email;
      lead.website = website;
      lead.personalHook = personalHook;
      lead.status = statusVal;
      lead.dealValue = dealValueVal;
      lead.notes = notesVal;
      lead.followUpDueAt = followUpDateVal ? new Date(followUpDateVal).toISOString() : null;
      showToast("Prospect updated");
    }
  } else {
    // New Lead
    const newLead = {
      id: Date.now(),
      firmName,
      firstName,
      jobTitle,
      location,
      email,
      website,
      personalHook,
      status: statusVal,
      dealValue: dealValueVal,
      notes: notesVal,
      followUpDueAt: followUpDateVal ? new Date(followUpDateVal).toISOString() : null,
      followUpCount: 0
    };
    leads.unshift(newLead);
    showToast("New prospect added!");
  }

  saveData();
  renderApp();
  closeLeadModal();
}

// ==========================================
// AI Lead Scout (Google Search Grounding)
// ==========================================
let discoveredLeads = [];

function openScoutModal() {
  discoveredLeads = [];
  document.getElementById("scoutResultsArea").style.display = "none";
  document.getElementById("scoutResultsList").innerHTML = "";
  
  const loadingArea = document.getElementById("scoutLoadingArea");
  if (loadingArea) loadingArea.style.display = "none";
  
  const errorArea = document.getElementById("scoutErrorArea");
  if (errorArea) errorArea.style.display = "none";

  const warningBanner = document.getElementById("scoutApiKeyWarning");
  if (warningBanner) {
    warningBanner.style.display = settings.geminiApiKey ? "none" : "flex";
  }

  document.getElementById("modalScout").style.display = "flex";
}

function closeScoutModal() {
  document.getElementById("modalScout").style.display = "none";
}

let scoutInterval = null;

async function runScoutWithGemini() {
  const apiKey = settings.geminiApiKey;
  const errorArea = document.getElementById("scoutErrorArea");
  const errorTitle = document.getElementById("scoutErrorTitle");
  const errorMsg = document.getElementById("scoutErrorMessage");
  const fixKeyBtn = document.getElementById("btnScoutFixKey");
  const loadingArea = document.getElementById("scoutLoadingArea");
  const loadingStep = document.getElementById("scoutLoadingStep");
  const loadingSub = document.getElementById("scoutLoadingSub");
  const resultsArea = document.getElementById("scoutResultsArea");

  if (errorArea) errorArea.style.display = "none";
  if (resultsArea) resultsArea.style.display = "none";

  if (!apiKey) {
    if (errorArea) {
      errorTitle.textContent = "Gemini API Key Required";
      errorMsg.textContent = "Please add your free Google Gemini API Key in Settings (⚙️) to discover live leads.";
      if (fixKeyBtn) fixKeyBtn.style.display = "inline-block";
      errorArea.style.display = "flex";
    }
    showToast("Please configure your Gemini API Key in Settings (⚙️)");
    return;
  }

  const country = document.getElementById("scoutCountry").value.trim() || "Nigeria";
  const state = document.getElementById("scoutState").value.trim() || "Lagos";
  const lga = document.getElementById("scoutLga").value.trim() || "Ikeja";
  let niche = document.getElementById("scoutNiche").value;
  if (niche === "custom") {
    const customVal = document.getElementById("scoutNicheCustom")?.value.trim();
    niche = customVal || settings.targetNiche || "local businesses";
  }
  const count = parseInt(document.getElementById("scoutCount").value, 10) || 3;

  const btn = document.getElementById("btnRunScout");
  const btnText = document.getElementById("scoutBtnText");
  const originalText = btnText.textContent;

  btn.disabled = true;
  btnText.textContent = `Scouting Google for ${lga}...`;

  // Start animated loading feedback
  if (loadingArea) loadingArea.style.display = "flex";
  const feedbackSteps = [
    { title: "Connecting to Google Search...", sub: `Querying ${niche} in ${lga}, ${state}...` },
    { title: "Scanning live business registries...", sub: "Extracting official websites and locations..." },
    { title: "Verifying contact emails...", sub: "Filtering active owner/partner records..." },
    { title: "Formatting prospect profiles...", sub: "Preparing verified pipeline leads..." }
  ];

  let stepIdx = 0;
  if (loadingStep && loadingSub) {
    loadingStep.textContent = feedbackSteps[0].title;
    loadingSub.textContent = feedbackSteps[0].sub;
    clearInterval(scoutInterval);
    scoutInterval = setInterval(() => {
      stepIdx = (stepIdx + 1) % feedbackSteps.length;
      loadingStep.textContent = feedbackSteps[stepIdx].title;
      loadingSub.textContent = feedbackSteps[stepIdx].sub;
    }, 2800);
  }

  const promptText = `Use Google Search to find exactly ${count} real, active ${niche} physically located or operating in ${lga}, ${state}, ${country}.
For each business, extract their real firm name, owner or partner name (if unknown, use "there"), official website URL, public business/contact email address, and a 1-sentence observation about their specific services or specialty.

Format your output STRICTLY as a JSON array of objects with these exact keys:
[
  {
    "firm_name": "...",
    "owner_name": "...",
    "email": "...",
    "website": "...",
    "location": "${lga}, ${state}",
    "hook": "..."
  }
]
Output ONLY valid JSON. Do not include markdown code block formatting or explanation.`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }],
        tools: [{ google_search: {} }]
      })
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      const msg = errJson?.error?.message || `Gemini API error: ${response.status}`;
      throw new Error(msg);
    }

    const data = await response.json();
    let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Clean markdown fences if present
    rawText = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();

    // Parse JSON
    const parsed = JSON.parse(rawText);
    if (Array.isArray(parsed) && parsed.length > 0) {
      discoveredLeads = parsed;
      renderScoutedResults(discoveredLeads);
      if (loadingArea) loadingArea.style.display = "none";
      if (resultsArea) resultsArea.style.display = "block";
      showToast(`Found ${discoveredLeads.length} authentic leads in ${lga}! ✨`);
    } else {
      throw new Error("No leads parsed from Google Search results.");
    }
  } catch (err) {
    console.error("Scout Error:", err);
    if (loadingArea) loadingArea.style.display = "none";
    if (errorArea) {
      const isLeaked = err.message.includes("leaked") || err.message.includes("PERMISSION_DENIED");
      errorTitle.textContent = isLeaked ? "API Key Revoked / Expired (403)" : "Scout Error";
      errorMsg.textContent = isLeaked
        ? "This API key was flagged as leaked or expired by Google. Please generate a fresh free key at Google AI Studio and update it in Settings."
        : `Could not retrieve leads: ${err.message}. Try broadening the location.`;
      if (fixKeyBtn) fixKeyBtn.style.display = "inline-block";
      errorArea.style.display = "flex";
    }
    showToast(`Scout Error: ${err.message}`);
  } finally {
    clearInterval(scoutInterval);
    if (loadingArea) loadingArea.style.display = "none";
    btn.disabled = false;
    btnText.textContent = originalText;
  }
}

function renderScoutedResults(list) {
  const container = document.getElementById("scoutResultsList");
  container.innerHTML = "";

  list.forEach((item) => {
    const card = document.createElement("div");
    card.className = "scouted-card";
    card.innerHTML = `
      <div class="scouted-title">${escapeHtml(item.firm_name)}</div>
      <div class="scouted-meta">
        <span>👤 ${escapeHtml(item.owner_name || "Lead Partner")}</span>
        <span>•</span>
        <span>✉️ ${escapeHtml(item.email || "contact on site")}</span>
      </div>
      <div class="scouted-desc">"${escapeHtml(item.hook || "local client services")}"</div>
    `;
    container.appendChild(card);
  });
}

function importScoutedLeads() {
  if (!discoveredLeads || discoveredLeads.length === 0) return;

  let addedCount = 0;
  discoveredLeads.forEach(item => {
    const exists = leads.some(l => l.email && l.email.toLowerCase() === (item.email || "").toLowerCase());
    if (!exists) {
      leads.unshift({
        id: Date.now() + Math.floor(Math.random() * 1000),
        firmName: item.firm_name || "Prospective Firm",
        firstName: item.owner_name || "there",
        location: item.location || "Local",
        email: item.email || "info@example.com",
        website: item.website || "",
        personalHook: item.hook || "noticed your specialized local client services",
        status: "pending"
      });
      addedCount++;
    }
  });

  saveData();
  renderApp();
  closeScoutModal();
  showToast(`Imported ${addedCount} new leads to pipeline! 🎉`);
}

// ==========================================
// Settings, Import & Export
// ==========================================
function openSettingsModal() {
  document.getElementById("modalSettings").style.display = "flex";
}

function closeSettingsModal() {
  document.getElementById("modalSettings").style.display = "none";
}

function exportData() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(leads, null, 2));
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `buzz_leads_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  showToast("Leads backup exported!");
}

function exportPipelineCsv() {
  if (!leads || leads.length === 0) {
    showToast("No leads in pipeline to export.");
    return;
  }

  let listToExport = [];
  let exportScopeLabel = "all";

  if (selectedLeadIds && selectedLeadIds.size > 0) {
    listToExport = leads.filter(l => selectedLeadIds.has(l.id));
    exportScopeLabel = `selected_${selectedLeadIds.size}`;
  } else if (currentFilter && currentFilter !== "all") {
    if (currentFilter === "followups") {
      listToExport = leads.filter(l => l.status === "contacted" && isFollowUpDue(l));
    } else {
      listToExport = leads.filter(l => l.status === currentFilter);
    }
    exportScopeLabel = currentFilter;
  } else {
    listToExport = [...leads];
    exportScopeLabel = "all";
  }

  if (listToExport.length === 0) {
    showToast("No matching leads found for export.");
    return;
  }

  const headers = [
    "Company",
    "Contact First Name",
    "Job Title",
    "Direct Email",
    "Location",
    "Website",
    "Personal Hook",
    "Pipeline Status",
    "Deal Value ($)",
    "Next Follow-Up Date",
    "Follow-Up Cadence Step",
    "Last Contacted Date",
    "Notes & Activity"
  ];

  const escapeCsvVal = (val) => {
    if (val === undefined || val === null) return '""';
    const s = String(val).replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows = listToExport.map(l => {
    const fuDate = l.followUpDueAt ? l.followUpDueAt.split("T")[0] : "";
    const lastDate = l.lastContactedAt ? l.lastContactedAt.split("T")[0] : "";
    return [
      escapeCsvVal(l.firmName || ""),
      escapeCsvVal(l.firstName || ""),
      escapeCsvVal(l.jobTitle || ""),
      escapeCsvVal(l.email || ""),
      escapeCsvVal(l.location || ""),
      escapeCsvVal(l.website || ""),
      escapeCsvVal(l.personalHook || ""),
      escapeCsvVal(l.status || "pending"),
      escapeCsvVal(l.dealValue || 0),
      escapeCsvVal(fuDate),
      escapeCsvVal(l.followUpCount || 0),
      escapeCsvVal(lastDate),
      escapeCsvVal(l.notes || "")
    ].join(",");
  });

  const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const dateStr = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `buzz_pipeline_${exportScopeLabel}_${dateStr}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast(`Exported ${listToExport.length} leads to CSV! 📤`);
}

function importData(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const imported = JSON.parse(event.target.result);
      if (Array.isArray(imported)) {
        leads = imported;
        saveData();
        renderApp();
        showToast(`Imported ${imported.length} leads successfully!`);
        closeSettingsModal();
      } else {
        showToast("Invalid JSON file format.");
      }
    } catch (err) {
      showToast("Failed to parse JSON file.");
    }
  };
  reader.readAsText(file);
}

function clearAllLeads() {
  if (!leads || leads.length === 0) {
    showToast("Pipeline is already empty.");
    return;
  }
  if (confirm(`Are you sure you want to delete all ${leads.length} leads in your pipeline? You can always restore the sample leads or re-import a backup.`)) {
    leads = [];
    saveData();
    renderApp();
    closeSettingsModal();
    showToast("All leads cleared from pipeline 🗑️");
  }
}

function resetToDefaults() {
  if (confirm("Reset all leads back to the default 10 verified prospects?")) {
    leads = [...DEFAULT_LEADS];
    saveData();
    renderApp();
    showToast("Reset to 10 default leads.");
    closeSettingsModal();
  }
}

// ==========================================
// Live In-Browser B2B Web Scraper (Modal 8)
// Zero-API Nominatim & OpenStreetMap Engine
// ==========================================
let scrapedLeadsCache = [];

function openScraperModal() {
  resetScraperModalState();
  const modal = document.getElementById("modalWebScraper");
  if (modal) modal.style.display = "flex";
}

function closeScraperModal() {
  const modal = document.getElementById("modalWebScraper");
  if (modal) modal.style.display = "none";
  resetScraperModalState();
}

function resetScraperModalState() {
  scrapedLeadsCache = [];
  const progressArea = document.getElementById("scraperProgressArea");
  if (progressArea) progressArea.style.display = "none";
  
  const resultsArea = document.getElementById("scraperResultsArea");
  if (resultsArea) resultsArea.style.display = "none";

  const configArea = document.getElementById("scraperConfigArea");
  if (configArea) configArea.style.display = "block";

  const btnStart = document.getElementById("btnStartScraping");
  if (btnStart) {
    btnStart.disabled = false;
    btnStart.innerHTML = "<span>🚀 Start Live Web Scraping</span>";
  }

  const tbody = document.getElementById("scraperResultsTbody");
  if (tbody) tbody.innerHTML = "";
}

function updateScraperProgress(percent, title, sub) {
  const progressArea = document.getElementById("scraperProgressArea");
  if (progressArea) progressArea.style.display = "block";

  const fill = document.getElementById("scraperProgressBarFill");
  if (fill) fill.style.width = `${percent}%`;

  const titleEl = document.getElementById("scraperStatusTitle");
  if (titleEl && title) titleEl.textContent = title;

  const subEl = document.getElementById("scraperStatusSub");
  if (subEl && sub) subEl.textContent = sub;
}

async function startInBrowserScraping() {
  const nicheSelect = document.getElementById("scraperNiche")?.value || "Bookkeeping & Accounting";
  const customNiche = document.getElementById("scraperNicheCustom")?.value.trim() || "";
  const niche = (nicheSelect === "custom" && customNiche) ? customNiche : nicheSelect;
  const location = document.getElementById("scraperLocation")?.value.trim() || "Austin, TX";
  const limit = parseInt(document.getElementById("scraperLimit")?.value || "25", 10);
  const filterDecision = document.getElementById("chkScraperDecisionMakers")?.checked;

  if (!location) {
    showToast("Please enter a target city or location.");
    return;
  }

  const btnStart = document.getElementById("btnStartScraping");
  if (btnStart) {
    btnStart.disabled = true;
    btnStart.innerHTML = "<span>⏳ Scraping in progress...</span>";
  }

  updateScraperProgress(15, `Geocoding ${location}...`, "Connecting to Nominatim open registry");

  try {
    // Step 1: Geocode location to bounding box using Nominatim
    const nomUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`;
    const nomResp = await fetch(nomUrl, {
      headers: { "Accept": "application/json" }
    });

    if (!nomResp.ok) throw new Error("Location geocoding failed");
    const nomData = await nomResp.json();
    if (!nomData || nomData.length === 0) {
      throw new Error(`Could not locate "${location}". Please specify City and State/Country.`);
    }

    const bbox = nomData[0].boundingbox; // [s, n, w, e]
    const s = parseFloat(bbox[0]);
    const n = parseFloat(bbox[1]);
    const w = parseFloat(bbox[2]);
    const e = parseFloat(bbox[3]);

    updateScraperProgress(40, `Discovering businesses for ${niche}...`, `Searching OpenStreetMap in ${nomData[0].display_name.split(",")[0]}`);

    // Determine tag filter based on niche
    const nLower = niche.toLowerCase();
    let tagFilter = '["office"]';
    if (nLower.includes("bookkeep") || nLower.includes("account") || nLower.includes("cpa") || nLower.includes("tax") || nLower.includes("finance")) {
      tagFilter = '["office"~"accountant|financial|tax_advisor|insurance|financial_advisor"]';
    } else if (nLower.includes("law") || nLower.includes("legal") || nLower.includes("attorney")) {
      tagFilter = '["office"~"lawyer|notary|attorney"]';
    } else if (nLower.includes("dent") || nLower.includes("clinic") || nLower.includes("medic") || nLower.includes("doctor")) {
      tagFilter = '["amenity"~"dentist|clinic|doctors|pharmacy"]';
    } else if (nLower.includes("real") || nLower.includes("estate") || nLower.includes("property")) {
      tagFilter = '["office"="estate_agent"]';
    } else if (nLower.includes("design") || nLower.includes("agency") || nLower.includes("architect")) {
      tagFilter = '["office"~"architect|engineer|graphic_design"]';
    } else if (nLower.includes("construct") || nLower.includes("roof") || nLower.includes("plumb") || nLower.includes("contract")) {
      tagFilter = '["craft"]';
    }

    // Step 2: Query Overpass API with bounding box
    const overpassQuery = `
      [out:json][timeout:25];
      (
        node${tagFilter}(${s},${w},${n},${e})["website"];
        way${tagFilter}(${s},${w},${n},${e})["website"];
        relation${tagFilter}(${s},${w},${n},${e})["website"];
        node${tagFilter}(${s},${w},${n},${e})["contact:website"];
        way${tagFilter}(${s},${w},${n},${e})["contact:website"];
      );
      out center ${limit * 3};
    `;

    updateScraperProgress(65, "Extracting business registries & contacts...", "Querying live Overpass API servers");

    const overpassMirrors = [
      "https://overpass-api.de/api/interpreter",
      "https://overpass.kumi.systems/api/interpreter"
    ];

    let elements = [];
    for (const mirror of overpassMirrors) {
      try {
        const opResp = await fetch(mirror, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: "data=" + encodeURIComponent(overpassQuery)
        });
        if (opResp.ok) {
          const opData = await opResp.json();
          elements = opData.elements || [];
          if (elements.length > 0) break;
        }
      } catch (err) {
        console.warn(`Mirror ${mirror} failed, trying next...`);
      }
    }

    // If specific tag filter returned nothing, try fallback to broad office query
    if (elements.length === 0) {
      const fallbackQuery = `
        [out:json][timeout:25];
        (
          node["office"](${s},${w},${n},${e})["website"];
          way["office"](${s},${w},${n},${e})["website"];
        );
        out center ${limit * 2};
      `;
      try {
        const fbResp = await fetch("https://overpass-api.de/api/interpreter", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: "data=" + encodeURIComponent(fallbackQuery)
        });
        if (fbResp.ok) {
          const fbData = await fbResp.json();
          elements = fbData.elements || [];
        }
      } catch(e) {}
    }

    updateScraperProgress(85, "Synthesizing executive leads & hooks...", "Formatting prospect profiles");

    // Process elements
    const seenDomains = new Set();
    const candidateLeads = [];
    let nextId = Date.now();

    for (const el of elements) {
      const tags = el.tags || {};
      const company = (tags.name || tags.brand || tags.operator || "").trim();
      const website = (tags["contact:website"] || tags.website || "").trim();
      const phone = (tags["contact:phone"] || tags.phone || "").trim();
      const rawEmail = (tags["contact:email"] || tags.email || "").trim();

      if (!company || !website) continue;

      let cleanDomain = website.replace(/^https?:\/\//i, "").replace(/^www\./i, "").split("/")[0].toLowerCase();
      if (!cleanDomain || seenDomains.has(cleanDomain)) continue;
      seenDomains.add(cleanDomain);

      // Determine contact email
      let email = rawEmail;
      let firstName = "there";
      if (!email) {
        email = `contact@${cleanDomain}`;
      } else {
        const u = email.split("@")[0].toLowerCase();
        if (u && !["info", "contact", "support", "office", "admin", "sales"].includes(u) && u.length >= 2) {
          firstName = u.charAt(0).toUpperCase() + u.slice(1);
        }
      }

      // Title & Hook
      const title = filterDecision ? "Founder / Owner" : "Principal";
      const hook = `noticed your client services at ${company} in ${location.split(",")[0].trim()}`;

      candidateLeads.push({
        id: nextId++,
        company,
        firstName,
        lastName: "",
        title,
        email: email.toLowerCase(),
        location,
        website: website.startsWith("http") ? website : `https://${website}`,
        phone,
        personalHook: hook
      });

      if (candidateLeads.length >= limit) break;
    }

    if (candidateLeads.length === 0) {
      throw new Error(`No businesses found with registered websites in ${location}. Try a larger metro area.`);
    }

    scrapedLeadsCache = candidateLeads;
    updateScraperProgress(100, `Complete! Found ${candidateLeads.length} leads.`, "Ready to ingest or export");

    // Render results in table
    renderScrapedResultsTable(candidateLeads);

  } catch (err) {
    console.error("Scraper error:", err);
    updateScraperProgress(0, "Scraping issue encountered", err.message || "Failed to reach registry servers.");
    showToast(err.message || "Scraping failed. Try another city or broader niche.");
  } finally {
    if (btnStart) {
      btnStart.disabled = false;
      btnStart.innerHTML = "<span>🚀 Scrape Again</span>";
    }
  }
}

function renderScrapedResultsTable(leadsList) {
  const resultsArea = document.getElementById("scraperResultsArea");
  if (resultsArea) resultsArea.style.display = "block";

  const countEl = document.getElementById("scraperResultsCount");
  if (countEl) countEl.textContent = `${leadsList.length} Verified Leads Scraped`;

  const tbody = document.getElementById("scraperResultsTbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  leadsList.forEach((l, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td style="text-align: center;">
        <input type="checkbox" class="scraped-lead-chk custom-checkbox" data-idx="${idx}" checked />
      </td>
      <td style="font-weight: 600; color: #fff;">${escapeHtml(l.company)}</td>
      <td>
        <span>${escapeHtml(l.firstName)}</span>
        <span class="lead-role-pill" style="margin-left: 4px;">${escapeHtml(l.title)}</span>
      </td>
      <td style="color: var(--accent-cyan); font-family: monospace; font-size: 11px;">
        ${escapeHtml(l.email)}
      </td>
      <td>
        <a href="${escapeHtml(l.website)}" target="_blank" rel="noopener" style="color: var(--accent-purple); text-decoration: underline; font-size: 11.5px;">
          ${escapeHtml(l.website.replace(/^https?:\/\//, '').slice(0, 20))}…
        </a>
      </td>
      <td style="color: var(--text-muted); font-size: 11px;">
        ${escapeHtml(l.phone || '—')}
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Attach change listeners to row checkboxes to update ingest button count
  document.querySelectorAll(".scraped-lead-chk").forEach(chk => {
    chk.addEventListener("change", updateIngestScrapedButtonText);
  });

  const selectAllChk = document.getElementById("chkScraperSelectAll");
  if (selectAllChk) {
    selectAllChk.checked = true;
  }

  updateIngestScrapedButtonText();
}

function updateIngestScrapedButtonText() {
  const chks = document.querySelectorAll(".scraped-lead-chk:checked");
  const btnText = document.getElementById("btnIngestScrapedText");
  if (btnText) {
    btnText.textContent = `Ingest ${chks.length} Leads into Pipeline`;
  }
}

function ingestSelectedScrapedLeads() {
  const chks = document.querySelectorAll(".scraped-lead-chk:checked");
  if (chks.length === 0) {
    showToast("Please select at least one lead to ingest.");
    return;
  }

  const selectedLeads = [];
  const existingEmails = new Set(leads.map(l => (l.email || "").trim().toLowerCase()).filter(Boolean));
  let duplicatesSkipped = 0;

  chks.forEach(chk => {
    const idx = parseInt(chk.dataset.idx, 10);
    const item = scrapedLeadsCache[idx];
    if (item) {
      if (existingEmails.has(item.email.toLowerCase())) {
        duplicatesSkipped++;
        return;
      }
      selectedLeads.push({
        id: Date.now() + Math.random(),
        firmName: item.company,
        firstName: item.firstName,
        jobTitle: item.title,
        email: item.email,
        location: item.location,
        website: item.website,
        personalHook: item.personalHook,
        status: "pending"
      });
      existingEmails.add(item.email.toLowerCase());
    }
  });

  if (selectedLeads.length === 0) {
    showToast("All selected leads are already in your pipeline.");
    return;
  }

  leads = [...selectedLeads, ...leads];
  saveData();
  currentVisiblePage = 1;
  renderApp();
  closeScraperModal();

  let msg = `Successfully ingested ${selectedLeads.length} leads into pipeline! 🚀`;
  if (duplicatesSkipped > 0) {
    msg += ` (${duplicatesSkipped} duplicates skipped)`;
  }
  showToast(msg);
}

function downloadScrapedLeadsCsv() {
  const chks = document.querySelectorAll(".scraped-lead-chk:checked");
  if (chks.length === 0) {
    showToast("Please select at least one lead to download.");
    return;
  }

  const selectedItems = [];
  chks.forEach(chk => {
    const idx = parseInt(chk.dataset.idx, 10);
    if (scrapedLeadsCache[idx]) {
      selectedItems.push(scrapedLeadsCache[idx]);
    }
  });

  const headers = ["Company", "First Name", "Last Name", "Title", "Email", "Location", "Website", "Phone", "Hook"];
  const rows = [headers.join(",")];

  selectedItems.forEach(item => {
    const r = [
      `"${(item.company || '').replace(/"/g, '""')}"`,
      `"${(item.firstName || '').replace(/"/g, '""')}"`,
      `"${(item.lastName || '').replace(/"/g, '""')}"`,
      `"${(item.title || 'Owner').replace(/"/g, '""')}"`,
      `"${(item.email || '').replace(/"/g, '""')}"`,
      `"${(item.location || '').replace(/"/g, '""')}"`,
      `"${(item.website || '').replace(/"/g, '""')}"`,
      `"${(item.phone || '').replace(/"/g, '""')}"`,
      `"${(item.personalHook || '').replace(/"/g, '""')}"`
    ];
    rows.push(r.join(","));
  });

  const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(rows.join("\n"));
  const a = document.createElement("a");
  a.setAttribute("href", csvContent);
  a.setAttribute("download", `buzz_scraped_leads_${Date.now()}.csv`);
  document.body.appendChild(a);
  a.click();
  a.remove();
  showToast(`Downloaded ${selectedItems.length} leads to CSV! 📁`);
}

// ==========================================
// Universal B2B CSV / Excel Importer
// ==========================================
let parsedCsvRawRows = [];
let parsedCsvHeaders = [];
let currentCsvFileName = "";

const DECISION_MAKER_REGEX = /\b(ceo|cto|cfo|coo|cmo|cro|cio|md|vp|chief\s+[a-z\s-]+officer|chief\s+executive|founder|co-founder|owner|co-owner|managing\s+director|managing\s+partner|president|partner|principal|director|head\s+of|vice\s+president)\b/i;

function openCsvImportModal() {
  resetCsvImportState();
  const modal = document.getElementById("modalCsvImport");
  if (modal) modal.style.display = "flex";
}

function closeCsvImportModal() {
  const modal = document.getElementById("modalCsvImport");
  if (modal) modal.style.display = "none";
  resetCsvImportState();
}

function resetCsvImportState() {
  parsedCsvRawRows = [];
  parsedCsvHeaders = [];
  currentCsvFileName = "";
  const fileInput = document.getElementById("inputCsvFile");
  if (fileInput) fileInput.value = "";
  
  const uploadArea = document.getElementById("csvUploadArea");
  if (uploadArea) uploadArea.style.display = "block";
  
  const mappingArea = document.getElementById("csvMappingArea");
  if (mappingArea) mappingArea.style.display = "none";
  
  const previewTbody = document.getElementById("csvPreviewTbody");
  if (previewTbody) previewTbody.innerHTML = "";
  
  const btnConfirmText = document.getElementById("btnConfirmCsvText");
  if (btnConfirmText) btnConfirmText.textContent = "Ingest Leads into Pipeline";
}

function detectDelimiter(firstLine) {
  const commas = (firstLine.match(/,/g) || []).length;
  const tabs = (firstLine.match(/\t/g) || []).length;
  const semis = (firstLine.match(/;/g) || []).length;
  if (tabs > commas && tabs > semis) return "\t";
  if (semis > commas && semis > tabs) return ";";
  return ",";
}

function parseCSVText(text) {
  if (!text || !text.trim()) return [];
  // Strip BOM if present
  if (text.charCodeAt(0) === 0xFEFF) {
    text = text.slice(1);
  }

  const firstLineEnd = text.search(/\r\n|\r|\n/);
  const firstLine = firstLineEnd === -1 ? text : text.slice(0, firstLineEnd);
  const delimiter = detectDelimiter(firstLine);

  const rows = [];
  let currentRow = [];
  let currentVal = "";
  let inQuotes = false;
  const len = text.length;

  for (let i = 0; i < len; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentVal += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      currentRow.push(currentVal.trim());
      currentVal = "";
    } else if ((char === "\r" || char === "\n") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        i++; // skip \n of \r\n
      }
      currentRow.push(currentVal.trim());
      currentVal = "";
      if (currentRow.some(cell => cell.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
    } else {
      currentVal += char;
    }
  }

  if (currentVal.length > 0 || currentRow.length > 0) {
    currentRow.push(currentVal.trim());
    if (currentRow.some(cell => cell.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

function handleCsvFileSelected(file) {
  if (!file) return;
  currentCsvFileName = file.name;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const text = e.target.result;
      const allRows = parseCSVText(text);
      if (!allRows || allRows.length < 2) {
        showToast("The selected CSV appears to be empty or missing data rows.");
        return;
      }

      parsedCsvHeaders = allRows[0].map(h => (h || "").trim());
      parsedCsvRawRows = allRows.slice(1);

      // Update UI elements
      const fileNameEl = document.getElementById("csvFileName");
      if (fileNameEl) fileNameEl.textContent = file.name;

      const totalRowsEl = document.getElementById("csvTotalRows");
      if (totalRowsEl) totalRowsEl.textContent = `${parsedCsvRawRows.length.toLocaleString()} rows detected`;

      // Populate Column Selectors and auto-detect best matches
      populateColumnSelectors(parsedCsvHeaders);

      // Switch view from dropzone to mapping area
      const uploadArea = document.getElementById("csvUploadArea");
      if (uploadArea) uploadArea.style.display = "none";

      const mappingArea = document.getElementById("csvMappingArea");
      if (mappingArea) mappingArea.style.display = "block";

      // Render initial preview
      renderCsvPreview();
    } catch (err) {
      console.error("CSV parse error:", err);
      showToast("Error reading CSV file. Please check file format.");
    }
  };
  reader.onerror = () => {
    showToast("Failed to read CSV file.");
  };
  reader.readAsText(file);
}

function detectCSVColumns(headers) {
  const mapping = {
    firmName: -1,
    firstName: -1,
    jobTitle: -1,
    email: -1,
    location: -1,
    website: -1
  };

  const normalized = headers.map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ""));

  headers.forEach((h, idx) => {
    const norm = normalized[idx];

    // Company / Firm Name
    if (mapping.firmName === -1) {
      if (/^(company|companyname|accountname|organization|organizationname|firm|firmname|businessname|employer)$/.test(norm) ||
          norm.includes("companyname") || norm.includes("accountname")) {
        mapping.firmName = idx;
      }
    }

    // First Name / Name
    if (mapping.firstName === -1) {
      if (/^(firstname|first|givenname|contactfirstname)$/.test(norm) || norm.includes("firstname")) {
        mapping.firstName = idx;
      }
    }

    // Job Title / Role
    if (mapping.jobTitle === -1) {
      if (/^(title|jobtitle|role|position|headline|designation|occupation)$/.test(norm) ||
          norm.includes("jobtitle") || norm.includes("headline")) {
        mapping.jobTitle = idx;
      }
    }

    // Email
    if (mapping.email === -1) {
      if (/^(email|emailaddress|directemail|contactemail|workemail|corporateemail|primaryemail)$/.test(norm) ||
          norm.includes("email")) {
        mapping.email = idx;
      }
    }

    // Location / City
    if (mapping.location === -1) {
      if (/^(location|city|metro|state|hqlocation|headquarters|companycity|address)$/.test(norm) ||
          norm.includes("location") || norm.includes("city")) {
        mapping.location = idx;
      }
    }

    // Website / URL
    if (mapping.website === -1) {
      if (/^(website|companywebsite|domain|companydomain|url|site)$/.test(norm) ||
          norm.includes("website") || norm.includes("domain")) {
        mapping.website = idx;
      }
    }
  });

  // Secondary fallback for First Name if no explicit "first name" column was found, look for "Full Name" / "Name"
  if (mapping.firstName === -1) {
    headers.forEach((h, idx) => {
      const norm = normalized[idx];
      if (/^(fullname|name|contactname|contact|leadname)$/.test(norm)) {
        mapping.firstName = idx;
      }
    });
  }

  // Secondary fallback for Company if still -1
  if (mapping.firmName === -1) {
    headers.forEach((h, idx) => {
      const norm = normalized[idx];
      if (norm.includes("company") || norm.includes("firm")) {
        mapping.firmName = idx;
      }
    });
  }

  return mapping;
}

function populateColumnSelectors(headers) {
  const detected = detectCSVColumns(headers);
  const fields = [
    { id: "mapFirmName", detectedIdx: detected.firmName, required: true },
    { id: "mapFirstName", detectedIdx: detected.firstName, required: true },
    { id: "mapJobTitle", detectedIdx: detected.jobTitle, required: false },
    { id: "mapEmail", detectedIdx: detected.email, required: true },
    { id: "mapLocation", detectedIdx: detected.location, required: false },
    { id: "mapWebsite", detectedIdx: detected.website, required: false }
  ];

  fields.forEach(field => {
    const select = document.getElementById(field.id);
    if (!select) return;
    select.innerHTML = "";

    const noneOpt = document.createElement("option");
    noneOpt.value = "";
    noneOpt.textContent = field.required ? "-- Select Column --" : "(None / Skip)";
    select.appendChild(noneOpt);

    headers.forEach((h, idx) => {
      const opt = document.createElement("option");
      opt.value = String(idx);
      opt.textContent = `${h || `Column ${idx + 1}`} (${getHeaderSample(idx)})`;
      if (idx === field.detectedIdx) {
        opt.selected = true;
      }
      select.appendChild(opt);
    });
  });
}

function getHeaderSample(colIdx) {
  for (let i = 0; i < Math.min(parsedCsvRawRows.length, 5); i++) {
    const val = parsedCsvRawRows[i][colIdx];
    if (val && val.trim().length > 0) {
      const trimmed = val.trim();
      return trimmed.length > 18 ? trimmed.slice(0, 18) + "…" : trimmed;
    }
  }
  return "empty";
}

function cleanFirstName(rawName) {
  if (!rawName) return "there";
  let cleaned = rawName.trim();
  // Strip common prefixes
  cleaned = cleaned.replace(/^(mr\.|mrs\.|ms\.|dr\.|prof\.)\s+/i, "");
  const parts = cleaned.split(/\s+/);
  if (parts.length > 0 && parts[0]) {
    const first = parts[0].replace(/[^a-zA-Z\xC0-\u024F\u1E00-\u1EFF'-]/g, "");
    if (first.length >= 2) {
      return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
    }
  }
  return "there";
}

function renderCsvPreview() {
  const tbody = document.getElementById("csvPreviewTbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  const firmIdx = document.getElementById("mapFirmName")?.value;
  const nameIdx = document.getElementById("mapFirstName")?.value;
  const titleIdx = document.getElementById("mapJobTitle")?.value;
  const emailIdx = document.getElementById("mapEmail")?.value;
  const locIdx = document.getElementById("mapLocation")?.value;

  const filterDecision = document.getElementById("chkFilterDecisionMakers")?.checked;
  const skipExisting = document.getElementById("chkSkipExistingEmails")?.checked;
  const existingEmails = new Set(leads.map(l => (l.email || "").trim().toLowerCase()).filter(Boolean));

  let previewCount = 0;
  let totalEligibleCount = 0;

  for (let i = 0; i < parsedCsvRawRows.length; i++) {
    const row = parsedCsvRawRows[i];
    const rawEmail = (emailIdx !== "" && emailIdx !== undefined && row[Number(emailIdx)]) ? row[Number(emailIdx)].trim() : "";
    const rawTitle = (titleIdx !== "" && titleIdx !== undefined && row[Number(titleIdx)]) ? row[Number(titleIdx)].trim() : "";
    const rawFirm = (firmIdx !== "" && firmIdx !== undefined && row[Number(firmIdx)]) ? row[Number(firmIdx)].trim() : "";
    const rawName = (nameIdx !== "" && nameIdx !== undefined && row[Number(nameIdx)]) ? row[Number(nameIdx)].trim() : "";
    const rawLoc = (locIdx !== "" && locIdx !== undefined && row[Number(locIdx)]) ? row[Number(locIdx)].trim() : "";

    // Decision-maker filter check
    if (filterDecision && !DECISION_MAKER_REGEX.test(rawTitle)) {
      continue;
    }

    // Skip duplicates check
    const cleanMail = rawEmail.toLowerCase();
    if (skipExisting && cleanMail && existingEmails.has(cleanMail)) {
      continue;
    }

    totalEligibleCount++;

    if (previewCount < 3) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td style="font-weight: 600; color: #fff;">${escapeHtml(rawFirm || "—")}</td>
        <td>${escapeHtml(cleanFirstName(rawName))}</td>
        <td>${rawTitle ? `<span class="lead-role-pill">${escapeHtml(rawTitle)}</span>` : '<span style="color: var(--text-muted);">—</span>'}</td>
        <td style="color: var(--accent-cyan); font-family: monospace; font-size: 11px;">${escapeHtml(rawEmail || "—")}</td>
        <td style="color: var(--text-muted);">${escapeHtml(rawLoc || "USA")}</td>
      `;
      tbody.appendChild(tr);
      previewCount++;
    }
  }

  if (previewCount === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 18px;">
        No rows match the selected filters or mappings.
      </td>
    `;
    tbody.appendChild(tr);
  }

  // Update confirm button text
  const btnConfirmText = document.getElementById("btnConfirmCsvText");
  if (btnConfirmText) {
    if (totalEligibleCount > 0) {
      btnConfirmText.textContent = `Ingest ${totalEligibleCount.toLocaleString()} Leads into Pipeline`;
    } else {
      btnConfirmText.textContent = "Ingest Leads into Pipeline";
    }
  }
}

function executeCsvImport() {
  const firmIdx = document.getElementById("mapFirmName")?.value;
  const nameIdx = document.getElementById("mapFirstName")?.value;
  const titleIdx = document.getElementById("mapJobTitle")?.value;
  const emailIdx = document.getElementById("mapEmail")?.value;
  const locIdx = document.getElementById("mapLocation")?.value;
  const webIdx = document.getElementById("mapWebsite")?.value;

  if (firmIdx === "" || emailIdx === "") {
    showToast("Please map at least Company Name and Direct Email.");
    return;
  }

  const filterDecision = document.getElementById("chkFilterDecisionMakers")?.checked;
  const skipExisting = document.getElementById("chkSkipExistingEmails")?.checked;
  const existingEmails = new Set(leads.map(l => (l.email || "").trim().toLowerCase()).filter(Boolean));

  let importedCount = 0;
  let nextId = Date.now();
  const newLeads = [];

  for (let i = 0; i < parsedCsvRawRows.length; i++) {
    const row = parsedCsvRawRows[i];
    const rawEmail = (emailIdx !== "" && row[Number(emailIdx)]) ? row[Number(emailIdx)].trim() : "";
    if (!rawEmail || !rawEmail.includes("@")) continue;

    const cleanMail = rawEmail.toLowerCase();
    if (skipExisting && existingEmails.has(cleanMail)) continue;

    const rawTitle = (titleIdx !== "" && row[Number(titleIdx)]) ? row[Number(titleIdx)].trim() : "";
    if (filterDecision && !DECISION_MAKER_REGEX.test(rawTitle)) continue;

    const rawFirm = (firmIdx !== "" && row[Number(firmIdx)]) ? row[Number(firmIdx)].trim() : "Company";
    const rawName = (nameIdx !== "" && row[Number(nameIdx)]) ? row[Number(nameIdx)].trim() : "";
    const rawLoc = (locIdx !== "" && row[Number(locIdx)]) ? row[Number(locIdx)].trim() : "USA";
    let rawWeb = (webIdx !== "" && row[Number(webIdx)]) ? row[Number(webIdx)].trim() : "";

    if (rawWeb && !rawWeb.startsWith("http://") && !rawWeb.startsWith("https://") && rawWeb.includes(".")) {
      rawWeb = "https://" + rawWeb;
    }

    const firstName = cleanFirstName(rawName);

    // Dynamic hook generation based on lead data
    let personalHook = "";
    if (rawTitle && rawFirm) {
      personalHook = `noticed your leadership as ${rawTitle} at ${rawFirm}`;
    } else if (rawFirm) {
      personalHook = `came across ${rawFirm} and noticed your work in ${rawLoc}`;
    } else {
      personalHook = "noticed your impressive work and thought to reach out";
    }

    newLeads.push({
      id: nextId++,
      firmName: rawFirm,
      firstName: firstName,
      jobTitle: rawTitle,
      email: cleanMail,
      location: rawLoc,
      website: rawWeb,
      personalHook: personalHook,
      status: "pending"
    });

    existingEmails.add(cleanMail);
    importedCount++;
  }

  if (importedCount === 0) {
    showToast("No new leads were imported (all rows filtered or already exist).");
    return;
  }

  // Prepend new leads so latest imported leads appear at the top
  leads = [...newLeads, ...leads];
  saveData();
  currentVisiblePage = 1;
  renderApp();
  closeCsvImportModal();
  showToast(`Successfully ingested ${importedCount.toLocaleString()} leads into pipeline! 🚀`);
}

// ==========================================
// Auto-Pilot Bulk Campaign Runner
// ==========================================
function openAutoPilotModal() {
  // If no leads are manually selected, select all currently pending leads
  if (selectedLeadIds.size === 0) {
    const pendingLeads = leads.filter(l => l.status === "pending");
    if (pendingLeads.length === 0) {
      showToast("No pending leads found to target in your pipeline.");
      return;
    }
    pendingLeads.forEach(l => selectedLeadIds.add(l.id));
    updateBulkUI();
    renderLeadsList();
  }

  const isDirect = (settings.dispatchEngine === "cpanel" || settings.dispatchEngine === "googleScript") && settings.dispatchUrl;
  if (!isDirect) {
    showToast("Configure your cPanel Bridge or Google Script in Settings first ⚙️");
    openSettingsModal();
    return;
  }

  document.getElementById("modalAutoPilot").style.display = "flex";
  startAutoPilotExecution();
}

function closeAutoPilotModal() {
  if (autoPilotRunning) {
    if (!confirm("An Auto-Pilot outreach campaign is running. Are you sure you want to stop it?")) {
      return;
    }
    autoPilotRunning = false;
  }
  document.getElementById("modalAutoPilot").style.display = "none";
  selectedLeadIds.clear();
  updateBulkUI();
  renderApp();
}

function pauseAutoPilot() {
  autoPilotPaused = true;
  document.getElementById("btnPauseAutoPilot").style.display = "none";
  document.getElementById("btnResumeAutoPilot").style.display = "inline-flex";
  document.getElementById("autopilotProgressLabel").textContent = "Campaign Paused ⏸";
  showToast("Auto-Pilot campaign paused.");
}

function resumeAutoPilot() {
  autoPilotPaused = false;
  document.getElementById("btnResumeAutoPilot").style.display = "none";
  document.getElementById("btnPauseAutoPilot").style.display = "inline-flex";
  document.getElementById("autopilotProgressLabel").textContent = "Resuming campaign ▶";
  showToast("Resuming Auto-Pilot...");
}

async function generatePitchForLead(lead) {
  const apiKey = settings.geminiApiKey;
  if (!apiKey) {
    const tmpl = TEMPLATES.receipt;
    return { subject: tmpl.getSubject(lead), body: tmpl.getBody(lead) };
  }

  const prompt = `You are an elite B2B cold email copywriter. Write a highly personalized, compelling outreach email to ${lead.firstName} at ${lead.firmName} (${lead.location || "USA"}).
Prospect hook/specialty: "${lead.personalHook}".
Product: "${settings.businessName}" (${settings.productUrl}).
Value proposition: "${settings.valueProp}".
Offer: "${settings.offer}".
Guidelines:
- Keep body under 100 words.
- Specific, conversational, zero corporate fluff.
- Output MUST strictly follow this exact format:
SUBJECT: [compelling lowercase subject line]
BODY: [personalized email body text]`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
      thinkingConfig: { thinkingBudget: 0 }
    }
  };

  try {
    let res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok && res.status === 400) {
      delete payload.generationConfig.thinkingConfig;
      res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    }

    if (!res.ok) throw new Error("API error");

    const data = await res.json();
    const parts = data.candidates?.[0]?.content?.parts || [];
    let text = "";
    for (const p of parts) {
      if (p.text && !p.thought) text += p.text;
    }
    if (!text && parts[0]?.text) text = parts[0].text;

    const subjectMatch = text.match(/(?:\*{0,2})SUBJECT(?:\*{0,2}):\s*(.*?)(?:\n|$)/i);
    const bodyMatch = text.match(/(?:\*{0,2})BODY(?:\*{0,2}):?\s*([\s\S]*)/i);

    const subject = subjectMatch && subjectMatch[1]
      ? subjectMatch[1].trim().replace(/^\*+|\*+$/g, "")
      : (TEMPLATES.receipt.getSubject(lead));

    let cleanBody = "";
    if (bodyMatch && bodyMatch[1] && bodyMatch[1].trim()) {
      cleanBody = bodyMatch[1].trim();
    } else {
      cleanBody = text
        .replace(/(?:\*{0,2})SUBJECT(?:\*{0,2}):\s*.*?(?:\n+|$)/i, "")
        .replace(/^(?:\*{0,2})BODY(?:\*{0,2}):?\s*/i, "")
        .trim();
    }

    return { subject, body: cleanBody || TEMPLATES.receipt.getBody(lead) };
  } catch (err) {
    const tmpl = TEMPLATES.receipt;
    return { subject: tmpl.getSubject(lead), body: tmpl.getBody(lead) };
  }
}

async function startAutoPilotExecution() {
  const targetLeads = leads.filter(l => selectedLeadIds.has(l.id));
  const total = targetLeads.length;
  if (total === 0) {
    closeAutoPilotModal();
    return;
  }

  autoPilotRunning = true;
  autoPilotPaused = false;

  const queueList = document.getElementById("autopilotQueueList");
  const counter = document.getElementById("autopilotCounter");
  const progressBar = document.getElementById("autopilotProgressBar");
  const label = document.getElementById("autopilotProgressLabel");
  const firmNameEl = document.getElementById("autopilotCurrentFirm");
  const firmDetailEl = document.getElementById("autopilotCurrentDetail");
  const btnPause = document.getElementById("btnPauseAutoPilot");
  const btnResume = document.getElementById("btnResumeAutoPilot");
  const btnDone = document.getElementById("btnDoneAutoPilot");

  btnPause.style.display = "inline-flex";
  btnResume.style.display = "none";
  btnDone.style.display = "none";

  // Build Queue Items in DOM
  queueList.innerHTML = "";
  targetLeads.forEach((lead, idx) => {
    const item = document.createElement("div");
    item.className = "queue-item";
    item.id = `queueItem_${lead.id}`;
    item.innerHTML = `
      <div class="queue-firm-info">
        <div class="queue-firm-name">#${idx + 1} ${escapeHtml(lead.firmName)}</div>
        <div class="queue-firm-email">${escapeHtml(lead.firstName)} • ${escapeHtml(lead.email)}</div>
      </div>
      <div class="queue-status-pill queue-status-waiting" id="queuePill_${lead.id}">Queued</div>
    `;
    queueList.appendChild(item);
  });

  counter.textContent = `0 / ${total}`;
  progressBar.style.width = "0%";
  label.textContent = "Starting automated campaign...";

  let sentCount = 0;
  let failedCount = 0;

  for (let i = 0; i < targetLeads.length; i++) {
    if (!autoPilotRunning) break;

    // Handle pause
    while (autoPilotPaused && autoPilotRunning) {
      await new Promise(r => setTimeout(r, 500));
    }
    if (!autoPilotRunning) break;

    const lead = targetLeads[i];
    const itemEl = document.getElementById(`queueItem_${lead.id}`);
    const pillEl = document.getElementById(`queuePill_${lead.id}`);

    if (itemEl) {
      itemEl.className = "queue-item active";
      itemEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
    if (pillEl) {
      pillEl.className = "queue-status-pill queue-status-running";
      pillEl.textContent = "Crafting Pitch...";
    }

    firmNameEl.textContent = `${lead.firmName} (${lead.firstName})`;
    label.textContent = `Processing Prospect ${i + 1} of ${total}`;

    // Determine Cadence Strategy
    const stratRadio = document.querySelector('input[name="autoPilotStrategy"]:checked');
    const isSmartCadence = stratRadio ? stratRadio.value === "smart" : true;

    let emailSubject = "";
    let emailBody = "";
    let stepTitle = "Step 1 (Pitch)";
    let nextSchedDays = 3;

    if (isSmartCadence && lead.status === "contacted" && (lead.followUpCount || 0) >= 1) {
      const fuCount = lead.followUpCount || 1;
      if (fuCount === 1) {
        // Step 2: Bump (Day 3)
        const tmpl = TEMPLATES.followup1;
        emailSubject = tmpl.getSubject(lead);
        emailBody = tmpl.getBody(lead);
        stepTitle = "Step 2 (Bump)";
        nextSchedDays = 4;
      } else if (fuCount === 2) {
        // Step 3: Proof / Case Study (Day 7)
        const tmpl = TEMPLATES.followup2;
        emailSubject = tmpl.getSubject(lead);
        emailBody = tmpl.getBody(lead);
        stepTitle = "Step 3 (Proof)";
        nextSchedDays = 7;
      } else {
        // Step 4: Breakup / Closing (Day 14)
        const tmpl = TEMPLATES.followup3;
        emailSubject = tmpl.getSubject(lead);
        emailBody = tmpl.getBody(lead);
        stepTitle = "Step 4 (Breakup)";
        nextSchedDays = 0;
      }
      firmDetailEl.textContent = `Preparing ${stepTitle} follow-up email...`;
      if (pillEl) pillEl.textContent = `Drafting ${stepTitle}...`;
    } else {
      // Step 1: Initial Pitch
      stepTitle = "Step 1 (Pitch)";
      nextSchedDays = 3;
      firmDetailEl.textContent = "Personalizing pitch copy with Gemini AI...";
      if (pillEl) pillEl.textContent = "Crafting Pitch...";
      const pitch = await generatePitchForLead(lead);
      emailSubject = pitch.subject;
      emailBody = pitch.body;
    }

    // Step 2: Render Branded Visual Mockup
    firmDetailEl.textContent = "Generating custom branded mockup (.jpg)...";
    if (pillEl) pillEl.textContent = "Rendering Mockup...";

    const mockupBase64 = generateCanvasMockup(
      lead.firmName,
      lead.firstName,
      lead.location,
      "beforeAfter",
      settings.businessName,
      settings.valueProp
    );

    let finalBody = emailBody;
    if (stepTitle.includes("Step 1") && !finalBody.includes("P.S. I put together a quick visual preview")) {
      finalBody = finalBody.trim() + `\n\nP.S. I put together a quick visual preview of what ${lead.firmName}'s workflow looks like with ${settings.businessName}—see the attached image!`;
    }

    // Step 3: Dispatch email directly via bridge
    firmDetailEl.textContent = `Dispatching ${stepTitle} directly to ${lead.email}...`;
    if (pillEl) pillEl.textContent = "Sending Email...";

    const cleanFirm = (lead.firmName || "lead").toLowerCase().replace(/[^a-z0-9]/g, "_");
    const sendResult = await sendEmailDirectly({
      to: lead.email,
      subject: emailSubject,
      body: finalBody,
      attachmentBase64: mockupBase64,
      attachmentName: `${cleanFirm}_workflow_mockup.jpg`
    });

    if (sendResult.success) {
      sentCount++;
      lead.status = "contacted";
      lead.followUpCount = (lead.followUpCount || 0) + 1;
      lead.lastContactedAt = new Date().toISOString();
      lead.followUpDueAt = nextSchedDays > 0 ? new Date(Date.now() + nextSchedDays * 86400000).toISOString() : null;

      if (pillEl) {
        pillEl.className = "queue-status-pill queue-status-done";
        pillEl.textContent = `${stepTitle} ✓`;
      }
      if (itemEl) {
        itemEl.className = "queue-item done";
      }
    } else {
      failedCount++;
      if (pillEl) {
        pillEl.className = "queue-status-pill queue-status-error";
        pillEl.textContent = "Failed ⚠️";
      }
      if (itemEl) {
        itemEl.className = "queue-item error";
      }
    }

    const completed = i + 1;
    const pct = Math.round((completed / total) * 100);
    progressBar.style.width = `${pct}%`;
    counter.textContent = `${completed} / ${total}`;

    saveData();
    updateKpiAndCounts();

    // Safe 2.0s delay between emails to protect sender domain reputation and SMTP rate limits
    if (i < targetLeads.length - 1 && autoPilotRunning) {
      firmDetailEl.textContent = "Rate limit pause (2.0s inbox cooldown)...";
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  autoPilotRunning = false;
  btnPause.style.display = "none";
  btnResume.style.display = "none";
  btnDone.style.display = "block";

  label.textContent = `Campaign Finished: ${sentCount} Sent, ${failedCount} Failed`;
  firmNameEl.textContent = "Outreach Completed 🎉";
  firmDetailEl.textContent = "All processed leads marked as Contacted with +3d follow-up cadence set.";
  showToast(`Auto-Pilot Complete! Dispatched ${sentCount} emails 🎉`);
}

// ==========================================
// In-App How-To & Outreach Guide
// ==========================================
function openHowToModal(initialTab = "quickstart") {
  const modal = document.getElementById("modalHowTo");
  if (!modal) return;
  switchGuideTab(initialTab);
  modal.style.display = "flex";
}

function closeHowToModal() {
  const modal = document.getElementById("modalHowTo");
  if (modal) modal.style.display = "none";
}

function switchGuideTab(tabKey) {
  // Update nav pills
  document.querySelectorAll(".guide-nav-pill").forEach(pill => {
    pill.classList.toggle("active", pill.dataset.tab === tabKey);
  });

  // Switch panes
  document.querySelectorAll(".guide-pane").forEach(pane => {
    pane.classList.remove("active");
  });
  const targetPane = document.getElementById(`guidePane_${tabKey}`);
  if (targetPane) {
    targetPane.classList.add("active");
    const body = targetPane.closest(".guide-body");
    if (body) body.scrollTop = 0;
  }
}

// ==========================================
// Toast Notification
// ==========================================
let toastTimer = null;
function showToast(msg) {
  const toast = document.getElementById("toast");
  const toastMsg = document.getElementById("toastMsg");
  toastMsg.textContent = msg;
  toast.style.display = "block";
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.style.display = "none";
  }, 2200);
}

function escapeHtml(text) {
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ==========================================
// Event Listeners Setup
// ==========================================
function setupEventListeners() {
  // Filter chips
  document.querySelectorAll(".filter-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      document.querySelectorAll(".filter-chip").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      currentFilter = chip.dataset.filter;
      currentVisiblePage = 1;
      renderLeadsList();
    });
  });

  // KPI cards (tap to filter)
  document.querySelectorAll(".kpi-card").forEach(card => {
    card.addEventListener("click", () => {
      const filter = card.dataset.filter;
      const targetChip = document.querySelector(`.filter-chip[data-filter="${filter}"]`);
      if (targetChip) targetChip.click();
    });
  });

  // Search input
  const searchInput = document.getElementById("searchInput");
  const clearBtn = document.getElementById("btnClearSearch");

  searchInput.addEventListener("input", (e) => {
    currentSearch = e.target.value.trim();
    clearBtn.style.display = currentSearch ? "block" : "none";
    currentVisiblePage = 1;
    renderLeadsList();
  });

  clearBtn.addEventListener("click", () => {
    searchInput.value = "";
    currentSearch = "";
    clearBtn.style.display = "none";
    currentVisiblePage = 1;
    renderLeadsList();
  });

  // Drafter events
  document.getElementById("btnCloseDrafter").addEventListener("click", closeDrafter);
  document.getElementById("btnLaunchMail").addEventListener("click", launchMailApp);
  document.getElementById("btnCopyEmail").addEventListener("click", copyEmailToClipboard);
  document.getElementById("btnAiDraft").addEventListener("click", generateWithGemini);
  
  const btnDeleteFromDrafter = document.getElementById("btnDeleteFromDrafter");
  if (btnDeleteFromDrafter) {
    btnDeleteFromDrafter.addEventListener("click", () => {
      if (activeLead) {
        deleteLead(activeLead.id);
      }
    });
  }

  // Template pills
  document.querySelectorAll(".template-pill").forEach(pill => {
    pill.addEventListener("click", () => {
      document.querySelectorAll(".template-pill").forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      activeTemplate = pill.dataset.template;
      updateCadenceIndicator();
      updateDrafterContent();
    });
  });

  // Follow-Up Schedule Pills
  document.querySelectorAll(".sched-pill").forEach(pill => {
    pill.addEventListener("click", () => {
      document.querySelectorAll(".sched-pill").forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      selectedFollowUpScheduleDays = parseInt(pill.dataset.days, 10);
    });
  });

  // Drafter status buttons
  document.querySelectorAll(".status-pill-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      if (activeLead) {
        setLeadStatus(activeLead.id, btn.dataset.setStatus);
      }
    });
  });

  // Visual Mockup Generator
  const btnToggleMockup = document.getElementById("btnToggleMockup");
  if (btnToggleMockup) btnToggleMockup.addEventListener("click", toggleMockupArea);

  const btnGenerateMockup = document.getElementById("btnGenerateMockup");
  if (btnGenerateMockup) btnGenerateMockup.addEventListener("click", generateMockupWithImagen);

  const btnInsertMockupNote = document.getElementById("btnInsertMockupNote");
  if (btnInsertMockupNote) btnInsertMockupNote.addEventListener("click", insertMockupNoteIntoEmail);

  // Add / Edit Lead
  document.getElementById("btnAddLead").addEventListener("click", openAddLeadModal);
  document.getElementById("btnCloseLeadModal").addEventListener("click", closeLeadModal);
  document.getElementById("btnCancelLead").addEventListener("click", closeLeadModal);
  document.getElementById("leadForm").addEventListener("submit", handleSaveLead);

  const btnDeleteLeadModal = document.getElementById("btnDeleteLeadModal");
  if (btnDeleteLeadModal) {
    btnDeleteLeadModal.addEventListener("click", () => {
      const idVal = document.getElementById("editLeadId")?.value;
      if (idVal) {
        deleteLead(idVal);
      }
    });
  }

  // Scout Modal events
  const btnOpenScout = document.getElementById("btnOpenScout");
  if (btnOpenScout) btnOpenScout.addEventListener("click", openScoutModal);
  
  const btnOpenScoutFab = document.getElementById("btnOpenScoutFab");
  if (btnOpenScoutFab) btnOpenScoutFab.addEventListener("click", openScoutModal);

  document.getElementById("btnCloseScout").addEventListener("click", closeScoutModal);
  document.getElementById("btnRunScout").addEventListener("click", runScoutWithGemini);
  document.getElementById("btnAddScoutedLeads").addEventListener("click", importScoutedLeads);

  const btnScoutGoSettings = document.getElementById("btnScoutGoSettings");
  if (btnScoutGoSettings) {
    btnScoutGoSettings.addEventListener("click", () => {
      closeScoutModal();
      openSettingsModal();
    });
  }

  const btnScoutFixKey = document.getElementById("btnScoutFixKey");
  if (btnScoutFixKey) {
    btnScoutFixKey.addEventListener("click", () => {
      closeScoutModal();
      openSettingsModal();
    });
  }

  // Scout Niche custom toggle
  const scoutNicheSelect = document.getElementById("scoutNiche");
  const scoutNicheCustom = document.getElementById("scoutNicheCustom");
  if (scoutNicheSelect && scoutNicheCustom) {
    scoutNicheSelect.addEventListener("change", (e) => {
      scoutNicheCustom.style.display = e.target.value === "custom" ? "block" : "none";
    });
  }

  // Settings & Business Profiles
  document.getElementById("btnSettings").addEventListener("click", openSettingsModal);
  document.getElementById("btnCloseSettings").addEventListener("click", closeSettingsModal);
  
  const profileSelect = document.getElementById("settingsProfileSelect");
  if (profileSelect) {
    profileSelect.addEventListener("change", handleProfilePresetChange);
  }

  const btnSaveSettingsManual = document.getElementById("btnSaveSettingsManual");
  if (btnSaveSettingsManual) {
    btnSaveSettingsManual.addEventListener("click", () => {
      saveSettings();
      closeSettingsModal();
    });
  }

  document.getElementById("settingsBusinessName")?.addEventListener("change", saveSettings);
  document.getElementById("settingsSenderName")?.addEventListener("change", saveSettings);
  document.getElementById("settingsProductUrl")?.addEventListener("change", saveSettings);
  document.getElementById("settingsValueProp")?.addEventListener("change", saveSettings);
  document.getElementById("settingsOffer")?.addEventListener("change", saveSettings);
  document.getElementById("settingsGeminiKey")?.addEventListener("change", saveSettings);

  // Direct Dispatch Settings listeners
  const engineSelect = document.getElementById("settingsDispatchEngine");
  if (engineSelect) {
    engineSelect.addEventListener("change", () => {
      saveSettings();
      updateDispatchGuideUI();
    });
  }
  document.getElementById("settingsDispatchUrl")?.addEventListener("change", saveSettings);
  document.getElementById("settingsDispatchUrl")?.addEventListener("input", saveSettings);
  document.getElementById("settingsDispatchFromEmail")?.addEventListener("change", saveSettings);
  document.getElementById("settingsDispatchFromEmail")?.addEventListener("input", saveSettings);
  document.getElementById("settingsDispatchFromName")?.addEventListener("change", saveSettings);
  document.getElementById("settingsDispatchFromName")?.addEventListener("input", saveSettings);
  document.getElementById("settingsDispatchSecret")?.addEventListener("change", saveSettings);
  document.getElementById("settingsDispatchSecret")?.addEventListener("input", saveSettings);
  document.getElementById("btnCopyDispatchScript")?.addEventListener("click", copyDispatchScript);
  document.getElementById("btnTestDispatch")?.addEventListener("click", testDirectDispatch);

  // Bulk Selection & Auto-Pilot Runner
  document.getElementById("chkSelectAllLeads")?.addEventListener("change", toggleSelectAllPending);
  document.getElementById("btnTriggerAutoPilotTop")?.addEventListener("click", openAutoPilotModal);
  document.getElementById("btnRunBulkAutoPilot")?.addEventListener("click", openAutoPilotModal);
  document.getElementById("btnCloseAutoPilot")?.addEventListener("click", closeAutoPilotModal);
  document.getElementById("btnPauseAutoPilot")?.addEventListener("click", pauseAutoPilot);
  document.getElementById("btnResumeAutoPilot")?.addEventListener("click", resumeAutoPilot);
  document.getElementById("btnDoneAutoPilot")?.addEventListener("click", closeAutoPilotModal);

  // In-App How-To Guide Listeners
  document.getElementById("btnOpenHelp")?.addEventListener("click", () => openHowToModal("quickstart"));
  document.getElementById("btnCloseHowTo")?.addEventListener("click", closeHowToModal);
  document.getElementById("btnGuideCloseBottom")?.addEventListener("click", closeHowToModal);

  document.getElementById("btnOpenHelpFromSettings")?.addEventListener("click", (e) => {
    e.stopPropagation();
    closeSettingsModal();
    openHowToModal("cpanel");
  });
  document.getElementById("bannerOpenHelpFromSettings")?.addEventListener("click", () => {
    closeSettingsModal();
    openHowToModal("quickstart");
  });
  document.getElementById("btnOpenHelpFromDispatch")?.addEventListener("click", (e) => {
    e.stopPropagation();
    closeSettingsModal();
    const currentEngine = document.getElementById("settingsDispatchEngine")?.value || "cpanel";
    openHowToModal(currentEngine === "googleScript" ? "gmail" : "cpanel");
  });

  document.getElementById("btnGuideGoSettings")?.addEventListener("click", () => {
    closeHowToModal();
    openSettingsModal();
  });

  document.getElementById("btnGuideCopyPhp")?.addEventListener("click", () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(CPANEL_PHP_CODE).then(() => {
        showToast("cPanel PHP bridge code copied! 📋");
      }).catch(() => {
        fallbackCopy(CPANEL_PHP_CODE);
        showToast("cPanel PHP bridge code copied! 📋");
      });
    } else {
      fallbackCopy(CPANEL_PHP_CODE);
      showToast("cPanel PHP bridge code copied! 📋");
    }
  });

  document.getElementById("btnGuideCopyGoogleScript")?.addEventListener("click", () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE).then(() => {
        showToast("Google Apps Script code copied! 📋");
      }).catch(() => {
        fallbackCopy(GOOGLE_APPS_SCRIPT_CODE);
        showToast("Google Apps Script code copied! 📋");
      });
    } else {
      fallbackCopy(GOOGLE_APPS_SCRIPT_CODE);
      showToast("Google Apps Script code copied! 📋");
    }
  });

  // Guide nav pills click
  document.querySelectorAll(".guide-nav-pill").forEach(pill => {
    pill.addEventListener("click", () => {
      switchGuideTab(pill.dataset.tab);
    });
  });

  // In-guide switch links (e.g. data-switch-tab="cpanel")
  document.querySelectorAll("[data-switch-tab]").forEach(el => {
    el.addEventListener("click", () => {
      switchGuideTab(el.dataset.switchTab);
    });
  });

  document.getElementById("btnExportData").addEventListener("click", exportData);
  document.getElementById("btnExportPipelineCsv")?.addEventListener("click", exportPipelineCsv);
  document.getElementById("btnExportPipelineFromSettings")?.addEventListener("click", () => {
    closeSettingsModal();
    exportPipelineCsv();
  });
  document.getElementById("inputImportFile").addEventListener("change", importData);
  document.getElementById("btnClearAllLeads")?.addEventListener("click", clearAllLeads);
  document.getElementById("btnResetDefaults").addEventListener("click", resetToDefaults);

  // Progressive Pagination
  const btnLoadMoreLeads = document.getElementById("btnLoadMoreLeads");
  if (btnLoadMoreLeads) {
    btnLoadMoreLeads.addEventListener("click", () => {
      currentVisiblePage++;
      renderLeadsList();
    });
  }

  // Live In-Browser Web Scraper Listeners (Modal 8)
  const btnOpenScraper = document.getElementById("btnOpenScraper");
  if (btnOpenScraper) btnOpenScraper.addEventListener("click", openScraperModal);

  const btnOpenScraperFromSettings = document.getElementById("btnOpenScraperFromSettings");
  if (btnOpenScraperFromSettings) {
    btnOpenScraperFromSettings.addEventListener("click", () => {
      closeSettingsModal();
      openScraperModal();
    });
  }

  const btnSwitchToScraper = document.getElementById("btnSwitchToScraper");
  if (btnSwitchToScraper) {
    btnSwitchToScraper.addEventListener("click", () => {
      closeScoutModal();
      openScraperModal();
    });
  }

  const btnCloseScraper = document.getElementById("btnCloseScraper");
  if (btnCloseScraper) btnCloseScraper.addEventListener("click", closeScraperModal);

  const btnStartScraping = document.getElementById("btnStartScraping");
  if (btnStartScraping) btnStartScraping.addEventListener("click", startInBrowserScraping);

  const scraperNiche = document.getElementById("scraperNiche");
  const scraperNicheCustom = document.getElementById("scraperNicheCustom");
  if (scraperNiche && scraperNicheCustom) {
    scraperNiche.addEventListener("change", (e) => {
      scraperNicheCustom.style.display = e.target.value === "custom" ? "block" : "none";
    });
  }

  const chkScraperSelectAll = document.getElementById("chkScraperSelectAll");
  if (chkScraperSelectAll) {
    chkScraperSelectAll.addEventListener("change", (e) => {
      document.querySelectorAll(".scraped-lead-chk").forEach(chk => chk.checked = e.target.checked);
      updateIngestScrapedButtonText();
    });
  }

  const btnIngestScrapedLeads = document.getElementById("btnIngestScrapedLeads");
  if (btnIngestScrapedLeads) btnIngestScrapedLeads.addEventListener("click", ingestSelectedScrapedLeads);

  const btnDownloadScrapedCsv = document.getElementById("btnDownloadScrapedCsv");
  if (btnDownloadScrapedCsv) btnDownloadScrapedCsv.addEventListener("click", downloadScrapedLeadsCsv);

  // Universal B2B CSV Importer Listeners
  const btnOpenCsvImport = document.getElementById("btnOpenCsvImport");
  if (btnOpenCsvImport) btnOpenCsvImport.addEventListener("click", openCsvImportModal);

  const btnOpenCsvFromSettings = document.getElementById("btnOpenCsvFromSettings");
  if (btnOpenCsvFromSettings) {
    btnOpenCsvFromSettings.addEventListener("click", () => {
      closeSettingsModal();
      openCsvImportModal();
    });
  }

  const btnCloseCsvImport = document.getElementById("btnCloseCsvImport");
  if (btnCloseCsvImport) btnCloseCsvImport.addEventListener("click", closeCsvImportModal);

  const btnCancelCsvImport = document.getElementById("btnCancelCsvImport");
  if (btnCancelCsvImport) btnCancelCsvImport.addEventListener("click", closeCsvImportModal);

  const btnBrowseCsv = document.getElementById("btnBrowseCsv");
  const inputCsvFile = document.getElementById("inputCsvFile");
  if (btnBrowseCsv && inputCsvFile) {
    btnBrowseCsv.addEventListener("click", (e) => {
      e.stopPropagation();
      inputCsvFile.click();
    });
  }

  if (inputCsvFile) {
    inputCsvFile.addEventListener("change", (e) => {
      if (e.target.files && e.target.files[0]) {
        handleCsvFileSelected(e.target.files[0]);
      }
    });
  }

  const btnChangeCsvFile = document.getElementById("btnChangeCsvFile");
  if (btnChangeCsvFile && inputCsvFile) {
    btnChangeCsvFile.addEventListener("click", () => inputCsvFile.click());
  }

  // Dropzone drag & drop events
  const csvUploadArea = document.getElementById("csvUploadArea");
  if (csvUploadArea) {
    csvUploadArea.addEventListener("click", (e) => {
      if (e.target !== btnBrowseCsv) {
        inputCsvFile?.click();
      }
    });

    csvUploadArea.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.stopPropagation();
      csvUploadArea.classList.add("dragover");
    });

    csvUploadArea.addEventListener("dragleave", (e) => {
      e.preventDefault();
      e.stopPropagation();
      csvUploadArea.classList.remove("dragover");
    });

    csvUploadArea.addEventListener("drop", (e) => {
      e.preventDefault();
      e.stopPropagation();
      csvUploadArea.classList.remove("dragover");
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleCsvFileSelected(e.dataTransfer.files[0]);
      }
    });
  }

  // Mapping select changes & filter toggles trigger real-time preview re-render
  ["mapFirmName", "mapFirstName", "mapJobTitle", "mapEmail", "mapLocation", "mapWebsite"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("change", renderCsvPreview);
  });

  const chkFilterDecisionMakers = document.getElementById("chkFilterDecisionMakers");
  if (chkFilterDecisionMakers) chkFilterDecisionMakers.addEventListener("change", renderCsvPreview);

  const chkSkipExistingEmails = document.getElementById("chkSkipExistingEmails");
  if (chkSkipExistingEmails) chkSkipExistingEmails.addEventListener("change", renderCsvPreview);

  const btnConfirmCsvImport = document.getElementById("btnConfirmCsvImport");
  if (btnConfirmCsvImport) btnConfirmCsvImport.addEventListener("click", executeCsvImport);

  // Close modals on overlay backdrop tap
  document.querySelectorAll(".modal-overlay").forEach(overlay => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        overlay.style.display = "none";
      }
    });
  });

  // Copilot Event Listeners
  document.getElementById("btnOpenCopilotHeader")?.addEventListener("click", openCopilotDrawer);
  document.getElementById("btnOpenCopilotFab")?.addEventListener("click", openCopilotDrawer);
  document.getElementById("btnCloseCopilot")?.addEventListener("click", closeCopilotDrawer);
  document.getElementById("btnClearCopilotChat")?.addEventListener("click", clearCopilotChat);

  const btnCopilotSend = document.getElementById("btnCopilotSend");
  if (btnCopilotSend) {
    btnCopilotSend.addEventListener("click", handleCopilotSend);
  }

  const copilotInput = document.getElementById("copilotInput");
  if (copilotInput) {
    copilotInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleCopilotSend();
      }
    });
  }

  // Quick Action Chips in Copilot
  document.querySelectorAll(".copilot-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      const prompt = chip.dataset.prompt;
      if (prompt) {
        const inputEl = document.getElementById("copilotInput");
        if (inputEl) inputEl.value = prompt;
        handleCopilotSend();
      }
    });
  });
}

// ==========================================
// Buzz Copilot AI Assistant Engine (Modal 9)
// ==========================================
let copilotHistory = [];
let copilotIsBusy = false;

const COPILOT_SYSTEM_PROMPT = `You are Buzz Copilot, the elite built-in AI assistant and outreach partner for Buzz Outreach PWA.
Your mission is twofold:
1. Answer ANY user questions about Buzz (features, architecture, email setup, cPanel, Gmail webhook, AI Scout, scraper, Auto-Pilot, Smart Cadence, visual mockups, CRM deal tracking, CSV import/export).
2. Act as an autonomous operator: help the user set up their business profile, configure their email bridge, find targeted leads, update CRM records, and launch cold outreach campaigns using your available tools.

BUZZ SYSTEM KNOWLEDGE:
- What Buzz is: A high-performance, mobile-first Progressive Web App (PWA) designed for automated B2B cold email outreach and pipeline management. Stored locally in IndexedDB (holds 50,000+ leads with 60fps virtualization).
- Business Identity & Profiles: Users can configure their Business Name, Sender Name & Title, Product URL, Value Proposition, and Core Offer. Presets include SmartRename AI, Web Design Agency, SEO Agency, Consulting, or Custom.
- Email Dispatch Methods:
  1. Method 1: cPanel PHP Bridge (buzz-send.php uploaded to public_html). Sends directly from custom domain (you@yourdomain.com), auto-attaches 1280x720 branded visual mockups, zero third-party subscription fees.
  2. Method 2: Google Apps Script Webhook. 100% free serverless webhook deployed to script.google.com that sends via Gmail/Workspace alias.
  3. Method 3: Default Mail App (mailto:).
- Lead Acquisition:
  1. Live In-Browser Web Scraper: Zero API keys required. Uses OpenStreetMap & Nominatim APIs to extract active local businesses with websites, phones, and decision-maker roles in seconds.
  2. AI Lead Scout: Uses Google Gemini with live Google Search Grounding to find authentic local businesses in any Country, State, and City/LGA.
  3. Universal CSV/Excel Importer: Seamlessly imports Apollo.io, LinkedIn Sales Navigator, ZoomInfo, or custom spreadsheets with smart column mapping, duplicate detection, and executive filtering.
- Outreach Formulas & Cadence:
  - 5-step cold email cadence formulas: 1. Initial Pitch (Receipt/CPA hook), 2. Day 3 Bump, 3. Day 7 Proof / Case Study, 4. Day 14 Breakup / Close loop.
  - Smart Cadence in Auto-Pilot: Automatically detects each lead's send history (0 sends -> Pitch, 1 send -> Bump, 2 sends -> Proof, 3+ sends -> Breakup) and schedules the next cadence date.
- Visual Pitch Mockups: Google Imagen 3 generated visuals: Before & After Split Screen, 30-Sec Video Demo Player card, or Client SaaS Portal Dashboard.
- Lightweight CRM: Statuses (Pending, Contacted, Sample Sent, Won), Deal Value ($) tracking with dynamic revenue KPI calculations, Notes & Activity Log.
- Data Portability: 1-click RFC 4180-compliant CSV export with UTF-8 BOM for Microsoft Excel & Google Sheets.

GUIDELINES FOR RESPONDING:
- Be helpful, conversational, punchy, and confident. Use clean markdown (bolding, bullet points, code snippets).
- When asked to perform an action (e.g. scrape leads, update settings, run outreach, check stats, export CSV), ALWAYS use the appropriate tool function.
- If the user asks for setup help, guide them step-by-step or ask for their business details to set them up automatically.
- If the user has questions about cPanel or Gmail setup, provide exact step-by-step guidance.`;

const COPILOT_TOOLS_DECLARATIONS = [
  {
    name: "get_pipeline_stats",
    description: "Get real-time statistics of the user's active outreach pipeline (total leads, contacted, won deals, won revenue $, and follow-ups due).",
    parameters: { type: "OBJECT", properties: {} }
  },
  {
    name: "set_business_profile",
    description: "Configure or update the user's active business/campaign profile in Settings (business name, sender name, product URL, value proposition, and core offer).",
    parameters: {
      type: "OBJECT",
      properties: {
        businessName: { type: "STRING", description: "Name of the business or software" },
        senderName: { type: "STRING", description: "Name and title of the sender" },
        productUrl: { type: "STRING", description: "Website URL" },
        valueProp: { type: "STRING", description: "Value proposition / what problem is solved" },
        offer: { type: "STRING", description: "Core offer or call-to-action" }
      }
    }
  },
  {
    name: "set_email_bridge",
    description: "Configure the email dispatch bridge settings (cPanel PHP bridge or Google Apps Script webhook).",
    parameters: {
      type: "OBJECT",
      properties: {
        dispatchEngine: { type: "STRING", enum: ["cpanel", "googleScript", "mailto"], description: "Gateway method" },
        dispatchUrl: { type: "STRING", description: "URL of buzz-send.php or Google Apps Script" },
        dispatchFromEmail: { type: "STRING", description: "Sender email address" },
        dispatchFromName: { type: "STRING", description: "Sender name" }
      }
    }
  },
  {
    name: "test_dispatch_connection",
    description: "Test the email bridge connection by sending a verified test email with a mockup attachment to the sender's email.",
    parameters: { type: "OBJECT", properties: {} }
  },
  {
    name: "scrape_leads",
    description: "Scrape verified local businesses, websites, and decision-maker contacts in a target niche and city/metro directly into the pipeline.",
    parameters: {
      type: "OBJECT",
      properties: {
        niche: { type: "STRING", description: "Target industry or niche (e.g. Dental Clinics, Bookkeeping, Law Firms, HVAC)" },
        location: { type: "STRING", description: "Target city and state/country (e.g. Austin, TX; Miami, FL; London, UK)" },
        limit: { type: "INTEGER", description: "Number of leads to scrape (default 20, max 50)" },
        prioritizeDecisionMakers: { type: "BOOLEAN", description: "Whether to prioritize Founders, Owners, CEOs" }
      },
      required: ["niche", "location"]
    }
  },
  {
    name: "run_autopilot",
    description: "Launch an automated Auto-Pilot cold email outreach campaign across pending or due leads.",
    parameters: {
      type: "OBJECT",
      properties: {
        strategy: { type: "STRING", enum: ["smart", "fixed"], description: "Strategy: 'smart' for auto-detecting sequence step, 'fixed' for initial pitch" },
        filter: { type: "STRING", enum: ["pending", "followups", "all"], description: "Which leads to target" }
      }
    }
  },
  {
    name: "update_lead",
    description: "Update a lead in the pipeline (set status to pending/contacted/sample/won, add deal value $, or add notes).",
    parameters: {
      type: "OBJECT",
      properties: {
        leadIdOrName: { type: "STRING", description: "Lead ID or company/contact name to match" },
        status: { type: "STRING", enum: ["pending", "contacted", "sample", "won"], description: "New pipeline status" },
        dealValue: { type: "NUMBER", description: "Closed deal value in dollars" },
        notes: { type: "STRING", description: "Notes or activity log" }
      },
      required: ["leadIdOrName"]
    }
  },
  {
    name: "export_pipeline_csv",
    description: "Export the active pipeline or specific leads to an Excel/Google Sheets compatible CSV.",
    parameters: {
      type: "OBJECT",
      properties: {
        scope: { type: "STRING", enum: ["all", "won", "contacted", "followups", "selected"], description: "Export scope" }
      }
    }
  }
];

function openCopilotModal() {
  const modal = document.getElementById("modalCopilot") || document.getElementById("drawerCopilot");
  if (!modal) return;
  modal.style.display = "flex";

  if (copilotHistory.length === 0) {
    appendCopilotMessage("bot", `👋 **Hey there! I'm Buzz Copilot**, your AI outreach partner.

I can help you:
- **Set up everything:** Configure your Business Profile, cPanel bridge, or Gemini key.
- **Find Leads:** Scrape local businesses with verified decision-makers.
- **Run Outreach:** Dispatch high-converting cold email sequences with branded mockups.
- **Answer Any Question:** Ask me anything about how Buzz works!

How can I help you today? You can tap a quick action above or type below.`);
  }

  const inputEl = document.getElementById("copilotInput");
  if (inputEl) inputEl.focus();
}

const openCopilotDrawer = openCopilotModal;

function closeCopilotModal() {
  const modal = document.getElementById("modalCopilot") || document.getElementById("drawerCopilot");
  if (modal) modal.style.display = "none";
}

const closeCopilotDrawer = closeCopilotModal;

function clearCopilotChat() {
  copilotHistory = [];
  const container = document.getElementById("copilotMessages");
  if (container) container.innerHTML = "";
  openCopilotModal();
  showToast("Copilot chat cleared 🤖");
}

// Expose globally on window for inline onclick reliability
window.openCopilotModal = openCopilotModal;
window.openCopilotDrawer = openCopilotDrawer;
window.closeCopilotModal = closeCopilotModal;
window.closeCopilotDrawer = closeCopilotDrawer;
window.clearCopilotChat = clearCopilotChat;
window.handleCopilotSend = handleCopilotSend;

function setCopilotTyping(isTyping, statusText = "Copilot is thinking...") {
  const indicator = document.getElementById("copilotTypingIndicator");
  const textEl = document.getElementById("copilotStatusText");
  if (!indicator) return;
  indicator.style.display = isTyping ? "flex" : "none";
  if (textEl && statusText) textEl.textContent = statusText;

  const container = document.getElementById("copilotMessages");
  if (container && isTyping) {
    container.scrollTop = container.scrollHeight;
  }
}

function appendCopilotMessage(role, text, toolBadge = null) {
  copilotHistory.push({ role, text, toolBadge, timestamp: Date.now() });
  const container = document.getElementById("copilotMessages");
  if (!container) return;

  const msgDiv = document.createElement("div");
  msgDiv.className = `copilot-msg ${role === "user" ? "copilot-msg-user" : "copilot-msg-bot"}`;

  let html = "";
  if (toolBadge) {
    html += `<div class="copilot-tool-badge">⚡ ${escapeHtml(toolBadge)}</div>`;
  }
  html += formatCopilotMarkdown(text);
  msgDiv.innerHTML = html;

  container.appendChild(msgDiv);
  container.scrollTop = container.scrollHeight;
}

function formatCopilotMarkdown(rawText) {
  if (!rawText) return "";
  let formatted = escapeHtml(rawText);

  // Bold
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  // Italic
  formatted = formatted.replace(/\*(.*?)\*/g, "<em>$1</em>");
  // Inline code
  formatted = formatted.replace(/`([^`]+)`/g, "<code>$1</code>");
  // Unordered list items
  formatted = formatted.replace(/(?:^|\n)[-*]\s+(.+)/g, "<br/>• $1");
  // Ordered list items
  formatted = formatted.replace(/(?:^|\n)(\d+)\.\s+(.+)/g, "<br/>$1. $2");
  // Paragraph line breaks
  formatted = formatted.replace(/\n\n+/g, "<br/><br/>");
  formatted = formatted.replace(/\n/g, "<br/>");

  return formatted;
}

async function handleCopilotSend() {
  if (copilotIsBusy) return;
  const inputEl = document.getElementById("copilotInput");
  if (!inputEl) return;
  const query = inputEl.value.trim();
  if (!query) return;

  inputEl.value = "";
  appendCopilotMessage("user", query);

  const apiKey = settings.geminiApiKey?.trim();
  if (!apiKey) {
    // Graceful offline fallback
    setCopilotTyping(true, "Searching Buzz knowledge base...");
    await new Promise(r => setTimeout(r, 450));
    setCopilotTyping(false);
    const offlineReply = getCopilotOfflineAnswer(query);
    appendCopilotMessage("bot", offlineReply);
    return;
  }

  copilotIsBusy = true;
  setCopilotTyping(true, "Copilot is analyzing...");

  try {
    // Build multi-turn contents for Gemini
    const contents = [];

    // Include recent history (last 8 turns)
    const recentHistory = copilotHistory.slice(-8);
    for (const h of recentHistory) {
      if (h.role === "user") {
        contents.push({ role: "user", parts: [{ text: h.text }] });
      } else if (h.role === "bot") {
        contents.push({ role: "model", parts: [{ text: h.text }] });
      }
    }

    const payload = {
      systemInstruction: { parts: [{ text: COPILOT_SYSTEM_PROMPT }] },
      contents: contents,
      tools: [{ functionDeclarations: COPILOT_TOOLS_DECLARATIONS }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
        thinkingConfig: { thinkingBudget: 0 }
      }
    };

    let response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok && response.status === 400) {
      delete payload.generationConfig.thinkingConfig;
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    }

    if (!response.ok) {
      throw new Error(`Gemini API error (HTTP ${response.status})`);
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    const candidateParts = candidate?.content?.parts || [];

    // Check for Function Call
    const functionCallPart = candidateParts.find(p => p.functionCall);
    if (functionCallPart) {
      const call = functionCallPart.functionCall;
      setCopilotTyping(true, `Executing tool: ${call.name}...`);

      const toolResult = await executeCopilotTool(call.name, call.args || {});

      // Send function response back to Gemini for conversational final response
      contents.push({ role: "model", parts: [{ functionCall: call }] });
      contents.push({
        role: "user",
        parts: [{
          functionResponse: {
            name: call.name,
            response: toolResult
          }
        }]
      });

      const secondResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (secondResp.ok) {
        const secondData = await secondResp.json();
        const secondParts = secondData.candidates?.[0]?.content?.parts || [];
        const botText = secondParts.map(p => p.text || "").join("").trim() || "Action executed successfully!";
        setCopilotTyping(false);
        appendCopilotMessage("bot", botText, `Executed: ${call.name}`);
      } else {
        setCopilotTyping(false);
        appendCopilotMessage("bot", `✓ Action completed: **${call.name}**\n\nResult:\n\`\`\`json\n${JSON.stringify(toolResult, null, 2)}\n\`\`\``, `Executed: ${call.name}`);
      }
    } else {
      // Normal conversational text reply
      const botText = candidateParts.map(p => p.text || "").join("").trim() || "I'm here to help!";
      setCopilotTyping(false);
      appendCopilotMessage("bot", botText);
    }
  } catch (err) {
    console.error("Copilot error:", err);
    setCopilotTyping(false);
    appendCopilotMessage("bot", `⚠️ **Copilot encountered an error**: ${err.message}\n\nPlease verify your Gemini API key in Settings (⚙️) or try again.`);
  } finally {
    copilotIsBusy = false;
  }
}

// Autonomous Tool Execution Engine
async function executeCopilotTool(name, args) {
  try {
    switch (name) {
      case "get_pipeline_stats": {
        const wonLeads = leads.filter(l => l.status === "won");
        const wonRev = wonLeads.reduce((s, l) => s + (Number(l.dealValue) || 0), 0);
        const fuDue = leads.filter(l => l.status === "contacted" && isFollowUpDue(l)).length;
        return {
          totalLeads: leads.length,
          contacted: leads.filter(l => l.status === "contacted").length,
          sampleSent: leads.filter(l => l.status === "sample").length,
          wonCount: wonLeads.length,
          totalRevenueWon: wonRev,
          pending: leads.filter(l => l.status === "pending").length,
          followupsDueToday: fuDue
        };
      }

      case "set_business_profile": {
        if (args.businessName) settings.businessName = args.businessName;
        if (args.senderName) settings.senderName = args.senderName;
        if (args.productUrl) settings.productUrl = args.productUrl;
        if (args.valueProp) settings.valueProp = args.valueProp;
        if (args.offer) settings.offer = args.offer;
        saveSettings();
        return { success: true, updated: args };
      }

      case "set_email_bridge": {
        if (args.dispatchEngine) settings.dispatchEngine = args.dispatchEngine;
        if (args.dispatchUrl) settings.dispatchUrl = args.dispatchUrl;
        if (args.dispatchFromEmail) settings.dispatchFromEmail = args.dispatchFromEmail;
        if (args.dispatchFromName) settings.dispatchFromName = args.dispatchFromName;
        saveSettings();
        return { success: true, engine: settings.dispatchEngine, url: settings.dispatchUrl };
      }

      case "test_dispatch_connection": {
        setTimeout(() => testDirectDispatch(), 200);
        return { success: true, message: "Direct dispatch test triggered! Check your inbox." };
      }

      case "scrape_leads": {
        const niche = args.niche || "Bookkeeping & Accounting";
        const location = args.location || "Austin, TX";
        const limit = args.limit || 20;

        // Set inputs in scraper modal
        const locInput = document.getElementById("scraperLocation");
        if (locInput) locInput.value = location;
        const limSelect = document.getElementById("scraperLimit");
        if (limSelect) limSelect.value = String(limit);

        // Run scraper engine directly
        await startInBrowserScraping();
        // Ingest results directly into pipeline
        ingestSelectedScrapedLeads();
        closeScraperModal();

        return { success: true, scrapedCount: scrapedLeadsCache.length, niche, location };
      }

      case "run_autopilot": {
        if (args.strategy) {
          const stratEl = document.querySelector(`input[name="autoPilotStrategy"][value="${args.strategy}"]`);
          if (stratEl) stratEl.checked = true;
        }
        setTimeout(() => openAutoPilotModal(), 300);
        return { success: true, strategy: args.strategy || "smart", message: "Auto-Pilot campaign launched" };
      }

      case "update_lead": {
        const targetStr = (args.leadIdOrName || "").toLowerCase();
        const lead = leads.find(l => 
          String(l.id) === targetStr || 
          (l.firmName && l.firmName.toLowerCase().includes(targetStr)) ||
          (l.firstName && l.firstName.toLowerCase().includes(targetStr))
        );

        if (!lead) {
          return { success: false, message: `Could not locate prospect matching "${args.leadIdOrName}"` };
        }

        if (args.status) lead.status = args.status;
        if (args.dealValue !== undefined) lead.dealValue = Number(args.dealValue) || 0;
        if (args.notes) lead.notes = args.notes;

        saveData();
        renderApp();
        return { success: true, lead: { firmName: lead.firmName, status: lead.status, dealValue: lead.dealValue, notes: lead.notes } };
      }

      case "export_pipeline_csv": {
        if (args.scope && args.scope !== "all") {
          currentFilter = args.scope;
        }
        setTimeout(() => exportPipelineCsv(), 200);
        return { success: true, scope: args.scope || "all", message: "CSV export initiated" };
      }

      default:
        return { error: `Unknown tool: ${name}` };
    }
  } catch (err) {
    return { error: err.message };
  }
}

// Built-in Offline FAQ Engine (Works without API key)
function getCopilotOfflineAnswer(query) {
  const q = query.toLowerCase();

  if (q.includes("cpanel") || q.includes("bridge") || q.includes("buzz-send")) {
    return `### ✉️ Setting Up the cPanel Email Bridge

Buzz allows you to send cold emails directly from your domain email (e.g. \`you@yourdomain.com\`) with auto-attached 1280x720 mockups.

**3-Step Setup:**
1. **Download \`buzz-send.php\`:** Click the download button in **Settings (⚙️)** or grab it from the repository.
2. **Upload to cPanel:** Open your cPanel **File Manager**, navigate into **\`public_html\`**, and upload \`buzz-send.php\`.
3. **Save in Buzz:** In Buzz **Settings (⚙️)**:
   - Gateway Method: \`Method 1: cPanel PHP Bridge\`
   - Bridge URL: \`https://yourdomain.com/buzz-send.php\`
   - From Email: \`you@yourdomain.com\`
   - Click **"🧪 Test Direct Dispatch"**!`;
  }

  if (q.includes("gmail") || q.includes("google script") || q.includes("apps script")) {
    return `### 📬 Setting Up Google Apps Script (Gmail Webhook)

Send emails directly through your free Gmail or Google Workspace account without a cPanel server.

**4-Step Setup:**
1. Open [script.google.com](https://script.google.com) and click **+ New Project**.
2. Copy the Google Script code from Buzz **Settings (⚙️)** and paste it into the editor.
3. Click **Deploy ➔ New deployment ➔ Web app**. Set *Execute as: Me* and *Who has access: Anyone*.
4. Copy the generated Web App URL and paste it into Buzz **Settings (⚙️)** under Gateway Method 2!`;
  }

  if (q.includes("smart cadence") || q.includes("cadence") || q.includes("followup") || q.includes("follow-up")) {
    return `### ⚡ What is Smart Cadence?

80% of sales happen on the follow-up. Buzz's **Smart Cadence engine** automatically tracks every lead's contact history:
- **0 Sends (Pending):** Sends **Step 1: Initial Hook / Pitch** (schedules +3 days).
- **1 Send (Contacted):** Automatically sends **Step 2: Day 3 Bump** (schedules +4 days).
- **2 Sends:** Automatically sends **Step 3: Day 7 Case Study Proof** (schedules +7 days).
- **3 Sends:** Sends **Step 4: Day 14 Breakup / Close loop**.

When you run **⚡ Auto-Pilot**, it detects which step each lead is on and sends the exact right message!`;
  }

  if (q.includes("scrape") || q.includes("finder") || q.includes("leads") || q.includes("nominatim")) {
    return `### 🕷️ In-Browser Lead Scraper vs 🔍 AI Scout

Buzz gives you two powerful ways to discover leads:
1. **🕷️ Live Web Scraper (Zero API Key):** Uses OpenStreetMap & Nominatim to extract local businesses, websites, phone numbers, and decision-maker roles in your target city in seconds.
2. **🔍 AI Scout (Gemini Search Grounding):** Uses Google Gemini to search Google live for verified business owners across any Country, State, and LGA/City.

You can also import thousands of leads from Apollo.io or LinkedIn using **📥 Import CSV**!`;
  }

  if (q.includes("mockup") || q.includes("imagen") || q.includes("visual")) {
    return `### 🎨 Visual Pitch Mockups

Buzz generates custom branded before/after split screens, 30-sec video demo preview cards, and client SaaS portal dashboards using Google Imagen 3.

In **Draft & Send**, you can preview and download the mockup. In **⚡ Auto-Pilot**, mockups are automatically rendered and attached to every email!`;
  }

  if (q.includes("setup") || q.includes("start") || q.includes("how to")) {
    return `### 🚀 Quick Start Guide for Buzz

1. **Add Google Gemini API Key:** Open **Settings (⚙️)** and paste your free key from [Google AI Studio](https://aistudio.google.com/app/apikey).
2. **Configure Email Dispatch:** Upload \`buzz-send.php\` to your cPanel or deploy the Google Apps Script webhook.
3. **Get Leads:** Click **🕷️ Scrape Leads** or **📥 Import CSV**.
4. **Launch Outreach:** Select your leads and click **⚡ Run Auto-Pilot Campaign**!

To enable autonomous actions in this chat, please add your Gemini API Key in **Settings (⚙️)**.`;
  }

  return `I am **Buzz Copilot**! To enable full autonomous tool execution (scraping leads, running Auto-Pilot, updating settings directly from chat), please add your free **Google Gemini API Key** in **Settings (⚙️)**.

In the meantime, feel free to ask me any questions about:
- **cPanel PHP Bridge setup**
- **Gmail Webhook deployment**
- **Smart Cadence follow-up rules**
- **In-browser lead scraping**
- **Universal CSV importing & exporting**`;
}

// Start
document.addEventListener("DOMContentLoaded", init);
