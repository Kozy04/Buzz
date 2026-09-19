#!/usr/bin/env python3
"""
Buzz Lead Scraper — Optional Companion Power Tool
Discovers local businesses, crawls their websites, extracts decision-maker emails, and exports Buzz-compatible CSVs.

Usage:
  # Interactive mode (prompts for niche and city)
  python scrape_leads.py

  # Direct CLI command
  python scrape_leads.py --niche "Bookkeeping" --location "Austin, TX" --limit 30 --output austin_leads.csv
"""

import sys
import os
import argparse
from typing import List, Dict

# Ensure UTF-8 output on Windows consoles
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# Import scraper submodules
from scraper.discovery import discover_businesses
from scraper.crawler import crawl_batch_businesses
from scraper.enricher import enrich_business_record
from scraper.exporter import export_leads_to_csv

try:
    from rich.console import Console
    from rich.panel import Panel
    from rich.table import Table
    from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn, TimeElapsedColumn
    HAS_RICH = True
    console = Console(legacy_windows=False)
except ImportError:
    HAS_RICH = False
    console = None

def print_banner():
    banner_text = (
        "[bold cyan]⚡ Buzz Lead Scraper Engine[/bold cyan] [dim](Optional Companion Tool)[/dim]\n"
        "[white]Extract verified B2B decision-makers, direct emails, and websites without paid API keys.[/white]\n"
        "[dim]Outputs ready-to-import CSVs for Buzz PWA's Universal CSV Importer.[/dim]"
    )
    if HAS_RICH:
        console.print(Panel(banner_text, border_style="cyan", padding=(1, 2)))
    else:
        print("=" * 60)
        print("⚡ Buzz Lead Scraper Engine (Optional Companion Tool)")
        print("Extract verified B2B decision-makers, direct emails, and websites.")
        print("=" * 60)

def prompt_interactive() -> Dict[str, any]:
    """Interactive questionnaire for terminal users."""
    print_banner()
    if HAS_RICH:
        console.print("\n[bold yellow]📋 Setup Scraping Parameters:[/bold yellow]\n")

    default_niche = "Bookkeeping & Accounting"
    default_loc = "Austin, TX"
    default_limit = 25
    default_out = "scraped_leads.csv"

    niche_input = input(f"1. Target Niche / Industry [{default_niche}]: ").strip()
    niche = niche_input if niche_input else default_niche

    loc_input = input(f"2. Target City & State / Metro [{default_loc}]: ").strip()
    location = loc_input if loc_input else default_loc

    limit_input = input(f"3. Max Leads to Scrape [{default_limit}]: ").strip()
    try:
        limit = int(limit_input) if limit_input else default_limit
    except ValueError:
        limit = default_limit

    out_input = input(f"4. Output CSV Filename [{default_out}]: ").strip()
    output_file = out_input if out_input else default_out
    if not output_file.endswith(".csv"):
        output_file += ".csv"

    return {
        "niche": niche,
        "location": location,
        "limit": limit,
        "output": output_file,
        "workers": 8
    }

