# CoffeePass — Product Requirements Document & Technical Specification

**Version:** 1.0
**Date:** March 15, 2026
**Status:** Implementation-Ready Draft
**Classification:** Confidential — Internal Use Only

---

## Table of Contents

1. [Executive Product Overview](#1-executive-product-overview)
2. [User Personas](#2-user-personas)
3. [Two-Sided Marketplace Logic](#3-two-sided-marketplace-logic)
4. [Onboarding Flows](#4-onboarding-flows)
5. [Maps & Discovery Experience](#5-maps--discovery-experience)
6. [Full Screen Inventory](#6-full-screen-inventory)
7. [Navigation Structure](#7-navigation-structure)
8. [Monetary & Transaction Logic](#8-monetary--transaction-logic)
9. [Roles & Permissions](#9-roles--permissions)
10. [Data Model](#10-data-model)
11. [Tech Stack](#11-tech-stack)
12. [Project File Structure](#12-project-file-structure)
13. [Build Plan](#13-build-plan)
14. [Testing Strategy](#14-testing-strategy)
15. [Analytics](#15-analytics)
16. [Risks & Assumptions](#16-risks--assumptions)
17. [Implementation Readiness Check](#17-implementation-readiness-check)

---

## 1. Executive Product Overview

### 1.1 Product Vision

CoffeePass brings the convenience and loyalty economics of the Starbucks app to every independent cafe in a city. It is a two-sided mobile marketplace where consumers buy credits at a discount and spend them at any partner cafe, while cafes gain a zero-upfront digital storefront, a stream of pre-committed customers, and automatic weekly payouts.

The platform is pickup-first, credit-based, and indie-focused. It does not compete with delivery apps. It does not require POS integration. It earns on every transaction by structural design and cannot go negative.

### 1.2 Consumer Value Proposition

| Value Driver | What It Means |
|---|---|
| **Savings** | 10–25% discount on every drink via credit bundles |
| **Discovery** | Map-based feed of nearby independent cafes with menus, hours, and photos |
| **Convenience** | Pre-loaded credits eliminate payment friction — redeem, show code, pick up |
| **Flexibility** | Credits work across every cafe on the network, not just one shop |
| **No commitment** | Credits are valid for 12 months; no subscription required |

### 1.3 Cafe Value Proposition

| Value Driver | What It Means |
|---|---|
| **Customer acquisition** | Appear in the discovery feed of every nearby CoffeePass user |
| **Pre-committed spend** | Customers arrive with credits already loaded — guaranteed demand |
| **Zero upfront cost** | No setup fee, no monthly fee; pay only a percentage of fulfilled orders |
| **Weekly payouts** | Automatic direct deposit every Monday via Stripe Connect |
| **Simple setup** | Menu live in under 10 minutes; no POS integration needed |

### 1.4 Business Model Summary

CoffeePass operates on a **credit spread model**:

1. Consumer pays **$1.00 per credit** (at base rate; discounted at higher bundles).
2. Cafe receives **$0.80 per credit redeemed** (at the standard 20% platform fee).
3. CoffeePass retains **$0.20 per credit redeemed** as gross revenue.
4. Unredeemed credits that expire after 12 months are recognized as **100% revenue**.

**Founding cafes** receive a promotional **12% platform fee** (cafe receives $0.88/credit) for the first 6 months.

The system is structurally profitable: CoffeePass collects payment before issuing credits, and pays cafes less than what was collected. No scenario produces a negative margin.

### 1.5 Marketplace Dynamics

**Supply side (Cafes):** Founder-led onboarding of 15–20 quality independent cafes before the first consumer is acquired. Each cafe is visited in person, onboarded with a 3-step wizard, and given a printed one-pager. Post-launch, cafes self-serve through the onboarding flow.

**Demand side (Consumers):** Organic acquisition via Instagram, TikTok, neighborhood Facebook groups, and physical flyers at partner cafes. Referral program post-MVP: "Give a friend $2 in credits, get $2 yourself."

**Network effects:** More cafes → more reasons for consumers to buy credits → more consumers → more order volume per cafe → more cafes want to join. Credits that work across cafes create a single-network lock-in that no individual cafe loyalty card can replicate.

### 1.6 Launch Goals

| Metric | Month 1 Target |
|---|---|
| Partner cafes live | 15 |
| Registered consumers | 200 |
| Weekly active orders | 300 |
| Credit bundles sold (GMV) | $6,000 |
| CoffeePass net revenue | $1,200 |
| Order acceptance rate | 95%+ |

### 1.7 What Success Looks Like

**North Star Metric: Weekly Active Orders.** If people are placing orders every week, the marketplace has product-market fit. Everything else — revenue, retention, cafe supply — follows from this single signal.

**Month 6 targets:** 50 cafes, 2,000 weekly active customers, 5,000 weekly orders, $24,000/month net revenue, 50% 30-day retention.

---

## 2. User Personas

### 2.1 Consumer — "Alex, the Daily Drinker"

| Dimension | Detail |
|---|---|
| **Demographics** | 24–38, young professional, urban, smartphone-native |
| **Goals** | Save money on daily coffee; discover new cafes worth trying; skip payment friction |
| **Motivations** | Tangible savings on a daily habit; variety beyond the same two shops; the feeling of being a "local coffee insider" |
| **Pain points** | No financial incentive to try new shops; indie cafes have no unified mobile experience; loyalty cards are per-shop and easy to lose |
| **Expected behaviors** | Buys a credit bundle after seeing the savings math; orders 3–5 times/week; tries a new cafe when credits are sitting idle; upgrades to larger bundles over time |

### 2.2 Cafe Owner — "Maria, the Independent Operator"

| Dimension | Detail |
|---|---|
| **Demographics** | 30–55, owns 1–3 cafe locations, limited marketing budget, not deeply technical |
| **Goals** | Get more customers through the door without spending on ads; receive reliable weekly revenue; keep operations simple |
| **Motivations** | Compete with chains on discoverability; pre-sold revenue smooths cash flow; a digital menu she controls without paying $70+/month for POS software |
| **Pain points** | Google and Yelp favor chains; marketing costs $500+/month with unclear ROI; no way to pre-sell coffee; existing POS loyalty is per-store only |
| **Expected behaviors** | Signs up after an in-person pitch or referral from another cafe owner; sets up menu in one session; checks the dashboard daily for incoming orders; downloads the CSV report at month-end for her bookkeeper |

### 2.3 Barista / Cafe Staff — "Jordan, the Counter Lead"

| Dimension | Detail |
|---|---|
| **Demographics** | 18–30, part-time or full-time barista, uses the cafe-side app on a shared tablet or phone |
| **Goals** | Fulfill orders quickly without disrupting the counter flow; validate redemption codes without confusion |
| **Motivations** | Anything that makes the shift smoother; clear instructions; minimal training required |
| **Pain points** | Another app to learn; ambiguity about whether an order is valid; slow or unreliable scanning |
| **Expected behaviors** | Opens the Redeem screen when a customer presents a code; scans QR or types the 4-digit backup code; sees a clear green confirmation or red rejection; moves on to the next customer |

### 2.4 Platform Admin — "Dev, the Operations Lead"

| Dimension | Detail |
|---|---|
| **Demographics** | Internal CoffeePass team member; technical or semi-technical |
| **Goals** | Monitor marketplace health; resolve disputes; ensure ledger integrity; manage cafe onboarding and payouts |
| **Motivations** | Keep the system running cleanly; catch discrepancies before they become problems; support cafes and consumers efficiently |
| **Pain points** | Manual reconciliation at scale; unclear escalation paths; chargebacks and refund edge cases |
| **Expected behaviors** | Reviews the nightly reconciliation report; investigates flagged ledger mismatches; approves or escalates disputed orders; monitors cafe activation rates and consumer retention |

---

## 3. Two-Sided Marketplace Logic

### 3.1 How Cafes Join

**MVP (Pre-launch):** Founder-led, in-person outreach. Visit the cafe, deliver the 90-second pitch, leave a printed one-pager. Follow up within 48 hours. Onboard the cafe owner through the app's 3-step wizard (account → business info → menu).

**Post-launch:** Self-serve signup via the partner landing page or App Store listing. Cafe owner downloads the app, selects "I'm a cafe owner," and completes the onboarding wizard. CoffeePass reviews and approves the cafe within 24 hours (manual review in MVP; automated later).

**Cafe activation criteria:**
- Profile complete (name, address, photo, hours)
- At least 3 menu items published
- Stripe Connect account connected
- Terms of service accepted

### 3.2 How Consumers Discover Cafes

1. **Map view** — Full-screen map centered on the user's location with custom pins for each partner cafe. Pins show cafe name on tap.
2. **List view** — Scrollable feed sorted by distance, showing cafe photo, name, distance, open/closed status, and a 1-line menu preview.
3. **Search** — Text search by cafe name or drink name (e.g., "matcha" returns all cafes with a matcha menu item).
4. **Filters** — Open Now, Distance (0.5 / 1 / 3 / 5 mi), Price Range ($ / $$ / $$$).
5. **Cafe detail screen** — Full menu, hours, location on map, photo, description.

### 3.3 How Credits Work

**Purchase:**
1. Consumer navigates to the Wallet tab.
2. Selects a credit bundle (Starter through Super Pro).
3. Pays via Stripe (credit/debit card, Apple Pay, Google Pay).
4. Stripe webhook fires → `processCreditPurchase` Cloud Function validates payment → credits are atomically added to the user's `creditBalance` and a `CreditLedgerEntry` of type `PURCHASE` is written.

**Spending:**
1. Consumer browses a cafe's menu and taps "Redeem" on an item.
2. App calls `placeOrder` Cloud Function, which:
   - Verifies the user has sufficient credits.
   - Atomically deducts credits from `creditBalance` and writes a `CreditLedgerEntry` of type `REDEMPTION`.
   - Creates an `Order` document with status `CREATED`.
   - Generates a `RedemptionToken` (QR code payload + 4-digit backup code).
   - Transitions order to `READY_FOR_REDEMPTION`.
3. App displays the QR code and 4-digit code to the consumer.

**Redemption at counter:**
1. Consumer shows QR code (or reads 4-digit code aloud).
2. Barista scans QR or enters code on the cafe app's Redeem screen.
3. Backend validates: order exists, correct cafe, not already redeemed, not expired.
4. On success: order transitions to `REDEEMED`, transaction is logged, barista sees green confirmation.
5. On failure: barista sees red error with reason (expired, already used, wrong cafe).

### 3.4 Order Lifecycle

```
CREATED ──► READY_FOR_REDEMPTION ──► REDEEMED
                    │
                    ├──► EXPIRED (auto, after 15 minutes)
                    │
                    └──► CANCELLED (user-initiated before redemption)
```

**State transition rules:**

| From | To | Trigger | Side Effect |
|---|---|---|---|
| CREATED | READY_FOR_REDEMPTION | Order placement succeeds | QR + 4-digit code generated; 15-min timer starts |
| READY_FOR_REDEMPTION | REDEEMED | Barista validates token | Transaction logged; payout obligation created |
| READY_FOR_REDEMPTION | EXPIRED | 15-minute TTL elapses | Credits auto-returned to consumer; ledger entry written |
| READY_FOR_REDEMPTION | CANCELLED | Consumer cancels | Credits auto-returned to consumer; ledger entry written |
| CREATED | CANCELLED | System error during placement | Credits never deducted (atomic failure) |

### 3.5 How Cafes Get Paid

1. Every redeemed order creates a `payoutObligation` tied to the cafe.
2. Every Monday at 6:00 AM UTC, the `weeklyPayouts` Cloud Function runs:
   - Aggregates all `REDEEMED` orders for each cafe from the prior Monday–Sunday.
   - Calculates total credits redeemed × payout rate ($0.80/credit standard, $0.88/credit founder).
   - Initiates a Stripe Transfer to the cafe's connected Stripe account.
   - Creates a `Payout` document with status `PROCESSING`.
3. Stripe webhook confirms transfer → `Payout` status updated to `COMPLETED`.
4. Cafe owner sees payout in their Reports tab and can download a CSV.

### 3.6 How CoffeePass Earns Revenue

| Revenue Source | Mechanism | Example |
|---|---|---|
| **Platform fee on redemptions** | 20% of each credit redeemed (12% for founder cafes) | 6-credit latte → CoffeePass keeps $1.20 |
| **Credit breakage** | Unredeemed credits after 12 months are 100% revenue | Customer buys $20 bundle, spends $15, $5 expires → $5 revenue |
| **Stripe processing spread** | Stripe fee paid on purchase, not on payout (minor margin) | 2.9% + $0.30 absorbed once at purchase |

### 3.7 Network Effects

```
More Cafes on Platform
        ↓
More variety → stronger reason to buy credits
        ↓
More Consumers buying credits
        ↓
More order volume per cafe → higher weekly payouts
        ↓
More Cafes want to join (word of mouth, proof of revenue)
        ↓
(cycle repeats)
```

**Cross-cafe credit portability** is the key defensibility mechanism. A consumer's credits work everywhere on the network. No single cafe can replicate this. The more cafes participate, the more valuable the credits become, and the harder it is for any cafe to leave without losing access to pre-committed consumer spend.

---

## 4. Onboarding Flows

### 4.1 Consumer Onboarding

**Goal:** Account created and first cafe discovered in under 90 seconds.

#### Step 1 — Welcome Screen
- CoffeePass logo + tagline: "Discover local cafes. Save on every drink."
- Two CTAs: "Sign Up" (primary) / "Log In" (secondary)
- Social proof line: "Join 200+ coffee lovers in [City]" (dynamic once live)

#### Step 2 — Account Creation
| Field | Type | Required | Validation |
|---|---|---|---|
| Full name | Text | Yes | Min 2 characters |
| Email | Email | Yes | Valid email format; unique |
| Password | Password | Yes | Min 8 characters |
| — OR — | | | |
| Continue with Google | OAuth | — | Firebase Auth Google provider |
| Continue with Apple | OAuth | — | Firebase Auth Apple provider |

**Error states:**
- Email already registered → "This email is already in use. Log in instead?" with link.
- Weak password → Inline validation: "Password must be at least 8 characters."
- Network error → "Something went wrong. Please try again." with retry button.

**Success:** Account created → Firebase Auth user → Firestore `users` document initialized with role `consumer`.

#### Step 3 — Location Permission
- System prompt: "CoffeePass uses your location to find cafes near you."
- If granted → map centers on user location; proceed to discovery.
- If denied → show city selection picker (manual fallback). Text: "No worries — pick your city and we'll show you what's nearby."
- **Drop-off mitigation:** Explain value before the system prompt appears. Show a screen with a map illustration and text: "We need your location to show nearby cafes. We never share it."

#### Step 4 — Discovery (Home Screen)
- User lands on the Discover tab with nearby cafes loaded.
- Optional: a dismissible banner at the top — "Get 5 credits for $4.99 and try your first cafe" linking to the Wallet.
- Onboarding complete. No forced credit purchase. No forced tutorial.

**Drop-off risks and mitigations:**

| Risk | Mitigation |
|---|---|
| Signup form too long | Only 3 fields; social login reduces to 1 tap |
| Location permission denied | Manual city fallback; app still functional |
| No cafes nearby | "We're coming to your area soon. Join the waitlist." with email capture |
| No reason to stay without credits | Browsing is free; savings banner encourages first purchase |

---

### 4.2 Cafe Onboarding

**Goal:** Cafe profile live and menu published in under 10 minutes.

#### Step 1 — Account Creation
| Field | Type | Required | Validation |
|---|---|---|---|
| Owner full name | Text | Yes | Min 2 characters |
| Email | Email | Yes | Valid format; unique |
| Password | Password | Yes | Min 8 characters |
| Role selection | Toggle | Yes | "I'm a cafe owner" (sets role to `cafe_owner`) |

**Success:** Firebase Auth user created → Firestore `users` document with role `cafe_owner` → routed to cafe onboarding wizard.

#### Step 2 — Business Profile
| Field | Type | Required | Validation |
|---|---|---|---|
| Cafe name | Text | Yes | Min 2 characters |
| Address | Address autocomplete | Yes | Google Places or Apple Maps lookup; must resolve to lat/lng |
| Phone number | Phone | Yes | Valid format |
| Cafe photo | Image upload | Yes | Min 400×300px; max 5MB; JPEG/PNG |
| Description | Textarea | No | Max 280 characters |
| Hours of operation | Day/time picker | Yes | At least 1 day with open/close times |

**Address resolution:** The address field uses autocomplete and geocodes to latitude/longitude on selection. This lat/lng is stored on the `CafeLocation` document and used for map pin placement and distance calculations.

**Error states:**
- Address doesn't resolve → "We couldn't verify this address. Please select from the suggestions."
- Photo upload fails → "Upload failed. Please try a smaller image or check your connection."

#### Step 3 — Menu Setup
- Cafe owner adds at least 3 menu items to go live.
- Each menu item requires:

| Field | Type | Required | Validation |
|---|---|---|---|
| Item name | Text | Yes | Min 2 characters; max 60 characters |
| Credit price | Integer | Yes | Min 1 credit; max 99 credits |
| Category | Picker | Yes | Coffee, Tea, Espresso Drinks, Cold Drinks, Pastries, Other |
| Description | Text | No | Max 140 characters |
| Photo | Image upload | No | Max 5MB; JPEG/PNG |

- A guidance note is displayed: "Set your credit price close to your cash price. 1 credit ≈ $1. A $5 latte = 5 credits."
- Progress indicator: "3 items minimum to go live. You have X so far."

#### Step 4 — Payout Setup (Stripe Connect)
- CTA: "Connect your bank account to receive weekly payouts."
- Opens Stripe Connect onboarding (Stripe-hosted flow via OAuth).
- On success: `stripeConnectAccountId` saved to the cafe document; status set to `PAYOUT_READY`.
- On skip: cafe can complete this later, but a persistent banner appears: "Connect your bank to start receiving payouts."
- **Assumption:** Stripe Connect Express accounts are used for simplicity. Cafes provide basic identity + bank details through Stripe's hosted onboarding.

#### Step 5 — Review & Go Live
- Summary screen showing: cafe name, photo, address, hours, menu item count, payout status.
- CTA: "Go Live" (enabled only if Steps 2–3 are complete and Step 4 is at least initiated).
- On submit: cafe status set to `PENDING_REVIEW`.
- CoffeePass admin reviews and approves within 24 hours (MVP: manual review via Firebase console or admin dashboard).
- On approval: cafe status → `ACTIVE`; cafe appears in consumer discovery.

**Drop-off risks and mitigations:**

| Risk | Mitigation |
|---|---|
| Menu setup is tedious | Minimum 3 items keeps it fast; items can be added later |
| Stripe Connect feels invasive | Explain: "Stripe handles all payments securely. We never see your bank details." |
| Owner abandons mid-wizard | Progress is auto-saved; "Continue setup" prompt on next app open |
| Owner doesn't understand credit pricing | Inline guidance: "1 credit ≈ $1. Price your items like you would in cash." |

---

## 5. Maps & Discovery Experience

### 5.1 Map View

**Layout:** Full-screen map occupying the Map tab. Top-of-screen search bar. Bottom sheet with a horizontally scrollable row of cafe preview cards.

**Map provider:** React Native Maps backed by Apple MapKit on iOS (default for Expo). Google Maps available as fallback via provider prop.

**Cafe pins:**
- Custom pin icon: small coffee cup in CoffeePass caramel (#C4883A) with a white circle background.
- Pin states: Default (caramel), Selected (espresso #3B1F0E with enlarged pin), Closed (gray #6B6B6B).
- On tap: bottom sheet scrolls to the corresponding cafe card; pin transitions to selected state.

**Map behavior:**
- Initial center: user's current location (if permission granted) or city center (fallback).
- Initial zoom: shows cafes within ~2 miles.
- Re-centers on user location via a "locate me" floating button (bottom-right).
- Loads cafes via a Firestore geospatial query (geohash-based) when the map region changes. Debounced to avoid excessive reads.

### 5.2 List View

**Layout:** Vertically scrollable list. Each row is a cafe card.

**Cafe card contents:**
- Cafe photo (left, square thumbnail, 64×64pt)
- Cafe name (bold, 16pt)
- Distance from user (e.g., "0.3 mi")
- Open / Closed badge (green or gray)
- 1-line menu preview (e.g., "Lattes, Matcha, Pastries")
- Chevron or tap target for full detail

**Sort order:** Distance ascending (nearest first).

**Empty state:** "No cafes found nearby. Try expanding your search or check back soon."

### 5.3 Toggle Between Map and List

A segmented control at the top of the screen toggles between "Map" and "List" views. State persists within the session. Default is Map on first open.

### 5.4 Cafe Detail Screen

Accessed by tapping a cafe card (list) or a pin's preview card (map). Pushes onto the navigation stack within the Map or Discover tab.

**Contents:**
| Section | Details |
|---|---|
| **Hero image** | Full-width cafe photo (16:9 aspect ratio) |
| **Cafe name** | Large bold text |
| **Status** | Open Now / Closed — with today's hours |
| **Distance** | e.g., "0.3 miles away" |
| **Description** | Cafe's 280-char description (if provided) |
| **Menu** | Full menu grouped by category. Each item shows: name, credit price, photo (if available). Tap → item detail with "Redeem" CTA |
| **Hours** | Full weekly schedule in a collapsible section |
| **Location** | Static mini-map with pin; "Get Directions" link opens Apple Maps |

### 5.5 Filters

Available on both Map and List views via a filter icon in the top bar.

| Filter | Options | Default |
|---|---|---|
| **Open Now** | Toggle on/off | Off |
| **Distance** | 0.5 mi / 1 mi / 3 mi / 5 mi / 10 mi | 3 mi |
| **Price** | $ (1–3 credits avg) / $$ (4–6) / $$$ (7+) | All |

Filters apply immediately. Active filter count shown as a badge on the filter icon.

### 5.6 Search

**Behavior:** Text input in the top bar. Searches against cafe names and menu item names. Results update as the user types (debounced 300ms). Results displayed as a dropdown overlay on the list, or as highlighted pins on the map.

**Empty result:** "No results for '[query]'. Try a different search."

### 5.7 Location Permission Handling

| State | Behavior |
|---|---|
| **Not yet asked** | Show pre-prompt screen explaining why location is needed, then trigger system dialog |
| **Authorized (always / when in use)** | Map centers on user; distance calculations enabled |
| **Denied** | Show city picker. Text: "Enable location in Settings for the best experience." Link to Settings app. Map centers on selected city's downtown |
| **Restricted** | Same as Denied |

---

## 6. Full Screen Inventory

### 6.1 Consumer App Screens

| # | Screen | Purpose | Key Actions | UI States | Navigation |
|---|---|---|---|---|---|
| C01 | **Splash** | Brand loading screen | None | Loading | → C02 or C05 |
| C02 | **Welcome** | Entry point for new users | Sign Up, Log In | Default | → C03, C04 |
| C03 | **Sign Up** | Account creation | Enter fields, social auth | Default, Errors, Loading | → C05 |
| C04 | **Log In** | Returning user auth | Enter email/password, social auth, forgot password | Default, Errors, Loading | → C05 |
| C05 | **Location Permission** | Request location access | Allow, Skip (city picker) | Pre-prompt, Denied fallback | → C06 |
| C06 | **Discover (Home)** | Browse nearby cafes | Toggle map/list, search, filter | Map view, List view, Empty, Loading | Tab: Discover |
| C07 | **Cafe Detail** | View cafe info and menu | Browse menu, tap item, get directions | Default, Cafe closed | ← C06, → C08 |
| C08 | **Menu Item Detail** | View item info | Redeem | Default, Insufficient credits | ← C07, → C09 |
| C09 | **Redemption Confirmation** | Confirm credit spend | Confirm Redeem, Cancel | Default, Loading | ← C08, → C10 |
| C10 | **Redemption Active** | Show QR + 4-digit code | Show to barista, Cancel order | Countdown timer (15 min), Expired | ← auto-dismiss on complete |
| C11 | **Redemption Success** | Confirmation after barista scan | Done | Static confirmation | → C06 |
| C12 | **Map (Tab)** | Full-screen map of cafes | Pan, zoom, tap pins, search, filter | Pins loaded, Empty region | Tab: Map |
| C13 | **Wallet (Tab)** | Credit balance + purchase | Buy credits, view balance, view history | Has credits, Zero balance, Purchase flow | Tab: Wallet |
| C14 | **Buy Credits** | Select and purchase bundle | Select bundle, enter payment, confirm | Bundle selection, Payment form, Processing, Success, Error | ← C13 |
| C15 | **Credit History** | Ledger of credit activity | Scroll, filter by type | List of entries, Empty | ← C13 |
| C16 | **Orders (Tab)** | Order history | View past orders, tap for detail | Active orders, Past orders, Empty | Tab: Orders |
| C17 | **Order Detail** | Single order info | View redemption code (if active), view receipt | Active (with QR), Completed, Expired, Cancelled | ← C16 |
| C18 | **Profile (Tab)** | Account settings | Edit name, change password, log out, delete account | Default | Tab: Profile |
| C19 | **Edit Profile** | Update user info | Save changes | Default, Loading, Success | ← C18 |
| C20 | **Forgot Password** | Password reset | Enter email, submit | Default, Email sent, Error | ← C04 |
| C21 | **Notifications** | Order status updates | Tap to navigate to order | List, Empty | ← C18 or system push |
| C22 | **No Cafes Nearby** | Empty state when no supply | Join waitlist | Static | Replaces C06 content |
| C23 | **Credit Expiry Warning** | Alert before credits expire | Buy more, spend now | Modal/banner | Overlay on C13 |

### 6.2 Cafe App Screens

| # | Screen | Purpose | Key Actions | UI States | Navigation |
|---|---|---|---|---|---|
| F01 | **Cafe Welcome** | Entry for cafe owners | Sign Up, Log In | Default | → F02 or F03 |
| F02 | **Cafe Sign Up** | Account creation | Enter fields | Default, Errors | → F04 |
| F03 | **Cafe Log In** | Returning cafe auth | Enter credentials | Default, Errors | → F08 |
| F04 | **Onboarding: Business Profile** | Cafe name, address, hours, photo | Fill form, upload photo | Default, Errors, Saving | → F05 |
| F05 | **Onboarding: Menu Setup** | Add menu items | Add item, edit, delete | Default, Min 3 validation | → F06 |
| F06 | **Onboarding: Payout Setup** | Connect Stripe | Open Stripe Connect, Skip | Default, Connected, Skipped | → F07 |
| F07 | **Onboarding: Review & Go Live** | Summary and submit | Go Live | All complete, Missing payout warning | → F08 (pending review) |
| F08 | **Dashboard (Tab)** | Overview stats | View today's orders, total redemptions, payout summary | Default, No orders yet | Tab: Dashboard |
| F09 | **Redeem Order (Tab)** | Scan or enter redemption code | Scan QR, Enter 4-digit code | Scanner active, Manual entry, Success (green), Failure (red + reason) | Tab: Redeem |
| F10 | **Incoming Orders** | List of active orders | View details | Active orders, Empty | ← F08 |
| F11 | **Order Detail (Cafe)** | Single order info | View status, see customer code | Active, Redeemed, Expired | ← F10 |
| F12 | **Menu Management (Tab)** | CRUD menu items | Add, edit, delete, toggle availability | List of items, Empty | Tab: Menu |
| F13 | **Add/Edit Menu Item** | Item form | Save, Cancel | Default, Errors | ← F12 |
| F14 | **Reports (Tab)** | Transaction history + export | View list, download CSV, select date range | Default, Empty, Date picker | Tab: Reports |
| F15 | **Payout History** | List of weekly payouts | View details | List, Empty | ← F14 |
| F16 | **Settings (Tab)** | Cafe settings | Edit profile, hours, manage staff, disconnect Stripe, log out | Default | Tab: Settings |
| F17 | **Edit Cafe Profile** | Update cafe info | Save | Default, Loading | ← F16 |
| F18 | **Manage Staff** | Add/remove staff accounts | Invite by email, remove | List, Empty | ← F16 |
| F19 | **Pending Review** | Waiting for CoffeePass approval | None (informational) | Static | Shown after F07 until approved |

---

## 7. Navigation Structure

### 7.1 Consumer App — Tab Bar

```
┌─────────────────────────────────────────────────┐
│  Discover  │   Map   │  Wallet  │ Orders │ Profile│
└─────────────────────────────────────────────────┘
```

| Tab | Icon | Root Screen | Stack Screens |
|---|---|---|---|
| **Discover** | Compass | C06 (Discover) | → C07 (Cafe Detail) → C08 (Item Detail) → C09 (Confirm) → C10 (Active Redemption) → C11 (Success) |
| **Map** | Map pin | C12 (Map) | → C07 → C08 → C09 → C10 → C11 |
| **Wallet** | Wallet | C13 (Wallet) | → C14 (Buy Credits) → C15 (Credit History) |
| **Orders** | Receipt | C16 (Orders) | → C17 (Order Detail) |
| **Profile** | Person | C18 (Profile) | → C19 (Edit Profile) → C21 (Notifications) |

### 7.2 Cafe App — Tab Bar

```
┌──────────────────────────────────────────────────┐
│ Dashboard │  Redeem  │   Menu   │ Reports │Settings│
└──────────────────────────────────────────────────┘
```

| Tab | Icon | Root Screen | Stack Screens |
|---|---|---|---|
| **Dashboard** | Chart bar | F08 (Dashboard) | → F10 (Incoming Orders) → F11 (Order Detail) |
| **Redeem** | QR scan | F09 (Redeem Order) | — (single screen with scanner + manual entry) |
| **Menu** | List | F12 (Menu Management) | → F13 (Add/Edit Item) |
| **Reports** | Download | F14 (Reports) | → F15 (Payout History) |
| **Settings** | Gear | F16 (Settings) | → F17 (Edit Profile) → F18 (Manage Staff) |

### 7.3 Role-Based Routing

On app launch, after authentication:
- If `user.role === 'consumer'` → Consumer tab navigator
- If `user.role === 'cafe_owner'` → Cafe tab navigator
- If `user.role === 'cafe_staff'` → Cafe tab navigator (limited permissions — see Section 9)
- If no role yet → role selection screen ("I'm a coffee drinker" / "I'm a cafe owner")

---

## 8. Monetary & Transaction Logic

### 8.1 Credit Bundles

| Bundle | Price (USD) | Credits Issued | Effective $/Credit | Discount |
|---|---|---|---|---|
| Starter | $4.99 | 5 | $1.00 | 0% |
| Regular | $9.99 | 11 | $0.91 | 9% |
| Value (Most Popular) | $19.99 | 24 | $0.83 | 17% |
| Pro | $39.99 | 50 | $0.80 | 20% |
| Super Pro | $74.99 | 100 | $0.75 | 25% |

**Payment method:** Stripe Payment Intents (credit/debit card, Apple Pay, Google Pay). Not Apple In-App Purchase — CoffeePass credits are redeemed for physical goods (coffee), which qualifies for the physical goods exemption from Apple's 30% commission.

**Assumption:** Apple approves Stripe direct payment for CoffeePass credits because they are exchanged for physical beverages at a physical counter. If rejected, fallback is RevenueCat with IAP and adjusted pricing to absorb Apple's 30%.

### 8.2 Credit Purchase Flow

```
Consumer selects bundle
        ↓
Stripe Payment Intent created (server-side via Cloud Function)
        ↓
Consumer confirms payment (Stripe SDK in-app)
        ↓
Stripe webhook: payment_intent.succeeded
        ↓
processCreditPurchase Cloud Function:
  1. Validate payment amount matches bundle
  2. Add credits to user's creditBalance (atomic increment)
  3. Write CreditLedgerEntry { type: PURCHASE, amount: +N, purchaseId }
  4. Write CreditPurchase { userId, bundleName, amountPaid, creditsIssued, expiresAt: now + 12 months }
        ↓
Consumer sees updated balance in Wallet
```

### 8.3 Redemption Flow (Full Detail)

```
Consumer taps "Redeem" on a menu item
        ↓
App shows confirmation: "[Item Name] — [X] credits. Redeem at [Cafe Name]?"
        ↓
Consumer confirms
        ↓
placeOrder Cloud Function (atomic Firestore batch write):
  1. Read creditBalance — if insufficient, reject with INSUFFICIENT_CREDITS
  2. Deduct credits: creditBalance -= itemCreditPrice
  3. Write CreditLedgerEntry { type: REDEMPTION, amount: -X, orderId }
  4. Create Order { userId, cafeId, menuItemId, creditAmount, status: CREATED }
  5. Generate RedemptionToken:
     - tokenId: UUID v4
     - qrPayload: base64(JSON({ orderId, tokenId, cafeId }))
     - backupCode: random 4-digit numeric string (0000–9999)
     - expiresAt: now + 15 minutes
     - redeemed: false
  6. Update Order status → READY_FOR_REDEMPTION
  7. Commit batch
        ↓
App displays:
  - QR code (encoding the qrPayload)
  - 4-digit backup code (large, centered, easy to read aloud)
  - Countdown timer: "Valid for 14:59... 14:58..."
  - "Cancel Order" button
        ↓
Consumer shows QR/code to barista
        ↓
Barista scans QR or enters 4-digit code in cafe app
        ↓
redeemOrder Cloud Function:
  1. Look up RedemptionToken by tokenId (QR) or backupCode + cafeId (manual)
  2. Validate:
     a. Token exists → else error: INVALID_CODE
     b. Token.cafeId === requesting cafe → else error: WRONG_CAFE
     c. Token.redeemed === false → else error: ALREADY_REDEEMED
     d. Token.expiresAt > now → else error: EXPIRED
  3. Mark token.redeemed = true
  4. Update Order status → REDEEMED
  5. Write transaction log entry
  6. Send push notification to consumer: "Your [item] has been redeemed at [cafe]!"
        ↓
Barista sees: ✓ green screen — "Order Redeemed — [Item Name]"
Consumer sees: push notification + order status updated in Orders tab
```

### 8.4 Expired Redemption Handling

A scheduled Cloud Function (`expireOrders`) runs every 60 seconds:
1. Query all orders where `status === READY_FOR_REDEMPTION` and `redemptionToken.expiresAt < now`.
2. For each expired order:
   - Update order status → `EXPIRED`.
   - Return credits to consumer: `creditBalance += order.creditAmount`.
   - Write `CreditLedgerEntry { type: EXPIRY_REFUND, amount: +X, orderId }`.
   - Mark `RedemptionToken.redeemed = true` (prevents late redemption).
   - Send push notification to consumer: "Your order expired. Credits have been returned to your wallet."

### 8.5 Cancellation Handling

Consumer taps "Cancel Order" on the active redemption screen (C10):
1. `cancelOrder` Cloud Function verifies order is still `READY_FOR_REDEMPTION`.
2. Update order status → `CANCELLED`.
3. Return credits: `creditBalance += order.creditAmount`.
4. Write `CreditLedgerEntry { type: CANCELLATION_REFUND, amount: +X, orderId }`.
5. Mark `RedemptionToken.redeemed = true`.

### 8.6 Payout Logic

**Weekly cycle:** Every Monday at 06:00 UTC.

**Calculation per cafe:**
```
totalCreditsRedeemed = SUM(order.creditAmount) WHERE order.cafeId = cafe
                       AND order.status = REDEEMED
                       AND order.redeemedAt BETWEEN lastMonday AND thisSunday
                       AND order.payoutStatus = PENDING

payoutAmount = totalCreditsRedeemed × payoutRate
  - Standard cafes: payoutRate = $0.80/credit
  - Founder cafes:  payoutRate = $0.88/credit

platformFee = totalCreditsRedeemed × (1 - payoutRate)
```

**Payout execution:**
1. Create Stripe Transfer to cafe's connected account for `payoutAmount`.
2. Create `Payout` document: `{ cafeId, periodStart, periodEnd, totalCredits, payoutAmount, platformFee, stripeTransferId, status: PROCESSING }`.
3. Update all included orders: `payoutStatus → INCLUDED`, `payoutId → payout.id`.
4. On Stripe transfer success webhook: `Payout.status → COMPLETED`.
5. On Stripe transfer failure: `Payout.status → FAILED`, alert admin, retry next cycle.

**Minimum payout threshold:** $5.00. If a cafe's weekly payout is below $5, it rolls over to the next week. This prevents Stripe micro-transfer fees from eating margin.

### 8.7 Platform Fee Structure

| Cafe Tier | Platform Fee | Cafe Receives | Duration |
|---|---|---|---|
| **Founder** (first 20 cafes) | 12% | $0.88/credit | First 6 months |
| **Standard** | 20% | $0.80/credit | Ongoing |

The `platformFeeRate` is stored on each `Cafe` document. Founder rate automatically transitions to standard rate after 6 months via a scheduled Cloud Function check.

### 8.8 Refund Policy

**Consumer-initiated refund of credit purchase:**
- Allowed within 7 days of purchase if no credits from that bundle have been spent.
- Processed via Stripe Refund → credits removed from balance → `CreditLedgerEntry { type: PURCHASE_REFUND }`.
- If partial spend has occurred, refund is denied. Consumer retains remaining credits.

**Disputed orders (e.g., drink not received):**
- Consumer contacts support → admin reviews → if justified, credits are returned from CoffeePass margin (not deducted from cafe payout unless fraud is established).
- `CreditLedgerEntry { type: DISPUTE_CREDIT, amount: +X }`.

### 8.9 Preventing Revenue Loss

| Scenario | Protection |
|---|---|
| Consumer spends more credits than they have | Atomic read-check-deduct in Cloud Function; balance verified server-side |
| Double-redemption of same order | `redeemed` flag on token; checked server-side before marking |
| Cafe paid for unredeemed order | Payout only includes `REDEEMED` orders |
| Credit balance goes negative | Cloud Function rejects order if `creditBalance < itemPrice`; never decrements below 0 |
| Stripe payment fails but credits issued | Credits only issued on `payment_intent.succeeded` webhook; never on client-side optimism |
| Chargeback | Stripe notifies via webhook → credits revoked → `CreditLedgerEntry { type: CHARGEBACK }` |

### 8.10 Cafe Accounting & CSV Export

**Feature:** "Download Transactions" button on the Reports tab (F14).

**Date range selection:** Preset buttons (This Week, Last Week, This Month, Last Month, Custom).

**CSV format:**

```
CoffeePass Transaction Report
Cafe: Blue Bottle East Village
Period: Mar 1, 2026 – Mar 31, 2026
Total Redemptions: 142
Total Payout: $667.68

Date,Item,Credits,Cafe Payout,Status
Mar 3,Latte,5,$4.40,Redeemed
Mar 3,Matcha,6,$5.28,Redeemed
Mar 4,Drip Coffee,3,$2.64,Redeemed
Mar 5,Cortado,4,$3.52,Redeemed
...
```

**Payout column calculation:** `credits × payoutRate` (e.g., 5 × $0.88 = $4.40 for founder cafes).

**No POS integration.** Cafes continue ringing drinks normally in their own POS. CoffeePass acts only as a redemption verification and payout platform. The CSV is the reconciliation bridge between CoffeePass payouts and the cafe's own accounting.

### 8.11 Audit Ledger

Every credit movement is recorded in the `creditLedger` collection as an immutable append-only log:

| Entry Type | Amount | Trigger |
|---|---|---|
| `PURCHASE` | +N credits | Credit bundle purchased |
| `REDEMPTION` | -N credits | Order placed |
| `EXPIRY_REFUND` | +N credits | Redemption token expired |
| `CANCELLATION_REFUND` | +N credits | Consumer cancelled order |
| `PURCHASE_REFUND` | -N credits | Full bundle refund |
| `DISPUTE_CREDIT` | +N credits | Admin-granted dispute resolution |
| `CHARGEBACK` | -N credits | Stripe chargeback |
| `CREDIT_EXPIRY` | -N credits | 12-month expiry sweep |

**Nightly reconciliation:** `reconcileCredits` Cloud Function runs at 02:00 UTC. Sums all ledger entries per user and compares to `creditBalance`. Any mismatch is flagged to admin with user ID, expected balance, and actual balance. **Assumption:** Mismatches should never occur if all mutations go through Cloud Functions; reconciliation is a safety net.

---

## 9. Roles & Permissions

### 9.1 Permission Matrix

| Action | Consumer | Cafe Owner | Cafe Staff | Admin |
|---|---|---|---|---|
| Browse cafes & menus | Yes | No | No | Yes |
| Purchase credits | Yes | No | No | No |
| Place orders / redeem | Yes | No | No | No |
| View own order history | Yes | No | No | Yes (all) |
| View own credit balance | Yes | No | No | Yes (any user) |
| Create/edit cafe profile | No | Yes | No | Yes |
| Manage menu items | No | Yes | Yes | Yes |
| Redeem orders (scan/enter code) | No | Yes | Yes | No |
| View cafe dashboard | No | Yes | Yes (limited) | Yes |
| Download CSV report | No | Yes | No | Yes |
| View payout history | No | Yes | No | Yes |
| Manage staff accounts | No | Yes | No | Yes |
| Change cafe payout settings | No | Yes | No | Yes |
| Approve new cafes | No | No | No | Yes |
| View reconciliation reports | No | No | No | Yes |
| Issue dispute credits | No | No | No | Yes |
| Force-expire/cancel orders | No | No | No | Yes |

### 9.2 Cafe Staff Limitations

Cafe staff (invited by the cafe owner) can:
- Access the Redeem tab (scan/enter codes)
- View the Menu tab (read-only)
- View the Dashboard tab (today's orders only)

Cafe staff **cannot**:
- Edit the menu or cafe profile
- View Reports or payout information
- Manage other staff accounts
- Access Settings (except log out)

### 9.3 Role Assignment

- **Consumer:** Assigned on signup when user selects "I'm a coffee drinker."
- **Cafe Owner:** Assigned on signup when user selects "I'm a cafe owner." Tied to exactly one cafe.
- **Cafe Staff:** Created when a cafe owner invites a staff member by email. Staff receives an invite link → creates account → role set to `cafe_staff` with `cafeId` reference.
- **Admin:** Manually assigned in Firestore or Firebase console. Not available via app signup. Admin access is through a separate web dashboard (post-MVP) or directly via Firebase console (MVP).

---

## 10. Data Model

### 10.1 Firestore Collection Structure

```
/users/{userId}
/cafes/{cafeId}
/cafes/{cafeId}/menuItems/{itemId}
/cafes/{cafeId}/staff/{staffUserId}
/orders/{orderId}
/redemptionTokens/{tokenId}
/creditPurchases/{purchaseId}
/creditLedger/{entryId}
/payouts/{payoutId}
```

### 10.2 Entity Definitions

#### User
```
/users/{userId}
{
  id: string (Firebase Auth UID)
  email: string
  displayName: string
  role: "consumer" | "cafe_owner" | "cafe_staff"
  cafeId: string | null          // set for cafe_owner and cafe_staff
  creditBalance: number          // integer, current available credits (consumer only)
  createdAt: timestamp
  updatedAt: timestamp
  fcmToken: string | null        // push notification token
  authProvider: "email" | "google" | "apple"
}
```

#### Cafe
```
/cafes/{cafeId}
{
  id: string
  ownerId: string                // references users.id
  name: string
  description: string | null
  photoUrl: string               // Firebase Storage URL
  phone: string
  status: "PENDING_REVIEW" | "ACTIVE" | "SUSPENDED" | "DEACTIVATED"
  platformFeeRate: number        // 0.12 (founder) or 0.20 (standard)
  founderRateExpiresAt: timestamp | null
  stripeConnectAccountId: string | null
  payoutReady: boolean
  address: {
    street: string
    city: string
    state: string
    zip: string
    country: string
  }
  location: {
    latitude: number
    longitude: number
    geohash: string              // for geospatial queries
  }
  hours: {
    monday:    { open: string, close: string, closed: boolean }
    tuesday:   { open: string, close: string, closed: boolean }
    wednesday: { open: string, close: string, closed: boolean }
    thursday:  { open: string, close: string, closed: boolean }
    friday:    { open: string, close: string, closed: boolean }
    saturday:  { open: string, close: string, closed: boolean }
    sunday:    { open: string, close: string, closed: boolean }
  }
  menuItemCount: number          // denormalized for display
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### MenuItem
```
/cafes/{cafeId}/menuItems/{itemId}
{
  id: string
  cafeId: string
  name: string
  description: string | null
  creditPrice: number            // integer, number of credits
  category: "coffee" | "tea" | "espresso_drinks" | "cold_drinks" | "pastries" | "other"
  photoUrl: string | null
  available: boolean             // toggle item on/off without deleting
  sortOrder: number              // display order within category
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### Order
```
/orders/{orderId}
{
  id: string
  userId: string                 // consumer who placed the order
  cafeId: string
  menuItemId: string
  menuItemName: string           // denormalized for display
  creditAmount: number           // credits spent
  status: "CREATED" | "READY_FOR_REDEMPTION" | "REDEEMED" | "EXPIRED" | "CANCELLED"
  redemptionTokenId: string
  payoutStatus: "PENDING" | "INCLUDED" | "PAID"
  payoutId: string | null
  createdAt: timestamp
  redeemedAt: timestamp | null
  expiredAt: timestamp | null
  cancelledAt: timestamp | null
}
```

#### RedemptionToken
```
/redemptionTokens/{tokenId}
{
  id: string                     // UUID v4
  orderId: string
  cafeId: string
  userId: string
  qrPayload: string             // base64-encoded JSON
  backupCode: string             // 4-digit numeric string
  expiresAt: timestamp           // createdAt + 15 minutes
  redeemed: boolean
  createdAt: timestamp
}
```

#### CreditPurchase
```
/creditPurchases/{purchaseId}
{
  id: string
  userId: string
  bundleName: string             // "starter" | "regular" | "value" | "pro" | "super_pro"
  amountPaidCents: number        // in cents (e.g., 1999 for $19.99)
  creditsIssued: number
  stripePaymentIntentId: string
  status: "COMPLETED" | "REFUNDED"
  expiresAt: timestamp           // purchase date + 12 months
  createdAt: timestamp
}
```

#### CreditLedgerEntry
```
/creditLedger/{entryId}
{
  id: string
  userId: string
  type: "PURCHASE" | "REDEMPTION" | "EXPIRY_REFUND" | "CANCELLATION_REFUND"
        | "PURCHASE_REFUND" | "DISPUTE_CREDIT" | "CHARGEBACK" | "CREDIT_EXPIRY"
  amount: number                 // positive = credits added, negative = credits removed
  balanceAfter: number           // user's credit balance after this entry
  referenceId: string            // orderId, purchaseId, or payoutId depending on type
  description: string            // human-readable (e.g., "Purchased Value bundle")
  createdAt: timestamp
}
```

#### Payout
```
/payouts/{payoutId}
{
  id: string
  cafeId: string
  periodStart: timestamp         // Monday 00:00 UTC
  periodEnd: timestamp           // Sunday 23:59 UTC
  totalCreditsRedeemed: number
  payoutAmountCents: number      // in cents
  platformFeeCents: number       // in cents
  platformFeeRate: number        // 0.12 or 0.20
  orderCount: number
  stripeTransferId: string | null
  status: "PROCESSING" | "COMPLETED" | "FAILED" | "ROLLED_OVER"
  createdAt: timestamp
  completedAt: timestamp | null
}
```

### 10.3 Indexes Required

| Collection | Fields | Purpose |
|---|---|---|
| `orders` | `cafeId`, `status`, `createdAt` | Cafe dashboard: active orders |
| `orders` | `userId`, `createdAt` | Consumer order history |
| `orders` | `status`, `redemptionToken.expiresAt` | Expiry sweep |
| `orders` | `cafeId`, `status`, `payoutStatus`, `redeemedAt` | Weekly payout aggregation |
| `creditLedger` | `userId`, `createdAt` | Credit history display |
| `creditPurchases` | `userId`, `expiresAt` | 12-month expiry sweep |
| `redemptionTokens` | `backupCode`, `cafeId` | Manual code lookup |
| `cafes` | `location.geohash`, `status` | Geospatial discovery queries |

---

## 11. Tech Stack

| Layer | Technology | Justification |
|---|---|---|
| **Frontend** | React Native + Expo (managed workflow) | Single codebase for iOS (primary) and Android (future). Expo simplifies build/deploy. Large ecosystem. |
| **Navigation** | React Navigation 6+ (bottom tabs + native stack) | Industry standard for React Native. Supports tab bar + nested stacks. |
| **State Management** | React Context + `useReducer` for global state; local state for UI | Simple enough for MVP. No Redux overhead. Upgrade to Zustand if complexity grows. |
| **Backend** | Firebase Cloud Functions (Node.js 18, TypeScript) | Serverless, scales to zero, tight Firestore integration, handles webhooks and scheduled jobs. |
| **Database** | Cloud Firestore | Real-time sync, offline support, document model fits CoffeePass entities, scales automatically. |
| **Auth** | Firebase Authentication | Email/password, Google sign-in, Apple sign-in. Handles token refresh and session management. |
| **Payments** | Stripe (Payment Intents + Stripe Connect Express) | Credit purchases via Payment Intents. Cafe payouts via Connect Transfers. Apple Pay and Google Pay via Stripe SDK. |
| **Maps** | `react-native-maps` (Apple MapKit on iOS) | Native performance. Apple MapKit is free and ships with iOS. No additional API key needed on iOS. |
| **Push Notifications** | Firebase Cloud Messaging (FCM) + `expo-notifications` | Order status alerts to consumers and incoming order alerts to cafes. |
| **Image Storage** | Firebase Storage | Cafe photos and menu item images. Integrates with Firestore security rules. |
| **QR Code Generation** | `react-native-qrcode-svg` | Client-side QR generation from the token payload. No server rendering needed. |
| **QR Code Scanning** | `expo-camera` + `expo-barcode-scanner` | Barista scans consumer's QR code on the cafe app. |
| **Analytics** | Firebase Analytics (MVP) + Mixpanel (post-MVP) | Event tracking for funnels, retention, marketplace health. Firebase is free and built-in. |
| **Error Tracking** | Sentry (`@sentry/react-native`) | Crash reporting and error monitoring in production. |
| **CSV Generation** | `papaparse` (client-side) | Generate CSV files on-device for cafe transaction export. No server-side file generation needed. |

---

## 12. Project File Structure

```
CoffeePassMobile/
├── app.json                          # Expo configuration
├── babel.config.js
├── tsconfig.json
├── package.json
├── .env                              # Environment variables (Stripe keys, Firebase config)
├── .gitignore
├── firestore.rules                   # Firestore security rules
├── firestore.indexes.json            # Composite index definitions
├── firebase.json                     # Firebase project config
│
├── assets/                           # Static assets (icons, splash, fonts)
│   ├── icon.png
│   ├── splash.png
│   └── fonts/
│
├── src/
│   ├── app/                          # App entry point and providers
│   │   ├── App.tsx                   # Root component with providers
│   │   └── providers.tsx             # Auth, Theme, Navigation providers
│   │
│   ├── config/                       # Configuration constants
│   │   ├── firebase.ts               # Firebase initialization
│   │   ├── stripe.ts                 # Stripe initialization
│   │   ├── constants.ts              # App-wide constants (bundle prices, timeouts, etc.)
│   │   └── theme.ts                  # Colors, typography, spacing (espresso/caramel/cream palette)
│   │
│   ├── navigation/                   # Navigation setup
│   │   ├── RootNavigator.tsx         # Auth check → Consumer or Cafe navigator
│   │   ├── ConsumerTabNavigator.tsx  # 5-tab layout
│   │   ├── CafeTabNavigator.tsx      # 5-tab layout
│   │   ├── AuthStack.tsx             # Welcome, SignUp, Login, ForgotPassword
│   │   └── types.ts                  # Navigation type definitions
│   │
│   ├── features/                     # Feature modules (screens + logic per domain)
│   │   ├── auth/
│   │   │   ├── screens/
│   │   │   │   ├── WelcomeScreen.tsx
│   │   │   │   ├── SignUpScreen.tsx
│   │   │   │   ├── LoginScreen.tsx
│   │   │   │   └── ForgotPasswordScreen.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useAuth.ts
│   │   │   └── components/
│   │   │       └── SocialAuthButtons.tsx
│   │   │
│   │   ├── discovery/
│   │   │   ├── screens/
│   │   │   │   ├── DiscoverScreen.tsx
│   │   │   │   ├── MapScreen.tsx
│   │   │   │   ├── CafeDetailScreen.tsx
│   │   │   │   └── MenuItemDetailScreen.tsx
│   │   │   ├── components/
│   │   │   │   ├── CafeCard.tsx
│   │   │   │   ├── CafePin.tsx
│   │   │   │   ├── FilterSheet.tsx
│   │   │   │   └── SearchBar.tsx
│   │   │   └── hooks/
│   │   │       ├── useNearbyCafes.ts
│   │   │       └── useSearch.ts
│   │   │
│   │   ├── wallet/
│   │   │   ├── screens/
│   │   │   │   ├── WalletScreen.tsx
│   │   │   │   ├── BuyCreditsScreen.tsx
│   │   │   │   └── CreditHistoryScreen.tsx
│   │   │   └── hooks/
│   │   │       └── useCreditBalance.ts
│   │   │
│   │   ├── orders/
│   │   │   ├── screens/
│   │   │   │   ├── OrdersScreen.tsx
│   │   │   │   ├── OrderDetailScreen.tsx
│   │   │   │   ├── RedemptionConfirmScreen.tsx
│   │   │   │   ├── RedemptionActiveScreen.tsx
│   │   │   │   └── RedemptionSuccessScreen.tsx
│   │   │   ├── components/
│   │   │   │   ├── QRCodeDisplay.tsx
│   │   │   │   ├── BackupCodeDisplay.tsx
│   │   │   │   └── CountdownTimer.tsx
│   │   │   └── hooks/
│   │   │       └── useOrderStatus.ts
│   │   │
│   │   ├── cafe-dashboard/
│   │   │   ├── screens/
│   │   │   │   ├── DashboardScreen.tsx
│   │   │   │   ├── IncomingOrdersScreen.tsx
│   │   │   │   └── CafeOrderDetailScreen.tsx
│   │   │   └── components/
│   │   │       └── DashboardStats.tsx
│   │   │
│   │   ├── cafe-redeem/
│   │   │   ├── screens/
│   │   │   │   └── RedeemScreen.tsx
│   │   │   └── components/
│   │   │       ├── QRScanner.tsx
│   │   │       ├── ManualCodeEntry.tsx
│   │   │       ├── RedeemSuccess.tsx
│   │   │       └── RedeemFailure.tsx
│   │   │
│   │   ├── cafe-menu/
│   │   │   ├── screens/
│   │   │   │   ├── MenuManagementScreen.tsx
│   │   │   │   └── AddEditMenuItemScreen.tsx
│   │   │   └── components/
│   │   │       └── MenuItemRow.tsx
│   │   │
│   │   ├── cafe-reports/
│   │   │   ├── screens/
│   │   │   │   ├── ReportsScreen.tsx
│   │   │   │   └── PayoutHistoryScreen.tsx
│   │   │   └── hooks/
│   │   │       └── useCSVExport.ts
│   │   │
│   │   ├── cafe-onboarding/
│   │   │   ├── screens/
│   │   │   │   ├── BusinessProfileScreen.tsx
│   │   │   │   ├── MenuSetupScreen.tsx
│   │   │   │   ├── PayoutSetupScreen.tsx
│   │   │   │   └── ReviewGoLiveScreen.tsx
│   │   │   └── components/
│   │   │       └── OnboardingProgress.tsx
│   │   │
│   │   └── profile/
│   │       ├── screens/
│   │       │   ├── ProfileScreen.tsx
│   │       │   ├── EditProfileScreen.tsx
│   │       │   └── NotificationsScreen.tsx
│   │       └── hooks/
│   │           └── useProfile.ts
│   │
│   ├── components/                   # Shared UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ErrorBoundary.tsx
│   │   └── ImagePicker.tsx
│   │
│   ├── services/                     # API / Firebase service layer
│   │   ├── firebase/
│   │   │   ├── auth.ts               # Sign up, log in, log out, password reset
│   │   │   ├── cafes.ts              # CRUD cafes, geospatial queries
│   │   │   ├── orders.ts             # Place order, cancel, fetch history
│   │   │   ├── credits.ts            # Purchase, fetch balance, fetch history
│   │   │   └── storage.ts            # Image upload/download
│   │   └── stripe/
│   │       ├── payments.ts           # Create payment intent, confirm payment
│   │       └── connect.ts            # Stripe Connect onboarding URL
│   │
│   ├── models/                       # TypeScript type definitions
│   │   ├── User.ts
│   │   ├── Cafe.ts
│   │   ├── MenuItem.ts
│   │   ├── Order.ts
│   │   ├── RedemptionToken.ts
│   │   ├── CreditPurchase.ts
│   │   ├── CreditLedgerEntry.ts
│   │   └── Payout.ts
│   │
│   ├── hooks/                        # Shared custom hooks
│   │   ├── useLocation.ts
│   │   ├── useNotifications.ts
│   │   └── useFirestoreDoc.ts
│   │
│   └── utils/                        # Utility functions
│       ├── formatCredits.ts
│       ├── formatCurrency.ts
│       ├── geohash.ts
│       ├── generateBackupCode.ts
│       └── csvExport.ts
│
├── functions/                        # Firebase Cloud Functions
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts                  # Function exports
│       ├── credits/
│       │   ├── processCreditPurchase.ts   # Stripe webhook handler
│       │   ├── reconcileCredits.ts        # Nightly reconciliation
│       │   └── expireCredits.ts           # 12-month expiry sweep
│       ├── orders/
│       │   ├── placeOrder.ts              # Atomic order placement
│       │   ├── redeemOrder.ts             # Token validation + redemption
│       │   ├── cancelOrder.ts             # Consumer cancellation
│       │   └── expireOrders.ts            # 15-minute expiry sweep
│       ├── payouts/
│       │   └── weeklyPayouts.ts           # Monday payout batch
│       ├── auth/
│       │   └── onUserCreate.ts            # Initialize user document
│       └── utils/
│           ├── stripe.ts                  # Stripe client initialization
│           └── validation.ts              # Shared validation helpers
│
├── tests/                            # Unit + integration tests
│   ├── unit/
│   │   ├── creditMath.test.ts
│   │   ├── orderStateMachine.test.ts
│   │   ├── tokenValidation.test.ts
│   │   └── csvExport.test.ts
│   └── integration/
│       ├── creditPurchase.test.ts
│       ├── orderRedemption.test.ts
│       └── payoutCalculation.test.ts
│
└── e2e/                              # End-to-end tests
    ├── playwright.config.ts
    ├── consumer/
    │   ├── signup.spec.ts
    │   ├── purchaseCredits.spec.ts
    │   └── redeemDrink.spec.ts
    └── cafe/
        ├── onboarding.spec.ts
        ├── redeemOrder.spec.ts
        └── csvExport.spec.ts
```

---

## 13. Build Plan

### Phase 1 — Foundation (Week 1)

| Task | Details |
|---|---|
| Initialize Expo project | `npx create-expo-app CoffeePassMobile --template expo-template-blank-typescript` |
| Configure Firebase project | Create project in Firebase console; enable Auth, Firestore, Storage, Functions, FCM |
| Set up project structure | Create all directories from Section 12 |
| Install core dependencies | `react-navigation`, `firebase`, `@stripe/stripe-react-native`, `react-native-maps`, `react-native-qrcode-svg`, `expo-camera`, `sentry` |
| Configure TypeScript | `tsconfig.json` with strict mode, path aliases |
| Set up theme | `theme.ts` with espresso/caramel/cream palette, Inter font, spacing scale |
| Shared components | Build `Button`, `Input`, `Card`, `Badge`, `LoadingSpinner`, `EmptyState` |
| Deploy Firestore rules | Initial rules allowing authenticated reads; restrict writes to Cloud Functions |
| Firebase emulator setup | Local emulator for Firestore + Functions development |

### Phase 2 — Authentication (Week 1–2)

| Task | Details |
|---|---|
| Firebase Auth config | Enable Email/Password, Google, Apple providers |
| Auth screens | WelcomeScreen, SignUpScreen, LoginScreen, ForgotPasswordScreen |
| Social auth | Google Sign-In + Apple Sign-In integration |
| `onUserCreate` Cloud Function | Initialize Firestore user document with role and empty credit balance |
| Role-based routing | RootNavigator checks `user.role` → Consumer tabs or Cafe tabs |
| Auth state persistence | `onAuthStateChanged` listener in root provider |
| Session management | Auto-refresh tokens; graceful re-auth on expiry |

### Phase 3 — Onboarding (Week 2–3)

| Task | Details |
|---|---|
| Consumer location permission | Pre-prompt screen + system dialog + denied fallback (city picker) |
| Cafe onboarding wizard | 4-step flow: BusinessProfile → MenuSetup → PayoutSetup → ReviewGoLive |
| Address autocomplete | Expo location or Google Places API for address → lat/lng |
| Image upload | `expo-image-picker` + Firebase Storage for cafe/menu photos |
| Menu item CRUD | Add, edit, delete, toggle availability |
| Stripe Connect integration | Generate onboarding link via Cloud Function; handle OAuth redirect |
| Onboarding progress persistence | Auto-save each step; resume on re-open |

### Phase 4 — Discovery & Maps (Week 3–4)

| Task | Details |
|---|---|
| Map view | `react-native-maps` with custom CafePin components |
| Geospatial queries | Geohash-based Firestore queries for nearby cafes |
| List view | Scrollable cafe cards sorted by distance |
| Map/List toggle | Segmented control with state persistence |
| Cafe detail screen | Full menu, hours, photo, description, mini-map |
| Search | Text search across cafe names and menu item names |
| Filters | Open Now, Distance, Price Range with immediate apply |
| Empty states | "No cafes nearby" and "No results for query" |

### Phase 5 — Orders & Redemption (Week 4–5)

| Task | Details |
|---|---|
| Credit purchase flow | Stripe Payment Intent → webhook → `processCreditPurchase` |
| Wallet screen | Balance display, bundle selector, purchase history |
| `placeOrder` Cloud Function | Atomic credit deduction + order creation + token generation |
| Redemption UI (consumer) | QR code display + 4-digit backup code + countdown timer |
| `redeemOrder` Cloud Function | Token validation (exists, correct cafe, not used, not expired) |
| Redeem screen (cafe) | QR scanner + manual code entry + success/failure UI |
| `expireOrders` Cloud Function | Scheduled: expire stale tokens, return credits |
| `cancelOrder` Cloud Function | Consumer-initiated cancellation with credit return |
| Order history | Consumer and cafe views of past orders |
| Push notifications | Order status changes (created, redeemed, expired) via FCM |

### Phase 6 — Cafe Dashboard & Reports (Week 5–6)

| Task | Details |
|---|---|
| Dashboard screen | Today's orders, total redemptions this week, pending payout amount |
| Incoming orders list | Real-time list of active orders for the cafe |
| CSV export | `papaparse` generation with summary header; share via iOS share sheet |
| Payout history | List of past weekly payouts with status |
| Staff management | Invite by email, list staff, remove staff |

### Phase 7 — Payouts (Week 6–7)

| Task | Details |
|---|---|
| `weeklyPayouts` Cloud Function | Monday 06:00 UTC batch: aggregate, calculate, Stripe Transfer |
| Payout document creation | Track each payout with status and Stripe transfer ID |
| Stripe Transfer webhook | Confirm completed transfers; handle failures |
| Minimum payout threshold | Roll over payouts below $5 |
| Founder rate expiry | Scheduled check: transition 12% → 20% after 6 months |
| `reconcileCredits` Cloud Function | Nightly ledger audit; alert on mismatch |
| `expireCredits` Cloud Function | Daily sweep of 12-month-old purchases |

### Phase 8 — Testing & Launch (Week 7–8)

| Task | Details |
|---|---|
| Unit tests | Credit math, order state machine, token validation, CSV format |
| Integration tests | Full Cloud Function flows with Firebase emulator |
| E2E tests | Playwright: consumer signup → purchase → redeem; cafe onboarding → redeem scan |
| Security rules testing | Firestore rules: verify consumers can't write to cafe collections, etc. |
| Performance testing | Map with 50+ pins; order placement latency; token validation latency |
| App Store submission | Screenshots, description, privacy policy, physical goods declaration |
| Soft launch | 15 cafes, 200 users, 1 neighborhood |

---

## 14. Testing Strategy

### 14.1 Unit Tests

**Framework:** Jest (included with Expo)

| Test Suite | What It Covers |
|---|---|
| `creditMath.test.ts` | Bundle price → credits mapping; effective $/credit calculation; payout amount per credit at 12% and 20% rates |
| `orderStateMachine.test.ts` | Every valid state transition; rejection of invalid transitions (e.g., REDEEMED → CANCELLED); timestamp enforcement |
| `tokenValidation.test.ts` | Valid token acceptance; expired token rejection; already-redeemed rejection; wrong-cafe rejection; backup code lookup |
| `csvExport.test.ts` | CSV header format; column order and values; date formatting; payout calculation per row; summary totals |
| `geohash.test.ts` | Lat/lng → geohash conversion; neighbor geohash calculation for bounding queries |
| `formatCredits.test.ts` | Display formatting (e.g., "5 credits", "1 credit") |
| `generateBackupCode.test.ts` | Always 4 digits; zero-padded; string type |

### 14.2 Integration Tests

**Framework:** Jest + Firebase Emulator Suite

| Test Suite | What It Covers |
|---|---|
| `creditPurchase.test.ts` | Simulated Stripe webhook → Cloud Function → credit balance incremented → ledger entry written |
| `orderRedemption.test.ts` | `placeOrder` → verify balance deducted → `redeemOrder` → verify order status REDEEMED → verify token marked used |
| `payoutCalculation.test.ts` | Seed redeemed orders → run `weeklyPayouts` → verify payout amount matches expected (credits × rate) |
| `orderExpiry.test.ts` | Place order → advance time 16 minutes → run `expireOrders` → verify status EXPIRED → verify credits returned |
| `concurrentRedemption.test.ts` | Two simultaneous `redeemOrder` calls for the same token → only one succeeds; the other gets ALREADY_REDEEMED |
| `firestoreRules.test.ts` | Consumer cannot write to `cafes` collection; cafe staff cannot read `payouts`; unauthenticated users cannot read any collection |

### 14.3 End-to-End Tests

**Framework:** Playwright (via `@playwright/test` against Expo Web build or Detox for native)

**Assumption:** E2E tests run against Expo Web build for CI speed. Critical native-only flows (camera scanning) are tested manually or via Detox.

| Test Suite | Flow |
|---|---|
| `consumer/signup.spec.ts` | Open app → tap Sign Up → enter name/email/password → verify home screen loads with Discover tab |
| `consumer/purchaseCredits.spec.ts` | Navigate to Wallet → select Value bundle → complete Stripe test payment → verify balance shows 24 credits |
| `consumer/redeemDrink.spec.ts` | Browse cafe → tap menu item → confirm redeem → verify QR code and 4-digit code displayed → verify countdown starts |
| `cafe/onboarding.spec.ts` | Sign up as cafe owner → fill business profile → add 3 menu items → skip Stripe → verify Review screen shows correct info |
| `cafe/redeemOrder.spec.ts` | Open Redeem tab → enter 4-digit code → verify green success screen with item name |
| `cafe/csvExport.spec.ts` | Navigate to Reports → select date range → tap Download → verify CSV content matches expected format |

### 14.4 Redemption System Tests (Critical Path)

These tests specifically validate the redemption system's integrity:

| Test | Scenario | Expected Outcome |
|---|---|---|
| **Happy path** | Consumer redeems, barista scans valid QR | Order → REDEEMED; barista sees green confirmation |
| **Manual code entry** | Barista enters 4-digit backup code | Same as QR scan; order → REDEEMED |
| **Expired token** | Consumer waits 16 minutes, barista scans | Rejection: "This code has expired"; credits returned |
| **Double scan** | Barista scans same QR twice | Second scan rejected: "Already redeemed" |
| **Wrong cafe** | Barista at Cafe B scans code for Cafe A | Rejection: "This code is for a different cafe" |
| **Insufficient credits** | Consumer with 2 credits tries to redeem 5-credit item | Order creation rejected: "Insufficient credits" |
| **Cancel before scan** | Consumer cancels during countdown | Order → CANCELLED; credits returned; token invalidated |
| **Concurrent redemption** | Two devices scan same QR simultaneously | Exactly one succeeds; the other is rejected |

### 14.5 Transaction Integrity Tests

| Test | What It Verifies |
|---|---|
| **Ledger balance consistency** | After any sequence of purchases + redemptions + refunds, `creditBalance` equals SUM of all `CreditLedgerEntry.amount` for that user |
| **No negative balance** | Attempt to place order for more credits than available → rejected; balance unchanged |
| **Atomic order placement** | If credit deduction fails, no order is created; if order creation fails, credits are not deducted |
| **Payout accuracy** | Sum of all payout amounts for a period equals SUM(redeemed order credits) × payoutRate |
| **Reconciliation detection** | Manually tamper with a user's `creditBalance` → nightly reconciliation flags the mismatch |

---

## 15. Analytics

### 15.1 Key Events

| Event | Trigger | Properties |
|---|---|---|
| `user_signed_up` | Consumer or cafe account created | `role`, `authProvider` |
| `location_permission_granted` | User allows location | — |
| `location_permission_denied` | User denies location | — |
| `credit_bundle_viewed` | User opens Buy Credits screen | — |
| `credit_bundle_purchased` | Stripe payment succeeds | `bundleName`, `amount`, `creditsIssued` |
| `cafe_viewed` | Consumer opens cafe detail | `cafeId`, `distance` |
| `menu_item_viewed` | Consumer taps menu item | `cafeId`, `itemId`, `creditPrice` |
| `order_placed` | Order created successfully | `cafeId`, `itemId`, `creditAmount` |
| `order_redeemed` | Barista validates code | `cafeId`, `orderId`, `redemptionMethod` (qr/manual) |
| `order_expired` | Redemption token expired | `cafeId`, `orderId` |
| `order_cancelled` | Consumer cancels before redemption | `orderId` |
| `cafe_onboarding_started` | Cafe owner begins wizard | — |
| `cafe_onboarding_step_completed` | Each wizard step finished | `step` (1–4) |
| `cafe_went_live` | Cafe approved and active | `cafeId`, `menuItemCount` |
| `csv_exported` | Cafe downloads transaction report | `cafeId`, `dateRange` |

### 15.2 Key Performance Indicators

| KPI | Definition | Month 1 Target | Month 6 Target |
|---|---|---|---|
| **Weekly Active Orders** (North Star) | Orders with status REDEEMED per week | 300 | 5,000 |
| **Consumer signup → first purchase** | % of signups who buy credits within 7 days | 25% | 35% |
| **Credit purchase → first redemption** | % of purchasers who redeem within 48 hours | 60% | 75% |
| **Consumer 30-day retention** | % of consumers who place at least 1 order in days 7–30 | 35% | 50% |
| **Cafe activation rate** | % of signed-up cafes that go ACTIVE | 80% | 90% |
| **Cafe 30-day retention** | % of active cafes with at least 1 redemption per week | 70% | 85% |
| **Redemption success rate** | % of created orders that reach REDEEMED (vs expired/cancelled) | 85% | 92% |
| **Average order value** | Mean credit amount per order | 5 credits | 6 credits |
| **Credit utilization rate** | % of purchased credits redeemed (vs expired) | 80% | 85% |
| **Order acceptance rate** | % of orders redeemed within 15 minutes | 85% | 92% |

### 15.3 Marketplace Health Dashboard (Post-MVP)

| Metric | Signal |
|---|---|
| Supply/demand ratio | Active cafes per 100 active consumers; healthy range: 3–8 |
| Geographic coverage | % of consumer locations within 1 mile of at least 1 cafe |
| Credit velocity | Average days between credit purchase and full redemption |
| Cafe order concentration | Gini coefficient of order distribution across cafes; lower = healthier |
| Bundle upgrade rate | % of Starter purchasers who buy Regular+ within 30 days |

---

## 16. Risks & Assumptions

### 16.1 Product Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Insufficient cafe supply at launch** | High | Critical | Founder-led onboarding of 20 cafes before first consumer is acquired; 12% founder rate as incentive |
| **Consumers don't buy credits** | Medium | Critical | Starter bundle at $4.99 lowers barrier; savings math shown prominently; first-purchase discount campaign |
| **Low redemption rate (credits sit idle)** | Medium | Medium | Push notifications reminding users of balance; discovery features surface new cafes; credits approaching expiry trigger alerts |
| **Cafes churn after onboarding** | Medium | Medium | Weekly payouts prove value fast; 30-day notice in cafe agreement; credits refunded if cafe deactivates |
| **QR scanning fails in cafe lighting** | Low | Medium | 4-digit backup code as fallback; QR code high-contrast with error correction |

### 16.2 Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Apple rejects Stripe direct payment** | Medium | High | CoffeePass credits are redeemed for physical goods (coffee), which qualifies for Apple's physical goods exemption. Fallback: RevenueCat with IAP and repriced bundles to absorb 30% |
| **Credit ledger discrepancy** | Low | Critical | All credit mutations through Cloud Functions (never client-side); nightly reconciliation with admin alerts; double-entry ledger design |
| **Firestore cost at scale** | Low (at MVP) | Medium | Denormalize frequently-read fields; paginate queries; use geohash bounds instead of full-collection scans |
| **Concurrent redemption race condition** | Low | High | Firestore transactions with optimistic locking on `RedemptionToken.redeemed` field; integration tests for concurrent access |
| **Cloud Function cold starts** | Medium | Low | Keep functions warm with minimum instances (1) for `placeOrder` and `redeemOrder`; other functions can cold-start |

### 16.3 Business Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Competitor launches similar product** | Medium | Medium | Network effects and local cafe relationships are the moat; move fast; first-mover advantage in each city |
| **Payment chargebacks** | Low | Medium | Stripe handles dispute management; credits revoked on chargeback; velocity checks on purchases |
| **Cafe fraud (claims not to have received order)** | Low | Low | Transaction log with timestamps; redemption tokens prove fulfillment; dispute resolution process |
| **Customer fraud (chargebacks after spending credits)** | Low | Medium | Rate limiting on purchases; email verification required; Stripe Radar for fraud detection |
| **Regulatory (money transmitter classification)** | Low | High | CoffeePass sells credits for goods (not stored value for cash equivalent); legal review recommended before scaling |

### 16.4 Assumptions

| # | Assumption | Confidence | Fallback |
|---|---|---|---|
| A1 | Apple permits Stripe direct payment for physical-goods credits | Medium | RevenueCat IAP with 30% price adjustment |
| A2 | 15-minute redemption TTL is sufficient for consumers to reach the counter | High | Make TTL configurable per cafe; extend to 30 minutes if data shows abandonment |
| A3 | 4-digit backup codes provide sufficient uniqueness per cafe | High | Codes are unique per cafe at any given moment (max ~60 active orders per cafe); collisions are statistically negligible |
| A4 | Cafes will accept a 20% platform fee | Medium | Founder rate (12%) eases initial adoption; demonstrate ROI via customer acquisition metrics |
| A5 | Stripe Connect Express accounts are sufficient for cafe payouts | High | Upgrade to Custom accounts only if cafes need more control |
| A6 | Consumers will pre-pay for coffee credits | Medium | Starter bundle at $4.99 (risk of 1 coffee) minimizes commitment; savings math is the hook |
| A7 | React Native + Expo delivers acceptable iOS performance for maps and camera | High | Eject to bare workflow if Expo limitations block critical features |
| A8 | Firestore handles MVP-scale traffic without cost issues | High | At 500 orders/week, Firestore costs are negligible (<$10/month) |

---

## 17. Implementation Readiness Check

### 17.1 Completeness Verification

| Section | Status | Notes |
|---|---|---|
| Product vision and value propositions | Complete | Consumer + cafe + business model defined |
| User personas | Complete | 4 personas with goals, motivations, pain points |
| Marketplace mechanics | Complete | Join flow, discovery, credits, redemption, payouts, revenue model |
| Consumer onboarding | Complete | 4 steps with fields, validation, error states, drop-off mitigations |
| Cafe onboarding | Complete | 5 steps with fields, validation, Stripe Connect integration |
| Map and discovery | Complete | Map view, list view, pins, search, filters, location handling |
| Screen inventory | Complete | 23 consumer screens, 19 cafe screens with purpose, actions, states |
| Navigation structure | Complete | Tab bars + stack navigators for both apps |
| Credit purchase flow | Complete | Bundles, Stripe integration, webhook, ledger |
| Redemption system | Complete | QR + 4-digit code, 15-min TTL, validation rules, state machine |
| Payout system | Complete | Weekly aggregation, Stripe Transfer, minimum threshold, founder rate |
| Refund and cancellation | Complete | Consumer cancel, expired auto-return, purchase refund, dispute |
| Accounting/CSV export | Complete | Format specified, columns defined, summary header defined |
| Roles and permissions | Complete | 4 roles, full permission matrix |
| Data model | Complete | 9 entities with all fields, types, and relationships |
| Tech stack | Complete | Every layer specified with justification |
| Project file structure | Complete | Full directory tree with every file's purpose |
| Build plan | Complete | 8 phases with week-by-week breakdown |
| Testing strategy | Complete | Unit, integration, E2E, redemption-specific, transaction integrity |
| Analytics | Complete | 15 events, 10 KPIs with targets |
| Risks and assumptions | Complete | Product, technical, business risks + 8 labeled assumptions |

### 17.2 Internal Consistency Check

| Check | Result |
|---|---|
| Every screen referenced in a flow exists in the screen inventory | Verified |
| Every data entity referenced in a flow exists in the data model | Verified |
| Order state machine covers all edge cases (happy path, expiry, cancel, double-redeem) | Verified |
| Credit balance can never go negative (all deductions are server-side with atomic checks) | Verified |
| Platform always earns positive margin (credit spread is structurally guaranteed) | Verified |
| Payout calculation uses correct fee rate per cafe tier (12% founder, 20% standard) | Verified |
| CSV export columns match the specified format (Date, Item, Credits, Cafe Payout, Status) | Verified |
| Redemption token rules match spec (single use, tied to order, tied to cafe, 15-min TTL) | Verified |
| No POS integration assumed or required | Verified |
| All navigation paths are reachable from tab bars | Verified |

### 17.3 Ready to Build

This specification is **implementation-ready**. An engineering team can begin Phase 1 (Foundation) immediately using this document as the single source of truth. Every screen, data entity, API contract, business rule, and edge case is defined with sufficient detail to write code without ambiguity.

**Recommended first actions:**
1. Initialize the Expo project and Firebase project.
2. Set up the project directory structure from Section 12.
3. Build shared components and theme from the brand palette.
4. Implement Firebase Auth with role-based routing.
5. Proceed sequentially through the Phase plan in Section 13.

---

*CoffeePass — Confidential PRD v1.0 | March 2026*
