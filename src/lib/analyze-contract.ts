// lib/analyze-contract.ts

// Helper function to call the analyze API from your frontend components

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

// Helper to convert File to Base64 in the browser
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

async function extractTextFromPDF(file: File): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist");
  
  // Disable worker to avoid CDN version mismatch
  // @ts-ignore
  pdfjsLib.GlobalWorkerOptions.workerSrc = "";

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ 
    data: arrayBuffer,
    // @ts-ignore
    useWorkerFetch: false,
    isEvalSupported: false,
    useSystemFonts: true,
  }).promise;
  
  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(" ");
    fullText += pageText + "\n";
  }
  return fullText;
}

// For PDF files
export async function analyzeContractPDF(file: File, signal?: AbortSignal): Promise<ContractAnalysis> {
  let text = "";
  let extractError = null;

  try {
    // Try text extraction first (fast & cheap)
    text = await extractTextFromPDF(file);
  } catch (err) {
    console.error("PDF text extraction failed:", err);
    extractError = err;
  }

  // If extraction failed OR returned almost no text, fallback to multimodal PDF support
  if (extractError || !text || text.trim().length < 50) {
    console.log("Empty or failed text extraction, falling back to multimodal PDF analysis...");
    const base64 = await fileToBase64(file);

    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pdfBase64: base64,
      }),
      signal,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to analyze contract");
    }

    return response.json();
  }

  // Standard path: send extracted text
  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: text,
    }),
    signal,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to analyze contract");
  }

  return response.json();
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
