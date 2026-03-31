# Audit History & PDF Button Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Store contract audits in localStorage so users can reopen past analyses, and move the PDF download button to the top summary card.

**Architecture:** A pure utility module handles localStorage read/write, a new `AuditHistorySection` component renders the history cards, and `page.tsx` saves each audit after analysis completes. The PDF button is lifted from the bottom of `ResultsDashboard` into the top summary card.

**Tech Stack:** Next.js 15, React, TypeScript, Tailwind CSS, framer-motion, @react-pdf/renderer

---

## File Map

| Action | File | Purpose |
|--------|------|---------|
| Create | `src/lib/history.ts` | Pure functions: saveAudit, getHistory, deleteAudit |
| Create | `src/components/AuditHistorySection.tsx` | Recent Audits UI — cards with reopen/delete |
| Modify | `src/app/page.tsx` | Save audit after analysis, pass history to homepage |
| Modify | `src/components/ResultsDashboard.tsx` | Move PDF button to top summary card |

---

### Task 1: History utility module

**Files:**
- Create: `src/lib/history.ts`

- [ ] **Step 1: Create `src/lib/history.ts`**

```typescript
const HISTORY_KEY = "contractsafe_history";
const MAX_HISTORY = 10;

export interface AuditEntry {
  id: string;
  name: string;
  score: number;
  verdict: string;
  date: string;
  results: any;
}

export function getHistory(): AuditEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveAudit(name: string, results: any): void {
  const entry: AuditEntry = {
    id: Date.now().toString(),
    name,
    score: results.overall_score,
    verdict: results.overall_verdict,
    date: new Date().toISOString(),
    results,
  };
  const history = getHistory();
  const updated = [entry, ...history].slice(0, MAX_HISTORY);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
}

export function deleteAudit(id: string): AuditEntry[] {
  const updated = getHistory().filter((e) => e.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  return updated;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/history.ts
git commit -m "feat: add audit history localStorage utility"
```

---

### Task 2: AuditHistorySection component

**Files:**
- Create: `src/components/AuditHistorySection.tsx`

- [ ] **Step 1: Create `src/components/AuditHistorySection.tsx`**

