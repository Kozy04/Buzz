"""
Discovery Engine: Finds candidate businesses and websites for a given niche and location.
Zero paid API keys required.
"""

import re
import urllib.parse
from typing import List, Dict, Set, Optional, Tuple
import requests

# Domains to ignore as they are aggregator directories, social media, or search engines
EXCLUDED_DOMAINS = {
    "google.com", "google.co.uk", "facebook.com", "instagram.com", "twitter.com", "x.com",
    "linkedin.com", "youtube.com", "yelp.com", "yellowpages.com", "bbb.org", "mapquest.com",
    "tripadvisor.com", "wikipedia.org", "angieslist.com", "angi.com", "thumbtack.com",
    "houzz.com", "bark.com", "clutch.co", "upwork.com", "fiverr.com", "glassdoor.com",
    "indeed.com", "crunchbase.com", "bloomberg.com", "reddit.com", "pinterest.com",
    "zoominfo.com", "dnb.com", "manta.com", "superpages.com", "chamberofcommerce.com"
}

USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"

def clean_domain(url: str) -> str:
    """Extracts clean base domain from a URL."""
    if not url:
        return ""
    if not url.startswith("http://") and not url.startswith("https://"):
        url = "https://" + url
    try:
        parsed = urllib.parse.urlparse(url)
        domain = parsed.netloc.lower()
        if domain.startswith("www."):
            domain = domain[4:]
        return domain
    except Exception:
        return ""

def is_valid_target_domain(domain: str) -> bool:
    """Checks if domain is a legitimate target business rather than an aggregator."""
    if not domain or "." not in domain:
        return False
    for excluded in EXCLUDED_DOMAINS:
        if domain == excluded or domain.endswith("." + excluded):
            return False
    return True

def search_duckduckgo(query: str, max_results: int = 40) -> List[Dict[str, str]]:
    """
    Discovers candidate businesses using public search results.
    """
    candidates = []
    seen_domains: Set[str] = set()
    headers = {
        "User-Agent": USER_AGENT,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://duckduckgo.com/"
    }

    # DuckDuckGo HTML endpoint
    url = f"https://html.duckduckgo.com/html/?q={urllib.parse.quote_plus(query)}"
    try:
        resp = requests.post("https://html.duckduckgo.com/html/", data={"q": query}, headers=headers, timeout=10)
        if resp.status_code == 200:
            html = resp.text
            # Extract links and titles from DuckDuckGo HTML result items
            # Pattern matches <a class="result__url" href="..."> or <a class="result__a" href="...">
            link_pattern = re.compile(r'<a[^>]+class="result__snippet"[^>]*>.*?</a>|<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>(.*?)</a>', re.DOTALL | re.IGNORECASE)
            
            # Alternative standard result link parsing
            results = re.findall(r'<a[^>]+class="result__url"[^>]+href="([^"]+)"[^>]*>\s*([^\s<]+)', html)
            
            # Also grab title and href from result__a
            result_items = re.findall(r'<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>(.*?)</a>', html)
            for href, raw_title in result_items:
                # DuckDuckGo wraps target URLs in /l/?kh=-1&uddg=...
                actual_url = href
                if "uddg=" in href:
                    match = re.search(r'uddg=([^&]+)', href)
                    if match:
                        actual_url = urllib.parse.unquote(match.group(1))
                
                domain = clean_domain(actual_url)
                if not is_valid_target_domain(domain) or domain in seen_domains:
                    continue

                seen_domains.add(domain)
                # Clean up HTML tags in title
                title = re.sub(r'<[^>]+>', '', raw_title).strip()
                # Often titles are: "Acme Accounting: Bookkeeping Services in Austin" -> extract company name
                company_name = title.split(" - ")[0].split(" | ")[0].split(" : ")[0].split(" – ")[0].strip()
                if len(company_name) > 50:
                    company_name = company_name[:50].strip()

                candidates.append({
                    "company_name": company_name or domain.capitalize(),
                    "website": f"https://{domain}",
                    "domain": domain,
                    "source": "web_search"
                })

                if len(candidates) >= max_results:
                    break
    except Exception as e:
        # Fallback will continue
        pass

    return candidates

def geocode_location(location: str) -> Optional[Tuple[float, float, float, float]]:
    """Geocodes location to bounding box (south, north, west, east) using Nominatim."""
    try:
        headers = {"User-Agent": "BuzzLeadScraper/1.0 (B2B Lead Research; contact@buzz.local)"}
        clean_loc = urllib.parse.quote_plus(location.strip())
        url = f"https://nominatim.openstreetmap.org/search?q={clean_loc}&format=json&limit=1"
        resp = requests.get(url, headers=headers, timeout=8)
        if resp.status_code == 200 and resp.json():
            bbox = resp.json()[0].get("boundingbox", [])
            if len(bbox) == 4:
                return float(bbox[0]), float(bbox[1]), float(bbox[2]), float(bbox[3])
    except Exception:
        pass
    return None

