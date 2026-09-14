"""
EBook Compiler & Publication Engine
Compiles Markdown manuscripts into publication-ready, beautifully styled HTML and PDF eBooks.
Uses Google Chrome / Microsoft Edge headless PDF engine.
"""

import os
import re
import subprocess
import markdown

CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
if not os.path.exists(CHROME_PATH):
    CHROME_PATH = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

CSS_STYLES = """
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&family=Merriweather:ital,wght@0,300;0,400;0,700;1,300;1,400&display=swap');

@page {
  size: letter;
  margin: 20mm 18mm 20mm 18mm;
  @bottom-center {
    content: counter(page);
    font-family: 'Inter', sans-serif;
    font-size: 8.5pt;
    color: #6B7280;
  }
}

@page:first {
  margin: 0;
  @bottom-center { content: ""; }
}

* {
  box-sizing: border-box;
}

body {
  font-family: 'Merriweather', Georgia, serif;
  font-size: 10pt;
  line-height: 1.65;
  color: #1F2937;
  background: #FFFFFF;
  margin: 0;
  padding: 0;
}

/* ==========================================================================
   COVER PAGE STYLING
   ========================================================================== */
.cover-page {
  width: 100%;
  height: 10.5in;
  max-height: 10.5in;
  page-break-after: always;
  page-break-inside: avoid;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 38px 45px 30px 45px;
  box-sizing: border-box;
  color: #FFFFFF;
  position: relative;
  overflow: hidden;
}

.cover-accountant {
  background: linear-gradient(145deg, #0A192F 0%, #0F2D4A 50%, #061120 100%);
}

.cover-agency {
  background: linear-gradient(145deg, #08080A 0%, #130D24 50%, #090614 100%);
}

.cover-badge-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.cover-badge {
  display: inline-block;
  font-family: 'Inter', sans-serif;
  font-size: 8pt;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  padding: 5px 12px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #38BDF8;
}

.cover-badge.gold {
  color: #FBBF24;
  border-color: rgba(251, 191, 36, 0.35);
  background: rgba(251, 191, 36, 0.12);
}

.cover-badge.purple {
  color: #C084FC;
  border-color: rgba(192, 132, 252, 0.35);
  background: rgba(192, 132, 252, 0.12);
}

.cover-header-group {
  margin-top: 8px;
}

.cover-title {
  font-family: 'Inter', sans-serif;
  font-size: 25pt;
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.025em;
  margin: 0 0 6px 0;
  color: #FFFFFF;
}

.cover-subtitle {
  font-family: 'Inter', sans-serif;
  font-size: 10pt;
  font-weight: 400;
  line-height: 1.45;
  color: #94A3B8;
  max-width: 620px;
  margin: 0;
}

.cover-hero-art {
  width: 100%;
  max-width: 440px;
  height: 380px;
  margin: 10px auto;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.15);
  display: flex;
  justify-content: center;
  align-items: center;
}

.cover-hero-art img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.cover-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  padding-top: 14px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  font-family: 'Inter', sans-serif;
}

.cover-author {
  font-size: 11pt;
  font-weight: 700;
  color: #F8FAFC;
}

.cover-edition {
  font-size: 8.5pt;
  color: #64748B;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

/* ==========================================================================
   BODY CONTENT & HEADINGS
   ========================================================================== */
.book-content {
  padding: 0 10px;
}

h1, h2, h3, h4, h5, h6 {
  font-family: 'Inter', sans-serif;
  color: #0F172A;
  font-weight: 700;
  page-break-after: avoid;
}

h1 {
  font-size: 20pt;
  line-height: 1.25;
  margin-top: 0;
  padding-bottom: 10px;
  border-bottom: 2px solid #E2E8F0;
  page-break-before: always;
}

h2 {
  font-size: 14.5pt;
  line-height: 1.3;
  margin-top: 32px;
  margin-bottom: 12px;
  color: #1E293B;
  border-bottom: 1px solid #F1F5F9;
  padding-bottom: 6px;
}

/* Force major chapters to start on a fresh page */
.chapter-start {
  page-break-before: always !important;
  margin-top: 0 !important;
  padding-top: 20px !important;
}

.chapter-number {
  display: block;
  font-family: 'Inter', sans-serif;
  font-size: 9pt;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: #0284C7;
  margin-bottom: 6px;
}

h3 {
  font-size: 12pt;
  margin-top: 22px;
  margin-bottom: 8px;
  color: #334155;
}

h4 {
  font-size: 10.5pt;
  margin-top: 16px;
  margin-bottom: 6px;
}

p {
  margin-top: 0;
  margin-bottom: 12px;
  text-align: justify;
}

strong {
  font-weight: 700;
  color: #0F172A;
}

em {
  font-style: italic;
}

/* ==========================================================================
   BLOCKQUOTES & CALLOUTS
   ========================================================================== */
blockquote {
  margin: 16px 0;
  padding: 12px 18px;
  background: #F8FAFC;
  border-left: 4px solid #0284C7;
  border-radius: 0 8px 8px 0;
  font-family: 'Inter', sans-serif;
  font-size: 9.5pt;
  line-height: 1.55;
  color: #334155;
  page-break-inside: avoid;
}

.callout {
  margin: 16px 0;
  padding: 14px 18px;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 9.5pt;
  line-height: 1.5;
  page-break-inside: avoid;
}

.callout-important {
  background: #FFFBEB;
  border-left: 4px solid #F59E0B;
  color: #92400E;
}

.callout-caution {
  background: #FEF2F2;
  border-left: 4px solid #EF4444;
  color: #991B1B;
}

.callout-tip {
  background: #F0FDF4;
  border-left: 4px solid #10B981;
  color: #065F46;
}

/* ==========================================================================
   TABLES
   ========================================================================== */
table {
  width: 100%;
  border-collapse: collapse;
  margin: 18px 0;
  font-family: 'Inter', sans-serif;
  font-size: 8.5pt;
  page-break-inside: avoid;
}

th, td {
  padding: 8px 12px;
  text-align: left;
  border: 1px solid #E2E8F0;
}

th {
  background: #0F172A;
  color: #FFFFFF;
  font-weight: 700;
}

tr:nth-child(even) {
  background: #F8FAFC;
}

/* ==========================================================================
   CODE BLOCKS
   ========================================================================== */
code {
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-size: 8.5pt;
  background: #F1F5F9;
  color: #0F172A;
  padding: 2px 5px;
  border-radius: 4px;
}

pre {
  background: #0B0F19;
  color: #E2E8F0;
  padding: 12px 14px;
  border-radius: 8px;
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-size: 8pt;
  line-height: 1.45;
  margin: 14px 0;
  page-break-inside: avoid;
  border: 1px solid #1E293B;
  white-space: pre-wrap;
  word-break: break-word;
  overflow: hidden;
}

pre code {
  background: transparent;
  color: inherit;
  padding: 0;
  font-size: inherit;
}

/* ==========================================================================
   LISTS & DIVIDERS
   ========================================================================== */
ul, ol {
  margin-top: 0;
  margin-bottom: 14px;
  padding-left: 22px;
}

li {
  margin-bottom: 5px;
  line-height: 1.5;
}

hr {
  border: none;
  border-top: 1px solid #E2E8F0;
  margin: 24px 0;
}

.diagram-box {
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  padding: 14px;
  margin: 16px 0;
  font-family: 'JetBrains Mono', monospace;
  font-size: 8pt;
  page-break-inside: avoid;
}
"""

