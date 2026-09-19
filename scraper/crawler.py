"""
Crawler & Email Extraction Engine:
Crawls business websites (homepage, /contact, /about, /team) to extract direct emails and leadership contacts.
"""

import re
import urllib.parse
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import List, Dict, Optional, Tuple
import requests

USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"

# Email blacklist (junk, tracking, third-party libraries, placeholders)
JUNK_EMAIL_DOMAINS = {
    "sentry.io", "wixpress.com", "wordpress.org", "example.com", "yourdomain.com",
    "domain.com", "email.com", "cloudflare.com", "googleapis.com", "schema.org",
    "gravatar.com", "w3.org", "themeforest.net", "envato.com", "hubspot.com"
}

JUNK_PREFIXES = {
    "noreply", "no-reply", "mailer-daemon", "abuse", "postmaster",
    "root", "privacy", "unsubscribe", "optout", "donotreply"
}

JUNK_EXTENSIONS = {
    ".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".css", ".js", ".woff", ".ttf", ".bmp"
}

# Regex for matching email addresses
EMAIL_REGEX = re.compile(r'\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b', re.IGNORECASE)

# Common subpage paths likely to contain contacts or leadership profiles
SUBPAGE_TARGETS = [
    "/contact",
    "/contact-us",
    "/about",
    "/about-us",
    "/team",
    "/our-team",
    "/leadership",
    "/people"
]

def clean_email(raw_email: str) -> Optional[str]:
    """Validates and filters raw emails against junk filters and assets."""
    if not raw_email:
        return None
    email = raw_email.strip().lower()
    
    # Check asset extensions (e.g. image@2x.png)
    for ext in JUNK_EXTENSIONS:
        if email.endswith(ext):
            return None

    if "@" not in email:
        return None

    user, domain = email.split("@", 1)
    if not user or not domain or "." not in domain:
        return None

    # Filter junk prefixes
    if user in JUNK_PREFIXES or user.startswith("no-reply"):
        return None

    # Filter junk domains
    for junk_dom in JUNK_EMAIL_DOMAINS:
        if domain == junk_dom or domain.endswith("." + junk_dom):
            return None

    # Filter obvious placeholder patterns
    if user in {"name", "username", "test", "yourname", "first.last", "email", "john.doe"}:
        return None

    return email

def is_personal_email(email: str) -> bool:
    """Checks if email appears to be an individual's address rather than a generic firm inbox."""
    user = email.split("@")[0].lower()
    generic_inboxes = {
        "info", "contact", "support", "help", "office", "admin", "sales",
        "inquiries", "hello", "team", "billing", "service", "frontdesk"
    }
    return user not in generic_inboxes and len(user) >= 2

def derive_name_from_email(email: str) -> str:
    """Derives a candidate first name from personal email address."""
    user = email.split("@")[0].lower()
    # If user contains dots or underscores (e.g. sarah.jenkins@... or sarah_j@...)
    parts = re.split(r'[._-]', user)
    if parts and len(parts[0]) >= 2:
        candidate = parts[0]
        # Ensure it only contains letters
        if candidate.isalpha():
            return candidate.capitalize()
    return "there"

def extract_emails_from_html(html: str, website_domain: str) -> List[str]:
    """Extracts all emails from HTML text and mailto links, prioritizing domain matches."""
    found: set = set()

    # 1. Scan mailto: links
    mailto_matches = re.findall(r'mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})', html, re.IGNORECASE)
    for m in mailto_matches:
        cleaned = clean_email(m)
        if cleaned:
            found.add(cleaned)

    # 2. General regex search across HTML body
    raw_matches = EMAIL_REGEX.findall(html)
    for m in raw_matches:
        cleaned = clean_email(m)
        if cleaned:
            found.add(cleaned)

    # Sort emails: prioritize personal emails on the business's own domain first
    domain_emails = [e for e in found if website_domain in e]
    other_emails = [e for e in found if website_domain not in e]

    def email_priority_score(e: str) -> int:
        score = 0
        if website_domain in e:
            score += 10
        if is_personal_email(e):
            score += 20
        return score

    all_sorted = sorted(list(found), key=email_priority_score, reverse=True)
    return all_sorted

def fetch_page(url: str, session: requests.Session, timeout: int = 5) -> Tuple[str, str]:
    """Fetches a web page and returns (url, html_text)."""
    try:
        resp = session.get(url, timeout=timeout, headers={"User-Agent": USER_AGENT})
        if resp.status_code == 200 and "text/html" in resp.headers.get("Content-Type", ""):
            return url, resp.text
    except Exception:
        pass
    return url, ""

def crawl_business_website(business: Dict[str, str], session: Optional[requests.Session] = None) -> Dict[str, str]:
    """
    Crawls a single business's website across homepage and key subpages to discover contacts.
    """
    close_session = False
    if session is None:
        session = requests.Session()
        close_session = True

    base_url = business.get("website", "").rstrip("/")
    domain = business.get("domain", "")
    enriched = dict(business)

    if not base_url.startswith("http"):
        base_url = "https://" + base_url

    found_emails = []
    page_texts = []

    # 1. Fetch Homepage
    home_url, home_html = fetch_page(base_url, session)
    if home_html:
        page_texts.append(home_html)
        home_emails = extract_emails_from_html(home_html, domain)
        found_emails.extend(home_emails)

        # Look for subpage links within homepage
        candidate_subpages = set()
        link_matches = re.findall(r'href=["\']([^"\']+)["\']', home_html, re.IGNORECASE)
        for link in link_matches:
            link_clean = link.strip().lower()
            for target in SUBPAGE_TARGETS:
                if target in link_clean:
                    full_url = urllib.parse.urljoin(base_url, link)
                    if domain in full_url:
                        candidate_subpages.add(full_url)

        # If no explicit links found, try the top 2 default paths
        if not candidate_subpages:
            candidate_subpages.add(f"{base_url}/contact")
            candidate_subpages.add(f"{base_url}/about")

        # Fetch up to 3 subpages
        for sub_url in list(candidate_subpages)[:3]:
            _, sub_html = fetch_page(sub_url, session)
            if sub_html:
                page_texts.append(sub_html)
                sub_emails = extract_emails_from_html(sub_html, domain)
                for e in sub_emails:
                    if e not in found_emails:
                        found_emails.append(e)

    if close_session:
        session.close()

    # Deduplicate emails preserving priority order
    final_emails = []
    for e in found_emails:
        if e not in final_emails:
            final_emails.append(e)

    # Choose best email (prefer personal address)
    primary_email = ""
    first_name = "there"
    if final_emails:
        primary_email = final_emails[0]
        if is_personal_email(primary_email):
            first_name = derive_name_from_email(primary_email)

    enriched["email"] = primary_email
    enriched["all_emails"] = ", ".join(final_emails)
    enriched["firstName"] = first_name
    enriched["page_texts"] = page_texts  # Used by enricher for team detection

    return enriched

def crawl_batch_businesses(businesses: List[Dict[str, str]], max_workers: int = 8) -> List[Dict[str, str]]:
    """
    Crawls a list of discovered businesses concurrently using a thread pool.
    """
    enriched_results = []
    with requests.Session() as session:
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            future_to_biz = {
                executor.submit(crawl_business_website, biz, session): biz
                for biz in businesses
            }
            for future in as_completed(future_to_biz):
                try:
                    res = future.result()
                    enriched_results.append(res)
                except Exception as e:
                    biz = future_to_biz[future]
                    enriched_results.append(biz)

    return enriched_results
