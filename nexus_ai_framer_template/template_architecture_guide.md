# Nexus AI: Framer Template Architecture & Construction Guide

> This guide provides step-by-step instructions for assembling the **Nexus AI** template inside Framer, configuring CMS collections, adding custom code components, and tuning breakpoints for flawless desktop, tablet, and mobile responsiveness.

---

## 1. Global Setup in Framer

### Step 1: Global Color Styles
In Framer's **Assets Panel** (left sidebar), create the following global color tokens so your customers can re-theme the template with one click:

| Style Name | Value | Purpose |
| :--- | :--- | :--- |
| `Background / Primary` | `#08080A` | Canvas background |
| `Background / Secondary` | `#0E0E12` | Alternate section fills & card backgrounds |
| `Brand / Primary` | `#00F0FF` | Electric cyan accents, active links, primary CTA |
| `Brand / Secondary` | `#8B5CF6` | Neon purple gradient stops, badges |
| `Border / Subtle` | `rgba(255, 255, 255, 0.08)` | Glass card outlines |
| `Border / Hover` | `rgba(255, 255, 255, 0.22)` | Interactive card hover states |
| `Text / Primary` | `#F9FAFB` | Headings and high-contrast titles |
| `Text / Secondary` | `#9CA3AF` | Subheadlines and feature descriptions |
| `Text / Muted` | `#6B7280` | Footers, timestamps, and subtle hints |

### Step 2: Global Text Styles
Create centralized Text Styles in the **Assets Panel**:
* `Display Hero`: Font: *Plus Jakarta Sans* (or Inter), Bold (700), Size: 64px, Line Height: 1.1, Letter Spacing: -0.03em.
* `Heading 1`: Size: 44px, Bold (700), Line Height: 1.2, Letter Spacing: -0.02em.
* `Heading 2`: Size: 32px, SemiBold (600), Line Height: 1.25.
* `Heading 3`: Size: 22px, SemiBold (600), Line Height: 1.3.
* `Body Regular`: Font: *Inter*, Regular (400), Size: 16px, Line Height: 1.6.
* `Body Small`: Regular (400), Size: 14px, Line Height: 1.5.
* `Code / Monospace`: Font: *JetBrains Mono*, Size: 13px, Line Height: 1.6.

---

## 2. Breakpoint Architecture (Zero Overflow Rule)

Configure three primary breakpoints for all pages:
1. **Desktop:** `1280px` (Primary canvas width, fixed content width `1200px` centered via Stack `auto` margins).
2. **Tablet:** `810px` (Stack layouts convert 3-column bento grids into 2-column grids).
3. **Mobile:** `390px` (Stack layouts convert all grids to 1-column; navbar collapses into an animated mobile drawer).

> [!IMPORTANT]
> **Framer Reviewer Rule:** Never use fixed pixel widths on container stacks. Always set container widths to `100%` or `Fill`, with a `Max Width: 1200px`. This prevents horizontal scrollbars and ensures immediate marketplace approval.

---

## 3. Page-by-Page Construction Specs

### Page 1: Home (`/`)
* **Frame Stack 1: Top Announcement Bar**
  * Height: 40px, Background: `#0E0E12`, Border Bottom: `Border / Subtle`.
  * Pill Badge: `NEW: v2.4` with cyan border and subtle glow.
* **Frame Stack 2: Sticky Glass Navbar**
  * Position: `Sticky`, Top: `0px`, Z-Index: `100`.
  * Background: `rgba(8, 8, 10, 0.75)`, Backdrop Filter: `Blur 16px`.
  * Left: Logo + "Nexus AI" text (SVG icon included).
  * Center: Navigation links with subtle hover underline.
  * Right: "Sign In" link + "Start Free Trial" CTA button.
* **Frame Stack 3: Hero Section**
  * Top Padding: 100px, Bottom Padding: 80px.
  * Background: Radial gradient glow centered behind the headline.
  * Content: Pre-headline pill, H1 headline, sub-headline, dual CTAs, security badges.
  * **Interactive Mockup:** A styled glass dashboard card displaying live mock latency metrics and request streams with animated pulse badges.
* **Frame Stack 4: Logo Marquee**
  * Use Framer's native `Ticker` component. Speed: 40, Direction: Left.
  * Logos: Vercel, Supabase, Stripe, Linear, Modal, Resend, Railway, PostHog (monochrome white with 40% opacity).
