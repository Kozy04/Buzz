"""
Exporter Engine:
Writes enriched prospect leads directly to an RFC-4180 CSV file matching Buzz PWA headers.
"""

import csv
from typing import List, Dict

BUZZ_CSV_COLUMNS = [
    "Company",
    "First Name",
    "Last Name",
    "Title",
    "Email",
    "Location",
    "Website",
    "Phone",
    "Hook"
]

def export_leads_to_csv(leads: List[Dict[str, str]], output_filepath: str) -> int:
    """
    Exports a list of lead dictionaries into a Buzz-compatible CSV.
    Returns the total number of leads written.
    """
    written_count = 0
    with open(output_filepath, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=BUZZ_CSV_COLUMNS, quoting=csv.QUOTE_MINIMAL)
        writer.writeheader()

        for lead in leads:
            # Skip records without a valid email address
            email = lead.get("email", "").strip()
            if not email or "@" not in email:
                continue

            row = {
                "Company": lead.get("company", "").strip(),
                "First Name": lead.get("firstName", "there").strip(),
                "Last Name": lead.get("lastName", "").strip(),
                "Title": lead.get("title", "Owner").strip(),
                "Email": email.lower(),
                "Location": lead.get("location", "USA").strip(),
                "Website": lead.get("website", "").strip(),
                "Phone": lead.get("phone", "").strip(),
                "Hook": lead.get("personalHook", "").strip()
            }
            writer.writerow(row)
            written_count += 1

    return written_count
