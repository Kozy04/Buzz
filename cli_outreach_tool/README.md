# SmartRename AI — CLI Cold Outreach Automation Tool

> A lightweight, standalone Node.js command-line tool for dispatching personalized B2B cold outreach emails via SMTP with humanized delays, preview safety modes, and pre-rendered prospect drafts.

---

## 📁 Tool Structure

```
cli_outreach_tool/
├── README.md             # This usage guide
├── send_outreach.js      # Automated SMTP dispatcher script
├── leads.json            # Target prospect list (Austin & Denver bookkeepers)
└── drafts/               # 10 pre-rendered, personalized email drafts (.txt)
    ├── 1_Bald_Ginger.txt
    ├── 2_Hollis_CPA_Firm.txt
    ├── ...
    └── 10_Ray_CPA__P_C_.txt
```

---

## ⚙️ Prerequisites & Setup

1. **Node.js**: Ensure Node.js is installed (`node -v`).
2. **Nodemailer**: If you plan to send live emails via SMTP, install `nodemailer`:
   ```bash
   npm install nodemailer
   ```

---

## 🚀 Usage

### 1. Preview Mode (Dry Run — Safe, No Emails Sent)
To inspect all 10 drafted emails, recipient email addresses, and subject lines in your terminal:
```bash
node send_outreach.js --dry-run
```

### 2. Live Dispatch Mode (SMTP)
To dispatch real emails to prospects:
```bash
node send_outreach.js --send
```

#### Configuring SMTP Credentials
You can set credentials via environment variables before running:

**On Windows (PowerShell):**
```powershell
$env:SMTP_HOST = "smtp.gmail.com"
$env:SMTP_PORT = "465"
$env:SMTP_USER = "your-email@gmail.com"
$env:SMTP_PASS = "your-google-app-password"
$env:SENDER_NAME = "Founder, SmartRename AI"
node send_outreach.js --send
```

**On Linux / macOS:**
```bash
export SMTP_HOST="smtp.gmail.com"
export SMTP_PORT="465"
export SMTP_USER="your-email@gmail.com"
export SMTP_PASS="your-google-app-password"
export SENDER_NAME="Founder, SmartRename AI"
node send_outreach.js --send
```

---

## 🛡️ Deliverability Protection
* Incorporates a randomized **60 to 90-second delay** between sends to mimic organic human sending and avoid spam filters.
* Automatically records sent timestamps and status.
