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
  geminiApiKey: ""
};

let selectedFollowUpScheduleDays = 3;

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
function init() {
  loadData();
  setupEventListeners();
  renderApp();
}

function loadData() {
  const savedLeads = localStorage.getItem(STORAGE_KEY_LEADS);
  if (savedLeads) {
    try {
      leads = JSON.parse(savedLeads);
    } catch (e) {
      leads = [...DEFAULT_LEADS];
    }
  } else {
    leads = [...DEFAULT_LEADS];
    saveData();
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

  updateHeaderBranding();
}

function updateHeaderBranding() {
  const tagEl = document.getElementById("headerBrandSub");
  if (tagEl) {
    tagEl.textContent = `${settings.businessName || "SmartRename AI"} Pipeline`;
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify(leads));
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

  localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  updateHeaderBranding();
  if (activeLead) {
    updateDrafterContent();
  }
  showToast("Profile & Settings saved! 🏢");
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
  const won = leads.filter(l => l.status === "won").length;
  const pending = leads.filter(l => l.status === "pending").length;
  const followups = leads.filter(l => l.status === "contacted" && isFollowUpDue(l)).length;

  document.getElementById("kpiTotal").textContent = total;
  document.getElementById("kpiContacted").textContent = contacted;
  document.getElementById("kpiSample").textContent = sample;
  document.getElementById("kpiWon").textContent = won;

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
      const matchName = lead.firmName.toLowerCase().includes(q);
      const matchPerson = lead.firstName.toLowerCase().includes(q);
      const matchLoc = (lead.location || "").toLowerCase().includes(q);
      const matchEmail = lead.email.toLowerCase().includes(q);
      return matchName || matchPerson || matchLoc || matchEmail;
    }
    return true;
  });

  if (filtered.length === 0) {
    emptyState.style.display = "block";
    return;
  }
  emptyState.style.display = "none";

  filtered.forEach(lead => {
    const card = document.createElement("div");
    card.className = "lead-card";

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
      <div class="lead-card-header">
        <div>
          <h3 class="lead-firm-title">${escapeHtml(lead.firmName)}</h3>
          <div class="lead-contact-line">
            <span>${escapeHtml(lead.firstName)}</span>
            <span class="dot">•</span>
            <span>${escapeHtml(lead.location || "USA")}</span>
          </div>
        </div>
        <span class="status-badge ${statusBadgeClass}" data-id="${lead.id}" title="Tap to cycle status">
          ${statusLabelMap[lead.status] || "Pending"}
        </span>
      </div>

      ${followupRowHtml}

      <div class="lead-hook-box">
        "${escapeHtml(lead.personalHook || "potential client for receipt & invoice sorting")}"
      </div>

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
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: promptText }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 350
        }
      })
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      const msg = errJson?.error?.message || `API error: ${response.status}`;
      throw new Error(msg);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (candidateText) {
      const subjectMatch = candidateText.match(/SUBJECT:\s*(.*?)(?:\n|$)/i);
      const bodyMatch = candidateText.match(/BODY:\s*([\s\S]*)/i);

      if (subjectMatch && subjectMatch[1]) {
        document.getElementById("drafterSubject").value = subjectMatch[1].trim();
      }
      if (bodyMatch && bodyMatch[1]) {
        document.getElementById("drafterBody").value = bodyMatch[1].trim();
      } else {
        document.getElementById("drafterBody").value = candidateText.trim();
      }

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

// Launch Email App (mailto:)
function launchMailApp() {
  if (!activeLead) return;
  const subject = document.getElementById("drafterSubject").value;
  const body = document.getElementById("drafterBody").value;

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
      errorMsg.textContent = "Please add your Gemini API Key in Settings (⚙️) to generate images with Imagen 3.";
      errorArea.style.display = "flex";
    }
    showToast("Please enter your Gemini API Key in Settings (⚙️)");
    openSettingsModal();
    return;
  }

  const concept = document.getElementById("mockupConceptSelect")?.value || "beforeAfter";
  const originalText = btnText.textContent;
  btn.disabled = true;
  btnText.textContent = "Generating with Imagen 3...";
  if (loadingArea) loadingArea.style.display = "flex";

  // Formulate hyper-detailed prompt matching firm branding and chosen concept
  const isSmartRename = (settings.businessName || "").toLowerCase().includes("smartrename");
  let promptText = "";

  if (isSmartRename) {
    if (concept === "videoThumb") {
      promptText = `A hyper-realistic, sleek B2B SaaS video demo thumbnail graphic for '${activeLead.firmName}'. In the center, a glowing frosted glass play button with text reading '30-Sec Demo for ${activeLead.firstName} at ${activeLead.firmName}'. In the background, a modern dark cybernetic interface showing automated document renaming and client folder sorting. Color palette has subtle neon cyan and deep violet accents, dark mode glassmorphism UI, 8k resolution, photorealistic cinematic lighting, crisp professional graphic design.`;
    } else if (concept === "portalDashboard") {
      promptText = `A high-tech, futuristic dark-mode SaaS dashboard interface branded for '${activeLead.firmName}' in ${activeLead.location || 'USA'}. It shows 50 disorganized incoming client invoices and receipt scans being automatically analyzed, extracted, and filed into structured client folders. Glowing cyan progress bars, purple status tags, clean modern typography, sleek glass panels, high resolution 8K render.`;
    } else {
      // Before & After (Default)
      promptText = `A photorealistic split-screen visual comparison tailored for '${activeLead.firmName}' in ${activeLead.location || 'USA'}. On the left: a cluttered office desk with crumpled chaotic paper receipts and unorganized PDF scans with messy filenames like 'scan_0042.pdf' and 'IMG_9102.jpg'. On the right: a modern, ultra-clean digital workspace screen showing SmartRename AI folder hierarchy branded for '${activeLead.firmName}', showing cleanly standardized files like '2026-09-11_Adobe_INV-9821.pdf'. Dark mode aesthetic, neon cyan and purple ambient glow, professional B2B product mockup, 8K resolution, crisp graphic design.`;
    }
  } else {
    // Dynamic Mockup for ANY business profile (Web Agency, SEO, Consulting, etc.)
    if (concept === "videoThumb") {
      promptText = `A hyper-realistic, sleek B2B presentation video thumbnail graphic branded for '${activeLead.firmName}'. In the center, a glowing frosted glass play button with crisp typography reading 'Brief Demo for ${activeLead.firstName} at ${activeLead.firmName}'. In the background, a modern dark executive dashboard illustrating '${settings.valueProp}'. Color palette with subtle neon cyan accents, glassmorphism UI, 8k resolution, cinematic lighting, crisp professional graphic design.`;
    } else if (concept === "portalDashboard") {
      promptText = `A modern, futuristic executive dashboard interface custom tailored for '${activeLead.firmName}' in ${activeLead.location || 'USA'}. Branded with '${settings.businessName}' technology, displaying clean data cards and high-performance metrics for '${settings.valueProp}'. Glowing cyan and violet UI elements, sleek dark mode glass panels, clean typography, 8K render.`;
    } else {
      // Before & After (Default)
      promptText = `A photorealistic split-screen visual transformation tailored for '${activeLead.firmName}' in ${activeLead.location || 'USA'}. On the left: a frustrating, outdated, chaotic business operation workflow with red bottleneck alerts. On the right: an ultra-sleek, modern, automated solution powered by ${settings.businessName}, showing high productivity and '${settings.valueProp}'. Dark mode aesthetic, neon ambient glow, crisp professional B2B presentation mockup, 8K resolution.`;
    }
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        instances: [{ prompt: promptText }],
        parameters: {
          sampleCount: 1,
          aspectRatio: "16:9",
          outputMimeType: "image/jpeg"
        }
      })
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      const msg = errJson?.error?.message || `Imagen 3 error: ${response.status}`;
      throw new Error(msg);
    }

    const data = await response.json();
    const base64Data = data.predictions?.[0]?.bytesBase64Encoded;
    const mimeType = data.predictions?.[0]?.mimeType || "image/jpeg";

    if (!base64Data) {
      throw new Error("No image data returned from Imagen 3");
    }

    currentMockupBase64 = `data:${mimeType};base64,${base64Data}`;
    if (imgResult) imgResult.src = currentMockupBase64;
    
    // Set download link
    if (downloadBtn) {
      downloadBtn.href = currentMockupBase64;
      const cleanFirm = (activeLead.firmName || "lead").toLowerCase().replace(/[^a-z0-9]/g, "_");
      downloadBtn.download = `${cleanFirm}_workflow_mockup.jpg`;
    }

    if (loadingArea) loadingArea.style.display = "none";
    if (previewArea) previewArea.style.display = "block";
    showToast("Branded mockup generated with Imagen 3! 🎨");
  } catch (err) {
    console.error("Imagen 3 Error:", err);
    if (loadingArea) loadingArea.style.display = "none";
    if (errorArea && errorMsg) {
      const isLeaked = err.message.includes("leaked") || err.message.includes("PERMISSION_DENIED");
      errorMsg.textContent = isLeaked
        ? "API key was flagged or disabled. Please update your key in Settings (⚙️)."
        : `Image generation failed: ${err.message}`;
      errorArea.style.display = "flex";
    }
    showToast(`Image gen error: ${err.message}`);
  } finally {
    btn.disabled = false;
    btnText.textContent = originalText;
  }
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
  const fuDateEl = document.getElementById("formFollowUpDate");
  if (fuDateEl) fuDateEl.value = "";
  document.getElementById("modalLead").style.display = "flex";
}

