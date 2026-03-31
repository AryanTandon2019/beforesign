# ContractSafe — Complete Build Prompt

Copy-paste everything below into Claude or any AI coding tool:

---

## PROMPT START

Build me a complete single-page web app called **ContractSafe** using **Next.js 14 (App Router) + Tailwind CSS + TypeScript**. Deploy-ready on Vercel.

### What ContractSafe Does:
Users upload any contract (PDF, image, or paste text). AI analyzes every clause and shows a visual risk breakdown — green (safe), yellow (medium risk), red (high risk). The full details of risky clauses are BLURRED/LOCKED behind a $2.99 paywall. Once paid, everything is revealed instantly.

---

### DESIGN DIRECTION:

**Aesthetic:** Dark, premium, trust-building. Think "high-end security product." Users are scared about contracts — the design should feel protective, authoritative, and calm.

**Color Palette:**
- Background: #0A0A0B (near black)
- Surface cards: #141416
- Border/subtle lines: #1E1E22
- Primary accent: #3B82F6 (blue — trust color)
- Safe/green: #22C55E
- Warning/yellow: #F59E0B  
- Danger/red: #EF4444
- Text primary: #F5F5F5
- Text secondary: #8B8B8D

**Typography:**
- Headings: "DM Sans" (Google Fonts) — bold, clean, trustworthy
- Body: "IBM Plex Sans" (Google Fonts) — professional, readable

**Vibe:** No playful elements. No emojis in the UI. This is serious. People are trusting this tool with important legal documents. The design should feel like a vault, not a toy.

---

### PAGE STRUCTURE (Single Page App — No Routing Needed):

#### SECTION 1: Hero
- Headline: "Upload Any Contract. See Where You're Getting Screwed."
- Subheadline: "AI analyzes every clause in 30 seconds. Red flags highlighted. Plain English explanations. No lawyer needed."
- A prominent upload area below the headline (this is the main CTA — not a button that scrolls down, the actual upload zone right in the hero)
- Small trust badges below upload zone: "🔒 Your documents are never stored" | "⚡ Analysis in 30 seconds" | "📄 PDF, Images, or Paste Text"

#### SECTION 2: Upload Zone (integrated into hero)
Three input methods as tabs:
- **Tab 1: Upload PDF** — drag and drop zone, accepts .pdf files
- **Tab 2: Upload Image** — drag and drop zone, accepts .jpg, .png, .heic (for people who snap photos of paper contracts)
- **Tab 3: Paste Text** — large textarea where they can paste contract text directly

When a file is uploaded or text is pasted, show a loading state: "Analyzing your contract... Scanning for risky clauses..." with a subtle progress animation.

#### SECTION 3: Results Dashboard (appears after analysis)
This is the core product. Show:

**Top Summary Card:**
- Overall Risk Score: Circle gauge showing score out of 100 (100 = very safe, 0 = very risky)
- Color of gauge changes based on score (green/yellow/red)
- Total clauses found: X
- Safe clauses: X (green)
- Medium risk: X (yellow)  
- High risk: X (red)
- One-line verdict: e.g., "This contract has 3 clauses that could cost you money. Review before signing."

**Clause-by-Clause Breakdown:**
A vertical list of every clause found. Each clause card shows:
- Clause number and title (e.g., "Clause 7 — Termination")
- Risk level badge (green SAFE / yellow CAUTION / red DANGER)
- For GREEN clauses: Show full explanation in plain English (visible for free)
- For YELLOW and RED clauses: Show the clause title and risk level but BLUR the explanation text and add a lock icon with "Unlock full analysis — $2.99" overlay

**The blur effect is critical.** Users can SEE that problems exist. They can count them. They know which clauses are risky. But they can't read WHY or WHAT TO DO about it. This creates irresistible tension that drives payment.

**Unlock Button:**
A prominent button: "Unlock Full Analysis — $2.99"
- On click: Open Stripe Checkout (or show a placeholder modal for now that says "Stripe integration — coming soon" with a button)
- After payment: All blurred clauses smoothly un-blur with a nice reveal animation

**Below the clause list, show (also blurred for free users):**
- "Questions To Ask Before Signing" — AI-generated list of specific questions based on the risky clauses
- "Suggested Changes" — specific language changes to propose to the other party
- "Download Full Report as PDF" button

#### SECTION 4: How It Works (below results, always visible)
Three simple steps with icons:
1. "Upload your contract" — PDF, photo, or paste text
2. "AI scans every clause" — Identifies risks in 30 seconds
3. "Know before you sign" — See exactly what to watch out for

#### SECTION 5: FAQ
- "Is my contract stored?" → "No. We analyze it in real-time and never save your documents."
- "Is this legal advice?" → "No. ContractSafe is an educational tool that helps you understand contracts in plain English. Always consult a lawyer for formal legal advice."
- "What types of contracts can I upload?" → "Any contract — freelance agreements, rental leases, employment offers, NDAs, partnership deals, SaaS terms, vendor contracts, and more."
- "How accurate is the analysis?" → "Our AI is trained to identify common risk patterns in contracts. While highly accurate, we recommend using it as a starting point for understanding, not as a replacement for professional legal review."

