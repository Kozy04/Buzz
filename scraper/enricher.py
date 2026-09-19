"""
Enrichment Engine:
Extracts executive decision-maker names, titles, and synthesizes tailored observation hooks.
"""

import re
from typing import Dict, List, Optional, Tuple

DECISION_TITLE_REGEX = re.compile(
    r'\b(CEO|Founder|Co-Founder|Owner|Co-Owner|Managing Director|Managing Partner|President|Principal|Partner|Director|Chief Technology Officer|Chief Executive Officer|Chief Operating Officer|CTO|CFO|COO|VP of [A-Za-z]+|Vice President)\b',
    re.IGNORECASE
)

# Common name-title regex patterns on /about and /team pages
# Matches: "Jane Doe, Founder & CEO" or "John Smith - Managing Director"
NAME_TITLE_PATTERNS = [
    re.compile(r'([A-Z][a-z]{1,18}\s+[A-Z][a-z]{1,20})\s*[,|\-–—]\s*(' + DECISION_TITLE_REGEX.pattern + r')', re.UNICODE),
    re.compile(r'(' + DECISION_TITLE_REGEX.pattern + r')\s*[:|\-–—]\s*([A-Z][a-z]{1,18}\s+[A-Z][a-z]{1,20})', re.UNICODE),
]

def clean_extracted_name(full_name: str) -> Tuple[str, str]:
    """Splits and formats a full name into (firstName, lastName)."""
    parts = full_name.strip().split()
    if not parts:
        return "there", ""
    first = parts[0].strip().capitalize()
    last = " ".join(parts[1:]).strip().capitalize() if len(parts) > 1 else ""
    return first, last

def detect_decision_maker_from_html(html_list: List[str]) -> Optional[Tuple[str, str, str]]:
    """
    Scans HTML pages for executive bios and names with leadership titles.
    Returns (firstName, lastName, title) or None.
    """
    for html in html_list:
        if not html:
            continue
        # Strip script and style tags to avoid false positives
        clean_text = re.sub(r'<script[^>]*>.*?</script>', ' ', html, flags=re.DOTALL | re.IGNORECASE)
        clean_text = re.sub(r'<style[^>]*>.*?</style>', ' ', clean_text, flags=re.DOTALL | re.IGNORECASE)
        clean_text = re.sub(r'<[^>]+>', ' ', clean_text)
        clean_text = re.sub(r'\s+', ' ', clean_text)

        for pattern in NAME_TITLE_PATTERNS:
            match = pattern.search(clean_text)
            if match:
                groups = match.groups()
                # Pattern 1: name, title
                if len(groups) >= 2:
                    val1, val2 = groups[0].strip(), groups[1].strip()
                    if DECISION_TITLE_REGEX.search(val2):
                        first, last = clean_extracted_name(val1)
                        return first, last, val2.title()
                    elif DECISION_TITLE_REGEX.search(val1):
                        first, last = clean_extracted_name(val2)
                        return first, last, val1.title()

    return None

def synthesize_hook(company_name: str, location: str, job_title: str, niche: str) -> str:
    """
    Generates a personalized observation hook tailored for Buzz cold outreach templates.
    """
    company = company_name.strip()
    loc = location.strip()
    title = job_title.strip()

    if title and title != "Owner / Founder" and company:
        return f"noticed your leadership as {title} at {company}"
    elif company and loc:
        return f"came across {company} and noticed your dedicated client work in {loc}"
    elif company:
        return f"saw your focus on high-quality client results at {company}"
    else:
        return f"noticed your impressive work and thought to reach out"

def enrich_business_record(record: Dict[str, str], target_niche: str, target_location: str) -> Dict[str, str]:
    """
    Enriches a scraped business record with executive contact names, titles, and hooks.
    """
    page_texts = record.pop("page_texts", [])
    company_name = record.get("company_name", "Company")
    location = record.get("location") or target_location
    current_first_name = record.get("firstName", "there")
    job_title = ""
    last_name = ""

    # Attempt to extract executive leadership from website content
    detected = detect_decision_maker_from_html(page_texts)
    if detected:
        first, last, title = detected
        current_first_name = first
        last_name = last
        job_title = title
    else:
        # If personal email was found, give a sensible decision-maker default
        if current_first_name != "there":
            job_title = "Founder / Owner"
        else:
            job_title = "Owner"

    # Synthesize tailored hook
    hook = synthesize_hook(company_name, location, job_title, target_niche)

    enriched = {
        "company": company_name,
        "firstName": current_first_name,
        "lastName": last_name,
        "title": job_title,
        "email": record.get("email", ""),
        "location": location,
        "website": record.get("website", ""),
        "phone": record.get("phone", ""),
        "personalHook": hook
    }

    return enriched