def parse_markdown_manuscript(md_text):
    # Transform callouts [!IMPORTANT], [!CAUTION], [!TIP]
    def callout_replace(match):
        ctype = match.group(1).lower()
        content = match.group(2)
        return f'<div class="callout callout-{ctype}"><strong>{ctype.upper()}:</strong> {content}</div>'
    
    md_text = re.sub(r'>\s*\[!(IMPORTANT|CAUTION|TIP|NOTE)\]\s*\n((?:>.*\n?)+)', 
                     lambda m: f'<div class="callout callout-{m.group(1).lower()}">' + 
                               re.sub(r'^>\s*', '', m.group(2), flags=re.MULTILINE) + '</div>', 
                     md_text)

    # Convert markdown to html with extensions
    html_body = markdown.markdown(
        md_text,
        extensions=['tables', 'fenced_code', 'nl2br', 'sane_lists']
    )

    # Convert mermaid code blocks into live rendered diagrams
    def mermaid_replace(match):
        code = match.group(1).strip()
        code = code.replace("&lt;", "<").replace("&gt;", ">").replace("&amp;", "&").replace("&quot;", '"')
        return f'<div class="mermaid-diagram-card"><div class="mermaid">\n{code}\n</div></div>'

    html_body = re.sub(r'<pre><code class="language-mermaid">([\s\S]*?)</code></pre>', mermaid_replace, html_body)

    # Enhance chapter titles with special page-break classes
    html_body = re.sub(r'<h2>(Chapter \d+:.*?)</h2>', r'<h2 class="chapter-start"><span class="chapter-number">\1</span></h2>', html_body)
    html_body = re.sub(r'<h2>(Preface:.*?)</h2>', r'<h2 class="chapter-start">\1</h2>', html_body)
    html_body = re.sub(r'<h2>(Appendix [A-Z]:.*?)</h2>', r'<h2 class="chapter-start">\1</h2>', html_body)

    # Strip HR tags directly preceding chapter breaks to prevent blank pages
    html_body = re.sub(r'<hr\s*/?>\s*(<h2 class="chapter-start">)', r'\1', html_body)
    html_body = re.sub(r'<hr\s*/?>\s*(<h1>)', r'\1', html_body)

    return html_body