def run_scraper(niche: str, location: str, limit: int, output: str = "scraped_leads.csv", workers: int = 8):
    if HAS_RICH:
        console.print(f"\n[cyan]🔍 Step 1/3: Discovering businesses for [bold]{niche}[/bold] in [bold]{location}[/bold]...[/cyan]")
    else:
        print(f"\n🔍 Step 1/3: Discovering businesses for {niche} in {location}...")

    # 1. Discover Businesses
    discovered = discover_businesses(niche=niche, location=location, target_count=limit * 2)
    if not discovered:
        if HAS_RICH:
            console.print("[bold red]❌ No businesses found for this location/niche. Try broader terms.[/bold red]")
        else:
            print("❌ No businesses found for this location/niche.")
        return

    if HAS_RICH:
        console.print(f"[green]✓ Found {len(discovered)} candidate domains.[/green]")
        console.print(f"[cyan]🌐 Step 2/3: Crawling websites & extracting direct emails (workers={workers})...[/cyan]")
    else:
        print(f"✓ Found {len(discovered)} candidate domains.")
        print(f"🌐 Step 2/3: Crawling websites & extracting direct emails...")

    # 2. Crawl Websites Concurrently
    crawled_results = crawl_batch_businesses(discovered, max_workers=workers)

    # 3. Enrich with Decision-Maker Titles and Hooks
    if HAS_RICH:
        console.print(f"[cyan]🎯 Step 3/3: Detecting executive titles & synthesizing hooks...[/cyan]")
    else:
        print(f"🎯 Step 3/3: Detecting executive titles & synthesizing hooks...")

    enriched_leads = []
    for biz in crawled_results:
        # Only keep businesses where an email was successfully extracted
        if biz.get("email"):
            lead = enrich_business_record(biz, target_niche=niche, target_location=location)
            enriched_leads.append(lead)

    # 4. Export to CSV
    written = export_leads_to_csv(enriched_leads, output)

    # 5. Report Results
    if HAS_RICH:
        table = Table(title=f"📊 Scraped Leads Preview (Top 5 of {written})", border_style="cyan")
        table.add_column("Company", style="bold white")
        table.add_column("Decision Maker", style="yellow")
        table.add_column("Title", style="green")
        table.add_column("Email", style="cyan")
        table.add_column("Location", style="dim")

        for lead in enriched_leads[:5]:
            table.add_row(
                lead.get("company", ""),
                f"{lead.get('firstName', '')} {lead.get('lastName', '')}".strip(),
                lead.get("title", "Owner"),
                lead.get("email", ""),
                lead.get("location", "")
            )

        console.print("\n", table)
        success_panel = (
            f"[bold green]✓ Successfully scraped and saved {written} verified leads![/bold green]\n\n"
            f"[white]📁 CSV File: [/white][bold cyan]{os.path.abspath(output)}[/bold cyan]\n"
            f"[white]📥 How to Ingest:[/white]\n"
            f"1. Open Buzz PWA in your browser.\n"
            f"2. Click [bold cyan]'📥 Import CSV'[/bold cyan] in the action bar.\n"
            f"3. Drag & drop [bold]{output}[/bold] into the importer!\n"
            f"4. Click [bold]'Ingest Leads into Pipeline'[/bold] — and start sending!"
        )
        console.print(Panel(success_panel, border_style="green", padding=(1, 2)))
    else:
        print("\n" + "=" * 60)
        print(f"✓ Successfully scraped and saved {written} verified leads to {output}!")
        print(f"To ingest: Open Buzz PWA -> Click 'Import CSV' -> Drop {output}")
        print("=" * 60)

def main():
    parser = argparse.ArgumentParser(
        description="Buzz Lead Scraper — Optional Companion Power Tool for Bulk B2B Lead Extraction"
    )
    parser.add_argument("--niche", type=str, help="Target niche / industry (e.g. 'Bookkeeping', 'Web Design')")
    parser.add_argument("--location", type=str, help="Target city and state (e.g. 'Austin, TX', 'Miami, FL')")
    parser.add_argument("--limit", type=int, default=25, help="Target number of leads to scrape (default: 25)")
    parser.add_argument("--output", type=str, default="scraped_leads.csv", help="Output CSV filepath (default: scraped_leads.csv)")
    parser.add_argument("--workers", type=int, default=8, help="Concurrent crawler threads (default: 8)")

    args = parser.parse_args()

    # If neither niche nor location was provided via CLI, launch interactive mode
    if not args.niche or not args.location:
        params = prompt_interactive()
    else:
        print_banner()
        params = {
            "niche": args.niche,
            "location": args.location,
            "limit": args.limit,
            "output": args.output,
            "workers": args.workers
        }

    run_scraper(**params)

if __name__ == "__main__":
    main()
