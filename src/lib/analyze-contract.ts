// lib/analyze-contract.ts

export interface ClauseAnalysis {
  clause_number: number;
  clause_title: string;
  risk_level: "safe" | "caution" | "danger";
  original_text: string;
  plain_english: string;
  why_risky?: string;
  suggestion?: string;
}

export interface ContractAnalysis {
  overall_score: number;
  overall_verdict: string;
  total_clauses: number;
  safe_count: number;
  caution_count: number;
  danger_count: number;
  clauses: ClauseAnalysis[];
  questions_to_ask: string[];
  suggested_changes: string[];
  missing_protections: string[];
}

// Helper to convert File to Base64
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Extract text from PDF without any external library
function extractTextFromPDFBinary(arrayBuffer: ArrayBuffer): string {
  const uint8Array = new Uint8Array(arrayBuffer);
  const textDecoder = new TextDecoder("utf-8", { fatal: false });
  const rawText = textDecoder.decode(uint8Array);

  // Method 1: Extract text between parentheses (PDF text objects)
  const parenthesesMatches = rawText.match(/\(([^)]{2,})\)/g);
  let extractedText = "";

  if (parenthesesMatches) {
    extractedText = parenthesesMatches
      .map((m) => m.slice(1, -1))
      .filter((s) => s.length > 1 && /[a-zA-Z]/.test(s))
      .map((s) =>
        s
          .replace(/\\n/g, "\n")
          .replace(/\\\(/g, "(")
          .replace(/\\\)/g, ")")
          .replace(/\\'/g, "'")
      )
      .join(" ")
      .trim();
  }

  // Method 2: If method 1 didn't get enough text, try extracting between BT/ET markers
  if (extractedText.length < 100) {
    const btEtMatches = rawText.match(/BT[\s\S]*?ET/g);
    if (btEtMatches) {
      const btText = btEtMatches
        .join(" ")
        .match(/\(([^)]+)\)/g);
      if (btText) {
        const altText = btText
          .map((m) => m.slice(1, -1))
          .filter((s) => /[a-zA-Z]/.test(s))
          .join(" ")
          .trim();
        if (altText.length > extractedText.length) {
          extractedText = altText;
        }
      }
    }
  }

  return extractedText;
}

// For PDF files
export async function analyzeContractPDF(
  file: File,
  signal?: AbortSignal
): Promise<ContractAnalysis> {
  const arrayBuffer = await file.arrayBuffer();

  // Extract text from PDF binary
  const text = extractTextFromPDFBinary(arrayBuffer);

  if (text && text.trim().length > 50) {
    // We got text — send it to the API
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
      signal,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to analyze contract");
    }
    return response.json();
  }

  // If we couldn't extract text, throw a helpful error
  throw new Error(
    "Could not extract text from this PDF. Please try one of these: (1) Open the PDF, select all text (Ctrl+A), copy it, and paste in the TEXT tab. (2) Take a screenshot of the contract and upload in the IMAGE tab."
  );
}

// For image files (photos of contracts)
export async function analyzeContractImage(
  file: File,
  signal?: AbortSignal
): Promise<ContractAnalysis> {
  const base64 = await fileToBase64(file);

  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      imageBase64: base64,
      imageType: file.type,
    }),
    signal,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to analyze contract");
  }

  return response.json();
}

// For pasted text
export async function analyzeContractText(
  text: string,
  signal?: AbortSignal
): Promise<ContractAnalysis> {
  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
    signal,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to analyze contract");
  }

  return response.json();
}