def search_overpass(niche: str, location: str, max_results: int = 50) -> List[Dict[str, str]]:
    """
    Queries OpenStreetMap Overpass API for local businesses with registered websites.
    """
    candidates = []
    seen_domains: Set[str] = set()

    # Determine tags based on niche
    niche_lower = niche.lower()
    tag_filter = '["office"]'
    if any(k in niche_lower for k in ["bookkeep", "account", "cpa", "tax", "finance"]):
        tag_filter = '["office"~"accountant|financial|tax_advisor|insurance|financial_advisor"]'
    elif any(k in niche_lower for k in ["law", "legal", "attorney"]):
        tag_filter = '["office"~"lawyer|notary|attorney"]'
    elif any(k in niche_lower for k in ["dentist", "dental", "clinic", "health", "doctor"]):
        tag_filter = '["amenity"~"dentist|clinic|doctors|pharmacy"]'
    elif any(k in niche_lower for k in ["realt", "estate", "broker", "property"]):
        tag_filter = '["office"="estate_agent"]'
    elif any(k in niche_lower for k in ["architect", "design", "engineer"]):
        tag_filter = '["office"~"architect|engineer|graphic_design"]'
    elif any(k in niche_lower for k in ["construct", "contractor", "roof", "plumb", "electric"]):
        tag_filter = '["craft"]'
    elif any(k in niche_lower for k in ["restaurant", "cafe", "food"]):
        tag_filter = '["amenity"~"restaurant|cafe|bar"]'

    headers = {"User-Agent": "BuzzLeadScraper/1.0 (B2B Lead Research; contact@buzz.local)"}
    overpass_urls = [
        "https://overpass-api.de/api/interpreter",
        "https://maps.mail.ru/osm/tools/overpass/api/interpreter"
    ]

    # 1. First attempt: Geocode location to bounding box
    bbox = geocode_location(location)
    queries = []
    if bbox:
        s, n, w, e = bbox
        queries.append(f"""
        [out:json][timeout:20];
        (
          node{tag_filter}({s},{w},{n},{e})["website"];
          way{tag_filter}({s},{w},{n},{e})["website"];
          relation{tag_filter}({s},{w},{n},{e})["website"];
          node{tag_filter}({s},{w},{n},{e})["contact:website"];
          way{tag_filter}({s},{w},{n},{e})["contact:website"];
        );
        out center {max_results * 2};
        """)
        # If specific niche tag filter is narrow, prepare fallback to broad office/craft
        if tag_filter != '["office"]':
            queries.append(f"""
            [out:json][timeout:20];
            (
              node["office"]({s},{w},{n},{e})["website"];
              way["office"]({s},{w},{n},{e})["website"];
            );
            out center {max_results * 2};
            """)

    # Fallback to area name search
    clean_city = location.split(",")[0].strip()
    queries.append(f"""
    [out:json][timeout:20];
    area["name"~"^{clean_city}$",i]->.searchArea;
    (
      nwr{tag_filter}(area.searchArea)["website"];
      nwr{tag_filter}(area.searchArea)["contact:website"];
    );
    out center {max_results};
    """)

    for q in queries:
        if len(candidates) >= max_results:
            break
        for api_url in overpass_urls:
            try:
                resp = requests.post(api_url, data={"data": q}, headers=headers, timeout=18)
                if resp.status_code == 200:
                    data = resp.json()
                    elements = data.get("elements", [])
                    for el in elements:
                        tags = el.get("tags", {})
                        name = tags.get("name") or tags.get("brand") or tags.get("operator")
                        website = tags.get("contact:website") or tags.get("website")
                        phone = tags.get("contact:phone") or tags.get("phone", "")

                        if not name or not website:
                            continue

                        domain = clean_domain(website)
                        if not is_valid_target_domain(domain) or domain in seen_domains:
                            continue

                        seen_domains.add(domain)
                        candidates.append({
                            "company_name": name.strip(),
                            "website": f"https://{domain}",
                            "domain": domain,
                            "phone": phone.strip(),
                            "source": "osm_directory"
                        })

                        if len(candidates) >= max_results:
                            break
                    if candidates:
                        break
            except Exception:
                continue

    return candidates

def discover_businesses(niche: str, location: str, target_count: int = 50) -> List[Dict[str, str]]:
    """
    Orchestrates business discovery combining targeted search queries and open directory data.
    """
    discovered: List[Dict[str, str]] = []
    seen_domains: Set[str] = set()

    def add_candidate(item):
        dom = item.get("domain")
        if dom and dom not in seen_domains:
            seen_domains.add(dom)
            discovered.append(item)

    # 1. First attempt OpenStreetMap structured search for local physical businesses
    osm_leads = search_overpass(niche, location, max_results=target_count)
    for lead in osm_leads:
        add_candidate(lead)

    # 2. If we need more leads or for niche/service businesses, use web search queries
    if len(discovered) < target_count:
        queries = [
            f'"{niche}" "{location}" contact email',
            f'"{niche}" in "{location}" "about us"',
            f'best "{niche}" firms "{location}"'
        ]
        for q in queries:
            if len(discovered) >= target_count:
                break
            web_leads = search_duckduckgo(q, max_results=target_count - len(discovered))
            for lead in web_leads:
                add_candidate(lead)

    return discovered[:target_count]
