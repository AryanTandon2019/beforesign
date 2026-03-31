---
title: Audit History & PDF Button Redesign
date: 2026-03-31
status: approved
---

## Overview

Two improvements: (1) persist contract audits in localStorage so users can reopen past analyses, (2) move and elevate the PDF download button to the top summary card.

## Audit History

### Storage
- Key: `contractsafe_history` in localStorage
- Value: array of up to 10 audit entries, newest first
- Each entry: `{ id, name, score, verdict, date, results }`
  - `id`: `Date.now()` string
  - `name`: filename if uploaded, otherwise "Untitled Contract"
  - `score`: `results.overall_score`
  - `verdict`: `results.overall_verdict`
  - `date`: ISO date string
  - `results`: full analysis JSON
- When a new audit is saved and count exceeds 10, remove the oldest entry

### UI — Recent Audits section
- Shown on the homepage below the upload zone, only when history has entries
- Heading: "Recent Audits"
- Horizontal scrollable row of cards (or grid on desktop)
- Each card shows:
  - Contract name (truncated to 1 line)
  - Risk score with color-coded badge (green = safe, yellow = caution, red = danger)
  - Date analyzed (formatted as "Mar 31, 2026")
  - "Reopen" button → loads results into the results view
  - Delete (×) icon → removes that entry from history, re-renders the list
- If history becomes empty after deletion, the section hides

### Reopen behavior
- Sets `results` state to the stored results
- Sets `isPaid` based on `localStorage.getItem("contractsafe_paid")`
- Scrolls to results view

## PDF Button Redesign

- Remove from the bottom footer section of ResultsDashboard
- Add inside the top summary card (the one with RiskGauge), right below the stats row
- Style: solid black button (`modern-button`) with `FileDown` icon
- When locked: show it greyed out with a lock icon (same as before)
- The "Paid already? Unlock here" text that was in the footer moves up next to the greyed button

## Components

- `src/lib/history.ts` — pure functions: `saveAudit`, `getHistory`, `deleteAudit`
- `src/components/AuditHistorySection.tsx` — the Recent Audits UI, receives history array + callbacks
- `src/app/page.tsx` — calls `saveAudit` after analysis, passes history state to homepage
- `src/components/ResultsDashboard.tsx` — PDF button moved to summary card