```tsx
"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AuditEntry } from "@/lib/history";
import { RotateCcw, Trash2 } from "lucide-react";

interface AuditHistorySectionProps {
  history: AuditEntry[];
  onReopen: (entry: AuditEntry) => void;
  onDelete: (id: string) => void;
}

function scoreColor(score: number): string {
  if (score >= 70) return "bg-green-400 text-black";
  if (score >= 40) return "bg-yellow-400 text-black";
  return "bg-red-500 text-white";
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AuditHistorySection({
  history,
  onReopen,
  onDelete,
}: AuditHistorySectionProps) {
  if (history.length === 0) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 pb-16">
      <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/40 mb-6">
        Recent Audits
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <AnimatePresence>
          {history.map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="modern-card p-6 bg-white flex flex-col gap-4"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-black text-sm uppercase tracking-tight leading-tight line-clamp-2 flex-1">
                  {entry.name}
                </p>
                <button
                  onClick={() => onDelete(entry.id)}
                  className="text-black/20 hover:text-black transition-colors shrink-0"
                  aria-label="Delete audit"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 ${scoreColor(
                    entry.score
                  )}`}
                >
                  {entry.score}/100
                </span>
                <span className="text-[10px] text-black/40 font-bold uppercase tracking-widest">
                  {formatDate(entry.date)}
                </span>
              </div>

              <p className="text-xs font-bold text-black/60 leading-snug line-clamp-2">
                {entry.verdict}
              </p>

              <button
                onClick={() => onReopen(entry)}
                className="modern-button-outline text-[10px] px-4 py-2 flex items-center justify-center gap-2 mt-auto"
              >
                <RotateCcw className="w-3 h-3" />
                Reopen
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/AuditHistorySection.tsx
git commit -m "feat: add AuditHistorySection component"
```

---

### Task 3: Wire history into page.tsx

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Add imports at the top of `src/app/page.tsx`**

Add after the existing imports:
```tsx
import AuditHistorySection from "@/components/AuditHistorySection";
import { saveAudit, getHistory, deleteAudit, AuditEntry } from "@/lib/history";
```

- [ ] **Step 2: Add history state inside the `Home` component, after the existing state declarations**

```tsx
const [history, setHistory] = useState<AuditEntry[]>([]);
```

- [ ] **Step 3: Load history from localStorage on mount**

Add this effect after the existing effects:
```tsx
useEffect(() => {
  setHistory(getHistory());
}, []);
```

- [ ] **Step 4: Save audit after analysis completes**

In `handleAnalyze`, after `setResults(result)`:
```tsx
if (result) {
  const name =
    data.type !== "text" && data.content instanceof File
      ? (data.content as File).name
      : "Untitled Contract";
  saveAudit(name, result);
  setHistory(getHistory());
}
```

The full updated try block inside `handleAnalyze` becomes:
```tsx
try {
  let result;
  if (data.type === "text") {
    result = await analyzeContractText(data.content as string, controller.signal);
  } else if (data.type === "image") {
    result = await analyzeContractImage(data.content as File, controller.signal);
  } else if (data.type === "pdf") {
    result = await analyzeContractPDF(data.content as File, controller.signal);
  }

  setResults(result);

  if (result) {
    const name =
      data.type !== "text" && data.content instanceof File
        ? (data.content as File).name
        : "Untitled Contract";
    saveAudit(name, result);
    setHistory(getHistory());
  }
} catch (err: any) {
  if (err.name === "AbortError") {
    console.log("Analysis cancelled by user");
  } else {
    setError(err.message);
  }
}
```

- [ ] **Step 5: Add handleReopen and handleDeleteHistory functions**

Add after `handleCancel`:
```tsx
const handleReopen = (entry: AuditEntry) => {
  setResults(entry.results);
  setIsPaid(localStorage.getItem("contractsafe_paid") === "true");
  setShowSuccess(false);
  setShowPayFirst(false);
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const handleDeleteHistory = (id: string) => {
  setHistory(deleteAudit(id));
};
```

- [ ] **Step 6: Render AuditHistorySection below the upload zone**

In the JSX, the `{!results && (...)}` block currently renders `HowItWorks` and `FAQ`. Update it to include the history section between the upload zone and those sections:

```tsx
{!results && (
  <div className="bg-white">
    <AuditHistorySection
      history={history}
      onReopen={handleReopen}
      onDelete={handleDeleteHistory}
    />
    <HowItWorks />
    <FAQ />
  </div>
)}
```

- [ ] **Step 7: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: save audits to history and show Recent Audits section"
```

---

### Task 4: Move PDF button to top summary card in ResultsDashboard

**Files:**
- Modify: `src/components/ResultsDashboard.tsx`

- [ ] **Step 1: Read current `ResultsDashboard.tsx`**

The top summary card ends after the stats grid (`clauses / safe / risks`). The PDF download link is currently in the "Report Footer" section at the very bottom.

- [ ] **Step 2: Move the PDF button into the top summary card**

Replace the entire top summary `<motion.div>` block (the one with `RiskGauge`) with:

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  className="modern-card p-16 bg-white"
>
  <div className="flex flex-col md:flex-row items-center gap-20">
    <RiskGauge score={results.overall_score} />

    <div className="flex-1 text-center md:text-left">
      <div className="inline-block bg-yellow-400 text-black px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest mb-6">
        Official Analysis Report
      </div>
      <h2 className="text-4xl font-black text-black leading-[1.1] mb-10 uppercase tracking-tighter">
        {results.overall_verdict}
      </h2>

      <div className="grid grid-cols-3 gap-8 mb-10">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-black/30 mb-2">Clauses</p>
          <p className="text-3xl font-black">{results.clauses.length}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-black/30 mb-2">Safe</p>
          <p className="text-3xl font-black">{safeCount}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-black/30 mb-2">Risks</p>
          <p className="text-3xl font-black text-yellow-600">{results.clauses.length - safeCount}</p>
        </div>
      </div>

      {/* PDF Download — prominent, top of page */}
      {!isLocked ? (
        <PDFDownloadLink
          document={<AuditReport results={results} />}
          fileName={`ContractSafe_Audit_${new Date().toISOString().split("T")[0]}.pdf`}
        >
          {({ loading }) => (
            <button
              className="modern-button px-8 py-3 text-xs flex items-center gap-3"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileDown className="w-4 h-4" />
              )}
              {loading ? "Preparing..." : "Download Full Audit PDF"}
            </button>
          )}
        </PDFDownloadLink>
      ) : (
        <div className="flex flex-col items-start gap-2">
          <button
            disabled
            className="modern-button px-8 py-3 text-xs flex items-center gap-3 opacity-30 cursor-not-allowed"
          >
            <FileDown className="w-4 h-4" />
            Download Full Audit PDF
            <Lock className="w-3 h-3" />
          </button>
          <button
            onClick={onAlreadyPaid}
            className="text-[10px] font-bold uppercase tracking-widest text-black/40 hover:text-black transition-colors"
          >
            Already paid? Click here
          </button>
        </div>
      )}
    </div>
  </div>
</motion.div>
```

- [ ] **Step 3: Remove the old Report Footer section**

Delete the entire "Report Footer" `<div>` block at the bottom of the component (the one containing `PDFDownloadLink`, the disabled button, and the disclaimer text). Keep only the disclaimer paragraph, moved to just above the closing `</div>` of the main container:

```tsx
<p className="text-center text-[10px] font-bold uppercase tracking-[0.4em] max-w-xl mx-auto text-black/30 leading-relaxed pb-32">
  THIS IS AN AI-GENERATED AUDIT. IT IS NOT A LEGAL DOCUMENT.
  CONSULT A QUALIFIED ATTORNEY BEFORE MAKING ANY LEGAL DECISIONS.
</p>
```

- [ ] **Step 4: Commit**

```bash
git add src/components/ResultsDashboard.tsx
git commit -m "feat: move PDF download button to top summary card"
```