#### SECTION 6: Footer
- Simple footer with: "ContractSafe © 2026" | Privacy Policy | Terms of Service
- Small disclaimer: "ContractSafe is an educational tool, not a law firm. This does not constitute legal advice."

---

### TECHNICAL IMPLEMENTATION:

**API Route for Contract Analysis:**
Create an API route at `/api/analyze` that:
1. Receives the contract text (or extracted text from PDF/image)
2. Sends it to Google Gemini API (model: gemini-2.5-flash-lite) with this system prompt:

```
You are a contract analysis expert. Analyze the following contract and identify every distinct clause. For each clause, provide:

1. clause_number: Sequential number
2. clause_title: Short descriptive title (e.g., "Payment Terms", "Termination", "IP Ownership")
3. risk_level: "safe", "caution", or "danger"
4. original_text: The relevant text from the contract (abbreviated if very long)
5. plain_english: Explain what this clause means in simple, plain English that a non-lawyer can understand. Be specific about what it means for the person signing.
6. why_risky: (only for caution/danger) Explain specifically why this clause is risky and what could go wrong.
7. suggestion: (only for caution/danger) What specific change or question should the user raise about this clause.

Also provide:
- overall_score: A risk score from 0-100 (100 = very safe)
- overall_verdict: One sentence summary of the contract's risk level
- questions_to_ask: List of 3-5 specific questions the user should ask the other party before signing
- suggested_changes: List of 3-5 specific language changes to propose

Return ONLY valid JSON, no markdown, no backticks, no explanation. Format:
{
  "overall_score": number,
  "overall_verdict": "string",
  "clauses": [...],
  "questions_to_ask": ["string", ...],
  "suggested_changes": ["string", ...]
}
```

3. Parse the JSON response and return it to the frontend

**For PDF text extraction:**
Use `pdf-parse` npm package to extract text from uploaded PDFs.

**For Image text extraction:**
Send the image directly to Gemini's vision model with the same analysis prompt. Gemini can read contract images directly.

**Environment Variables needed:**
- `GEMINI_API_KEY` — Google Gemini API key
- `STRIPE_PUBLISHABLE_KEY` — Stripe publishable key (for payment)
- `STRIPE_SECRET_KEY` — Stripe secret key

**For Stripe Payment (basic integration):**
- Create a Stripe Checkout Session for $2.99 one-time payment
- On successful payment, return a session token
- Use this token to unlock the blurred content on the frontend
- Keep it simple — no webhooks needed for v1. Just check payment status on the client side.

**If Stripe is not set up yet:**
Show a placeholder payment modal that collects email and says "Payment integration coming soon — get early access" so you can still collect interested users.

---

### IMPORTANT UI DETAILS:

1. **The blur effect on risky clauses:** Use CSS `filter: blur(8px)` on the explanation text with a gradient overlay and a lock icon. Make it look premium, not broken.

2. **Loading state:** While AI analyzes, show a skeleton loader with a pulsing animation. Show progress text that changes: "Reading your contract..." → "Identifying clauses..." → "Analyzing risks..." → "Generating recommendations..."

3. **The risk score gauge:** Use an SVG circular gauge with a smooth animation from 0 to the final score. Color transitions from red (0-40) to yellow (41-70) to green (71-100).

4. **Mobile responsive:** This MUST work perfectly on mobile. People will photograph contracts on their phone and upload immediately. The entire flow should work seamlessly on a phone screen.

5. **Smooth animations:** Fade in the results. Stagger the clause cards appearing one by one. The unlock reveal should feel satisfying — a smooth un-blur with a subtle scale animation.

6. **No unnecessary elements:** No navbar with multiple links. No testimonials section (you have no users yet). No pricing page. Just the tool. Clean. Focused. One purpose.

7. **Upload validation:** Show clear error messages if the file is too large (limit 10MB), wrong format, or if the text is too short to be a contract.

8. **Disclaimer:** Always show at the bottom of results: "This analysis is for educational purposes only and does not constitute legal advice. Consult a qualified attorney for formal legal review."

---

### FILE STRUCTURE:
```
/app
  /page.tsx (main single page)
  /api
    /analyze/route.ts (Gemini API integration)
    /create-checkout/route.ts (Stripe checkout session)
  /layout.tsx
  /globals.css
/components
  /Hero.tsx
  /UploadZone.tsx
  /ResultsDashboard.tsx
  /ClauseCard.tsx
  /RiskGauge.tsx
  /FAQ.tsx
  /Footer.tsx
  /LoadingState.tsx
  /PaymentModal.tsx
/lib
  /gemini.ts (Gemini API helper)
  /stripe.ts (Stripe helper)
  /pdf-parser.ts (PDF text extraction)
```

Build the complete working application. Make every component. Make it look premium and trustworthy. This is a real product that will take real payments.

## PROMPT END