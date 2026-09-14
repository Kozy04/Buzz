# Buzz Monorepo — B2B Outreach CRM & Digital Assets Suite

> Welcome to the **Buzz** workspace. This repository houses three distinct, decoupled tools organized into specialized directories.

---

## 🧭 Repository Architecture & Directory Map

```
Buzz/
├── [1. BUZZ OUTREACH PWA - ROOT WEB APP]
│   ├── index.html                      # Mobile-first PWA CRM user interface
│   ├── style.css                       # Obsidian dark design system & styles
│   ├── app.js                          # CRM engine, Gemini AI, Mockups & Auto-Pilot logic
│   ├── sw.js                           # Progressive Web App Service Worker (v21)
│   ├── manifest.json                   # PWA Web Manifest (installable on iOS/Android)
│   ├── icon.svg                        # Vector lightning app icon
│   ├── buzz-send.php                   # Downloadable cPanel direct email bridge endpoint
│   └── .gitignore                      # Git ignore patterns
│
├── [2. NEXUS AI FRAMER SAAS TEMPLATE]  # ➔ See nexus_ai_framer_template/README.md
│   └── nexus_ai_framer_template/
│       ├── components/                 # Framer React code components (CodeSnippetTabs, Pricing)
│       ├── bonus_ebook/                # Companion SaaS launch architecture playbook
│       ├── design_tokens.json          # Nexus Dark Obsidian design system tokens
│       ├── landing_page_copy.md        # Complete marketing & landing page copy
│       ├── template_architecture_guide.md # Framer assembly & breakpoint construction specs
│       └── marketplace_submission_guide.md# Framer Marketplace review & monetization checklist
│
├── [3. CLI COLD OUTREACH SCRIPT]       # ➔ See cli_outreach_tool/README.md
│   └── cli_outreach_tool/
│       ├── send_outreach.js            # Node.js automated SMTP dispatcher with human delays
│       ├── leads.json                  # Target prospect database
│       └── drafts/                     # 10 pre-rendered, personalized prospect email drafts
│
└── [4. COMMERCIAL EBOOKS CATALOG]      # ➔ See ebooks/README.md
    └── ebooks/
        ├── the_ai_powered_accountant/  # Book 1: Manuscript, KDP metadata, Gumroad copy
        └── ai_automation_agency_blueprint/ # Book 2: Manuscript, KDP metadata, Gumroad copy
```

---

## ⚡ 1. Buzz Outreach CRM (Mobile-First Progressive Web App)

* **Live Deployment:** [https://kozy04.github.io/Buzz/](https://kozy04.github.io/Buzz/)
* **GitHub Repository:** [https://github.com/Kozy04/Buzz](https://github.com/Kozy04/Buzz)
* **PWA Installable:** Install directly to your iPhone or Android home screen with zero app store downloads.

### Core Capabilities:
* **Pre-Seeded Lead CRM:** Pipeline management across 4 stages (`Pending`, `Contacted`, `Sample Sent`, `Won`).
* **✨ AI Smart Drafter (Gemini 2.5 Flash):** Generates hyper-personalized cold outreach emails referencing real firm names, cities, and personal hooks in under 1 second.
* **🎨 3-Tier Pitch Mockup Engine:** Generates high-res 1280x720 branded before/after mockups (Gemini SVG ➔ Pollinations Flux ➔ Canvas fallback).
* **🔍 AI Lead Scout:** Live Google Search Grounding to discover authentic prospects in any Country, State, and City/LGA.
* **🚀 Auto-Pilot Bulk Campaign:** Batch-select prospects and dispatch automated campaigns hands-free.
* **📬 Direct Email Dispatch:** Dual gateway support for cPanel PHP Bridge (`buzz-send.php`) and Google Apps Script Webhooks.
* **📖 In-App How-To Guide:** Step-by-step interactive documentation built into the app header.

### Running Locally:
```bash
# Start a local static HTTP server
python -m http.server 8085
# Open in your browser: http://localhost:8085
```

---

## 🎨 2. Nexus AI Framer SaaS Template Package

A complete, production-ready dark-mode template package designed for selling on the official Framer Marketplace or via Lemon Squeezy:
* Interactive React/Framer components (`<InteractivePricingCalculator />`, `<CodeSnippetTabs />`).
* Framer Marketplace submission quality checklist & 50% recurring affiliate setup.
* Complete SaaS landing page copy and construction specifications.
* Companion digital product: *The SaaS Launch & Conversion Architecture Playbook*.

👉 **[Open Nexus AI Framer Template Package](./nexus_ai_framer_template/README.md)**

---

## 🤖 3. CLI Cold Outreach Automation Tool

A lightweight, standalone command-line script for sending personalized emails via SMTP:
* **Dry Run Mode:** Preview all 10 drafted emails in the console (`node send_outreach.js --dry-run`).
* **Safe SMTP Sending:** Humanized 60–90 second delays between sends (`node send_outreach.js --send`).

👉 **[Open CLI Outreach Tool Documentation](./cli_outreach_tool/README.md)**

---

## 📚 4. Commercial eBooks & Digital Publishing Catalog

A dual-catalog publishing package optimized for **Amazon Kindle Direct Publishing (KDP)** organic search traffic and direct sales (**Gumroad / Lemon Squeezy**):
* **Book 1: The AI-Powered Accountant** (Practitioner manual: automating receipt OCR, bank feeds, and Fractional CFO advisory retainers).
* **Book 2: The 7-Figure AI Automation Agency Blueprint** (Agency builder playbook: packaging and selling high-ticket n8n & LLM workflows).
* Complete with full manuscripts, Amazon KDP 7 backend keywords, categories, HTML blurbs, and Gumroad sales page copy.

👉 **[Open eBooks Catalog & Publishing Guide](./ebooks/README.md)**