function openEditLeadModal(lead) {
  document.getElementById("leadModalTitle").textContent = "Edit Prospect";
  document.getElementById("editLeadId").value = lead.id;
  document.getElementById("formFirmName").value = lead.firmName;
  document.getElementById("formFirstName").value = lead.firstName;
  document.getElementById("formLocation").value = lead.location || "";
  document.getElementById("formEmail").value = lead.email;
  document.getElementById("formWebsite").value = lead.website || "";
  document.getElementById("formHook").value = lead.personalHook || "";
  
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
  const location = document.getElementById("formLocation").value.trim() || "USA";
  const email = document.getElementById("formEmail").value.trim();
  const website = document.getElementById("formWebsite").value.trim();
  const personalHook = document.getElementById("formHook").value.trim() || "noticed your client services";
  
  const statusVal = document.getElementById("formStatus") ? document.getElementById("formStatus").value : "pending";
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
      lead.location = location;
      lead.email = email;
      lead.website = website;
      lead.personalHook = personalHook;
      lead.status = statusVal;
      lead.followUpDueAt = followUpDateVal ? new Date(followUpDateVal).toISOString() : null;
      showToast("Prospect updated");
    }
  } else {
    // New Lead
    const newLead = {
      id: Date.now(),
      firmName,
      firstName,
      location,
      email,
      website,
      personalHook,
      status: statusVal,
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
    renderLeadsList();
  });

  clearBtn.addEventListener("click", () => {
    searchInput.value = "";
    currentSearch = "";
    clearBtn.style.display = "none";
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

  document.getElementById("btnExportData").addEventListener("click", exportData);
  document.getElementById("inputImportFile").addEventListener("change", importData);
  document.getElementById("btnClearAllLeads")?.addEventListener("click", clearAllLeads);
  document.getElementById("btnResetDefaults").addEventListener("click", resetToDefaults);

  // Close modals on overlay backdrop tap
  document.querySelectorAll(".modal-overlay").forEach(overlay => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        overlay.style.display = "none";
      }
    });
  });
}

// Start
document.addEventListener("DOMContentLoaded", init);
