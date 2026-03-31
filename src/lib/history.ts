const HISTORY_KEY = "beforesign_history";
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