def build_book(book_config):
    md_path = book_config["md_path"]
    out_html = book_config["out_html"]
    out_pdf = book_config["out_pdf"]
    cover_class = book_config["cover_class"]
    badge_class = book_config["badge_class"]
    badge_text = book_config["badge_text"]
    title = book_config["title"]
    subtitle = book_config["subtitle"]
    author = book_config["author"]
    edition = book_config["edition"]
    cover_image = book_config.get("cover_image", "cover_artwork.jpg")

    with open(md_path, "r", encoding="utf-8") as f:
        raw_md = f.read()

    body_html = parse_markdown_manuscript(raw_md)

    full_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>{title}</title>
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', () => {{
      mermaid.initialize({{
        startOnLoad: true,
        theme: 'neutral',
        themeVariables: {{
          primaryColor: '#F0F9FF',
          primaryTextColor: '#0F172A',
          primaryBorderColor: '#0284C7',
          lineColor: '#0284C7',
          secondaryColor: '#F8FAFC',
          tertiaryColor: '#FFFFFF'
        }},
        fontFamily: 'Inter, sans-serif'
      }});
    }});
  </script>
  <style>
{CSS_STYLES}

.mermaid-diagram-card {{
  margin: 22px auto;
  padding: 16px 20px;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  text-align: center;
  page-break-inside: avoid;
  display: flex;
  justify-content: center;
  align-items: center;
}}

.mermaid-diagram-card svg {{
  max-width: 100% !important;
  height: auto !important;
}}

.mermaid {{
  width: 100%;
  display: flex;
  justify-content: center;
}}
  </style>
</head>
<body>

  <!-- COVER PAGE -->
  <div class="cover-page {cover_class}">
    <div class="cover-badge-row">
      <span class="cover-badge {badge_class}">{badge_text}</span>
      <span class="cover-badge">Complete Operational Field Guide</span>
    </div>

    <div class="cover-header-group">
      <h1 class="cover-title">{title}</h1>
      <p class="cover-subtitle">{subtitle}</p>
    </div>

    <div class="cover-hero-art">
      <img src="{cover_image}" alt="Cover Artwork" />
    </div>

    <div class="cover-footer">
      <div>
        <div class="cover-author">{author}</div>
        <div style="font-size: 8.5pt; color: #94A3B8; margin-top: 2px;">Published by Antigravity Publishing Group</div>
      </div>
      <div class="cover-edition">{edition}</div>
    </div>
  </div>

  <!-- MAIN BOOK CONTENT -->
  <div class="book-content">
{body_html}
  </div>

</body>
</html>
"""

    with open(out_html, "w", encoding="utf-8") as f:
        f.write(full_html)
    print(f"[OK] Generated HTML: {out_html}")

    # Compile to PDF using Chrome Headless
    abs_html = os.path.abspath(out_html).replace("\\", "/")
    abs_pdf = os.path.abspath(out_pdf)

    chrome_cmd = [
        CHROME_PATH,
        "--headless=new",
        "--disable-gpu",
        "--no-pdf-header-footer",
        "--virtual-time-budget=8000",
        "--run-all-compositor-stages-before-draw",
        f"--print-to-pdf={abs_pdf}",
        f"file:///{abs_html}"
    ]

    print(f"[Compiling PDF] {abs_pdf}...")
    res = subprocess.run(chrome_cmd, capture_output=True, text=True)
    if res.returncode == 0 and os.path.exists(abs_pdf):
        size_kb = os.path.getsize(abs_pdf) / 1024
        print(f"[SUCCESS] Created PDF: {abs_pdf} ({size_kb:.1f} KB)")
    else:
        print(f"[ERROR] Failed creating PDF: {res.stderr}")

if __name__ == "__main__":
    books = [
        {
            "md_path": os.path.join(BASE_DIR, "the_ai_powered_accountant", "the_ai_powered_accountant_manuscript.md"),
            "out_html": os.path.join(BASE_DIR, "the_ai_powered_accountant", "The_AI_Powered_Accountant.html"),
            "out_pdf": os.path.join(BASE_DIR, "the_ai_powered_accountant", "The_AI_Powered_Accountant.pdf"),
            "cover_class": "cover-accountant",
            "badge_class": "gold",
            "badge_text": "2026 Practical Implementation Series",
            "title": "The AI-Powered Accountant",
            "subtitle": "A Tactical Guide to Automating Client Onboarding, Receipt Reconciliation, Document Workflows, and Monthly Reporting with Modern AI",
            "author": "Antigravity Publishing & Digital Assets Group",
            "edition": "First Edition (2026) — Complete Master Edition"
        },
        {
            "md_path": os.path.join(BASE_DIR, "ai_automation_agency_blueprint", "ai_automation_agency_blueprint_manuscript.md"),
            "out_html": os.path.join(BASE_DIR, "ai_automation_agency_blueprint", "The_AI_Automation_Agency_Blueprint.html"),
            "out_pdf": os.path.join(BASE_DIR, "ai_automation_agency_blueprint", "The_AI_Automation_Agency_Blueprint.pdf"),
            "cover_class": "cover-agency",
            "badge_class": "purple",
            "badge_text": "2026 Agency Scaling Series",
            "title": "The 7-Figure AI Automation Agency Blueprint",
            "subtitle": "How to Build, Price, and Sell High-Ticket n8n, Make, and LLM Workflows to Real Businesses",
            "author": "Antigravity Publishing & Digital Assets Group",
            "edition": "First Edition (2026) — Complete Master Edition"
        }
    ]

    for b in books:
        build_book(b)