* **Frame Stack 5: Bento Grid (Core Features)**
  * Layout: CSS Grid / Nested Stacks.
  * Desktop: 3 columns. Tablet: 2 columns. Mobile: 1 column.
  * Card Styling: `Background: rgba(255, 255, 255, 0.03)`, `Border: 1px solid rgba(255, 255, 255, 0.08)`, `Border Radius: 16px`.
  * Hover Effect: Transform scale `1.01`, Border color shifts to `Border / Hover`.
* **Frame Stack 6: Code Integration Showcase**
  * Drop in the custom React component: `<CodeSnippetTabs />`.
* **Frame Stack 7: Interactive Savings Calculator**
  * Drop in the custom React component: `<InteractivePricingCalculator />`.
* **Frame Stack 8: Testimonial Marquee**
  * Two stacked `Ticker` rows moving in opposite directions with customer cards.
* **Frame Stack 9: Pricing Preview Matrix**
  * 3 Tier cards (Developer, Pro, Enterprise). Highlight Pro with a glowing border.
* **Frame Stack 10: Technical FAQ**
  * Accordion component (Framer interactive component variant).
* **Frame Stack 11: High-Impact Bottom CTA Banner**
  * Background: Glowing linear gradient card with dual action buttons.
* **Frame Stack 12: Global Footer**
  * 4-column layout with newsletter subscription input and copyright note.

---

### Page 2: Pricing (`/pricing`)
* Hero: "Simple, Predictable Infrastructure Pricing"
* Annual / Monthly toggle with dynamic pricing recalculation.
* In-depth feature comparison table (35+ rows comparing Caching, Guardrails, SLAs, Logs, and Support).
* Dedicated Enterprise Contact Callout box.

---

### Page 3: Blog / Engineering Insights (`/blog`)
* CMS-driven page displaying technical writeups.
* Search bar component + Category Filter pills (e.g., `Architecture`, `Latency`, `Benchmarks`, `Case Studies`).
* Featured Article Hero Card + 2-column grid of recent posts.

---

### Page 4: Changelog (`/changelog`)
* CMS-driven chronological timeline.
* Left column: Release date + Version tag (e.g., `v2.4.0` pill with emerald dot).
* Right column: Release title, featured image, bulleted feature list, and bug fixes.

---

### Page 5: Contact & Book a Demo (`/contact`)
* Two-column split layout:
  * Left: Value propositions, enterprise logos, direct engineering contact info.
  * Right: Clean glass form (Name, Work Email, Monthly Request Volume dropdown, Message, Submit Button).

---

### Page 6: 404 Error Page (`/404`)
* Sleek dark mode canvas with animated glowing "404" display text.
* Helpful quick-links: "Back to Home", "View Documentation", "Check System Status".

---

## 4. CMS Schema Configurations

### Collection 1: `Blog Posts`
In Framer, click **CMS** ➔ **Add Collection** ➔ Name: `Blog`.
Add the following fields:
1. `Title` (Formatted Text / Plain Text)
2. `Slug` (Slug, auto-generated)
3. `Excerpt` (Plain Text, max 160 characters for SEO)
4. `Content` (Formatted Text with code block and image support)
5. `Category` (Option: `Engineering`, `Case Studies`, `Announcements`)
6. `Cover Image` (Image)
7. `Author Name` (Plain Text)
8. `Author Avatar` (Image)
9. `Date Published` (Date)
10. `Reading Time` (Plain Text, e.g., `4 min read`)

### Collection 2: `Changelog`
In Framer, click **CMS** ➔ **Add Collection** ➔ Name: `Changelog`.
Add the following fields:
1. `Version` (Plain Text, e.g., `v2.4.1`)
2. `Title` (Plain Text)
3. `Release Date` (Date)
4. `Badge Status` (Option: `Major`, `Improvement`, `Fix`)
5. `Overview` (Formatted Text)
6. `Cover Image / Diagram` (Image, optional)

---

## 5. Integrating the Custom React Components

1. In your Framer Project, navigate to the **Assets** tab on the left.
2. Under **Code**, click the **+ (New Component)** icon.
3. Name the first file `InteractivePricingCalculator.tsx`.
4. Replace its contents entirely with the code from `components/InteractivePricingCalculator.tsx`.
5. Repeat for `CodeSnippetTabs.tsx` from `components/CodeSnippetTabs.tsx`.
6. Drag and drop both components directly onto your canvas like any native Framer frame.
7. Use the right sidebar property controls to adjust accent colors or values if desired.
