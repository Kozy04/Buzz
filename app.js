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
    status: "pending"
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
    status: "pending"
  },
  {
    id: 5,
    firmName: "Swift Bookkeeping and More",
    firstName: "there",
    email: "hello@swiftnumbers.com",
    location: "Austin, TX",
    website: "https://www.swiftnumbers.com",
    personalHook: "noticed your dedicated monthly client bookkeeping and receipt reconciliation services",
    status: "pending"
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
let settings = {
  senderName: "Founder, SmartRename AI",
  productUrl: "https://smartrenameai.online",
  geminiApiKey: "AIzaSyDomMXLi9JjVyvWoMQuNRu3QwsyXjQPQqc"
};

// Templates
const TEMPLATES = {
  receipt: {
    name: "Receipt Hook",
    getSubject: (lead) => `receipt & invoice naming at ${lead.firmName}`,
    getBody: (lead) => `Hi ${lead.firstName},

I came across ${lead.firmName} and ${lead.personalHook}.

Quick question: during monthly close and tax prep, how much time does your team spend opening, reading, and renaming client receipts and invoices that arrive with chaotic names like "scan_0042.pdf" or iPhone photo numbers?

We built SmartRename AI (${settings.productUrl}) specifically to eliminate that manual bottleneck.

Our system uses vision AI and OCR to instantly read the vendor, invoice date, and total from inside any PDF or receipt image, renames the file to your exact standard (e.g., "2026-09-11_Adobe_INV-9821_Receipt.pdf"), and automatically organizes them into client/year folder structures in one batch.

Would you be open to a quick, zero-obligation test?

If you send over 15-20 of your messiest sample client receipts or PDFs, I will run them through the system and send you back a cleanly standardized ZIP in 5 minutes—free of charge so you can see how it works on your own files.

Best regards,

${settings.senderName}
SmartRename AI
${settings.productUrl}`
  },

  cpa: {
    name: "CPA Document Hook",
    getSubject: (lead) => `eliminating manual document renaming at ${lead.firmName}`,
    getBody: (lead) => `Hi ${lead.firstName},

I noticed the full-service accounting and tax work your team does for businesses at ${lead.firmName}.

Quick question: when clients send batches of unorganized documents, bank statements, and tax receipts named things like "Untitled.pdf" or "IMG_4910.jpg", how much time does your team lose manually sorting and renaming them?

We built SmartRename AI (${settings.productUrl}) to automate that entire step.

It reads document contents via multi-modal OCR, extracts the vendor, date, and invoice numbers, formats the filenames to your firm's strict convention, and generates clean client folder hierarchies in seconds.

Could I process a sample batch of 15–20 unorganized documents for your team for free so you can see the speed and accuracy firsthand?

Best regards,

${settings.senderName}
SmartRename AI
${settings.productUrl}`
  },

  followup: {
    name: "48h Loom Bump",
    getSubject: (lead) => `Re: receipt & invoice naming at ${lead.firmName}`,
    getBody: (lead) => `Hi ${lead.firstName},

Following up briefly on this—I know you're busy managing client books.

Here is a 45-second demo showing 40 messy incoming client receipts being parsed, renamed, and organized into categorized folders in under 10 seconds: [Insert Loom Demo Link]

I'd be happy to set you up with 100 free file credits on ${settings.productUrl} so you can test it on your next batch. Let me know if you'd like an access pass!

Best,

${settings.senderName}`
  }
};

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
  document.getElementById("settingsSenderName").value = settings.senderName;
  document.getElementById("settingsProductUrl").value = settings.productUrl;
  document.getElementById("settingsGeminiKey").value = settings.geminiApiKey || "";
}

function saveData() {
  localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify(leads));
  updateKpiAndCounts();
}

function saveSettings() {
  settings.senderName = document.getElementById("settingsSenderName").value.trim() || "Founder, SmartRename AI";
  settings.productUrl = document.getElementById("settingsProductUrl").value.trim() || "https://smartrenameai.online";
  settings.geminiApiKey = document.getElementById("settingsGeminiKey").value.trim() || "AIzaSyDomMXLi9JjVyvWoMQuNRu3QwsyXjQPQqc";
  localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  showToast("Settings saved");
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

  document.getElementById("kpiTotal").textContent = total;
  document.getElementById("kpiContacted").textContent = contacted;
  document.getElementById("kpiSample").textContent = sample;
  document.getElementById("kpiWon").textContent = won;

  document.getElementById("countAll").textContent = total;
  document.getElementById("countPending").textContent = pending;
  document.getElementById("countContacted").textContent = contacted;
  document.getElementById("countSample").textContent = sample;
  document.getElementById("countWon").textContent = won;
}

function renderLeadsList() {
  const container = document.getElementById("leadsList");
  const emptyState = document.getElementById("emptyState");
  container.innerHTML = "";

  const filtered = leads.filter(lead => {
    // Filter by tab
    if (currentFilter !== "all" && lead.status !== currentFilter) {
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

      <div class="lead-hook-box">
        "${escapeHtml(lead.personalHook || "potential client for receipt & invoice sorting")}"
      </div>

      <div class="lead-card-actions">
        <div class="action-btn-group">
          <button class="btn-open-draft" data-id="${lead.id}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            <span>Draft & Send</span>
          </button>
          
          <button class="icon-btn edit-lead-btn" data-id="${lead.id}" style="width: 36px; height: 36px;" title="Edit Lead">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
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
  
  // Set template pills
  document.querySelectorAll(".template-pill").forEach(p => {
    p.classList.toggle("active", p.dataset.template === activeTemplate);
  });

  updateDrafterContent();
  updateDrafterStatusPills(lead.status);

  document.getElementById("modalDrafter").style.display = "flex";
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

  const apiKey = settings.geminiApiKey || "AIzaSyDomMXLi9JjVyvWoMQuNRu3QwsyXjQPQqc";
  if (!apiKey) {
    showToast("Please enter a Gemini API Key in Settings");
    return;
  }

  const aiBtn = document.getElementById("btnAiDraft");
  const aiBtnText = document.getElementById("aiBtnText");
  const originalText = aiBtnText.textContent;

  aiBtn.classList.add("loading");
  aiBtnText.textContent = "AI Drafting...";

  const promptText = `You are an elite B2B cold email copywriter. Write a concise, hyper-personalized, non-spammy cold outreach email from "${settings.senderName}" to "${activeLead.firstName}" at "${activeLead.firmName}".

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
      throw new Error(`API error: ${response.status}`);
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
    showToast("AI drafting failed. Check API key.");
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
  
  // Mark lead as contacted automatically if it was pending
  if (activeLead.status === "pending") {
    setLeadStatus(activeLead.id, "contacted");
  }

  showToast("Launching mail client...");
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
  document.getElementById("modalLead").style.display = "flex";
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
      status: "pending"
    };
    leads.unshift(newLead);
    showToast("New prospect added!");
  }

  saveData();
  renderApp();
  closeLeadModal();
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

  // Template pills
  document.querySelectorAll(".template-pill").forEach(pill => {
    pill.addEventListener("click", () => {
      document.querySelectorAll(".template-pill").forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      activeTemplate = pill.dataset.template;
      updateDrafterContent();
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

  // Add / Edit Lead
  document.getElementById("btnAddLead").addEventListener("click", openAddLeadModal);
  document.getElementById("btnCloseLeadModal").addEventListener("click", closeLeadModal);
  document.getElementById("btnCancelLead").addEventListener("click", closeLeadModal);
  document.getElementById("leadForm").addEventListener("submit", handleSaveLead);

  // Settings
  document.getElementById("btnSettings").addEventListener("click", openSettingsModal);
  document.getElementById("btnCloseSettings").addEventListener("click", closeSettingsModal);
  document.getElementById("settingsSenderName").addEventListener("change", saveSettings);
  document.getElementById("settingsProductUrl").addEventListener("change", saveSettings);
  document.getElementById("settingsGeminiKey").addEventListener("change", saveSettings);
  document.getElementById("btnExportData").addEventListener("click", exportData);
  document.getElementById("inputImportFile").addEventListener("change", importData);
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
