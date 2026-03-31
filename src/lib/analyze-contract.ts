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

// Extract text from PDF using pdfjs-dist (reliable)
async function extractTextFromPDF(file: File): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist");
  
  // v6-bundler-native: Use Next.js/Webpack native worker loading
  // This bundles the worker file directly into your deployment
  // @ts-ignore
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.mjs",
    import.meta.url
  ).toString();

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ 
    data: arrayBuffer,
    // Ensure we disable unnecessary features to improve stability
    disableFontFace: true,
  }).promise;
  
  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    // @ts-ignore
    const pageText = textContent.items.map((item: any) => item.str).join(" ");
    fullText += pageText + "\n";
  }
  return fullText;
}

// Helper to consolidate API calls with robust error handling
async function fetchWithRobustErrorHandling(
  url: string, 
  options: RequestInit,
  payloadSize?: number
): Promise<ContractAnalysis> {
  // Rough estimate of payload size in MB
  if (payloadSize && payloadSize > 4 * 1024 * 1024) {
    console.warn(`Large payload detected: ${(payloadSize / 1024 / 1024).toFixed(2)}MB`);
  }

  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      let errorMessage = "Failed to analyze contract";
      const contentType = response.headers.get("content-type");
      
      if (contentType?.includes("application/json")) {
        try {
          const error = await response.json();
          errorMessage = error.error || errorMessage;
        } catch (e) {
          errorMessage = `Error (${response.status}): ${response.statusText}`;
        }
      } else {
        // Non-JSON error (HTML error page from Vercel/Next.js)
        if (response.status === 504 || response.status === 502) {
          errorMessage = "The analysis timed out. For very long contracts, try copying and pasting smaller sections into the TEXT tab.";
        } else if (response.status === 413) {
          errorMessage = "The document is too large. Please try a smaller file or a snippet of text.";
        } else {
          try {
            const text = await response.text();
            if (text.includes("<!DOCTYPE") || text.includes("<html")) {
              errorMessage = `Server Error (${response.status}). Please try again with a shorter document.`;
            } else {
              errorMessage = text.slice(0, 150) || `Error (${response.status}): ${response.statusText}`;
            }
          } catch (e) {
            errorMessage = `Error (${response.status}): ${response.statusText}`;
          }
        }
      }
      throw new Error(errorMessage);
    }
 
    const contentType = response.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      throw new Error("The server returned an invalid response. Please try again.");
    }
 
    try {
      return await response.json();
    } catch (e: any) {
      throw new Error("Failed to parse the server response. Please try again.");
    }
  } catch (error: any) {
    // Re-throw if it's already our structured error
    if (error instanceof Error && (error.message.includes("Error (") || error.message.includes("too large"))) {
      throw error;
    }
    
    // Handle network errors or AbortError
    if (error.name === 'AbortError') throw error;
    
    throw new Error(error.message || "Network error: Unable to connect to the analysis engine.");
  }
}

// For PDF files
export async function analyzeContractPDF(
  file: File,
  signal?: AbortSignal
): Promise<ContractAnalysis> {
  const text = await extractTextFromPDF(file);
  const sanitizedText = text ? text.trim().replace(/\s+/g, " ") : "";

  // If text extraction is successful (> 150 characters), send it as text
  if (sanitizedText.length >= 150) {
    console.log("Sending PDF text to API (v6):", sanitizedText.substring(0, 50));
    
    return fetchWithRobustErrorHandling("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: sanitizedText }),
      signal,
    }, sanitizedText.length);
  }

  // If extraction returned almost no text, it's likely a scanned/image PDF
  // Instead of failing mysteriously, we provide a helpful redirection message
  throw new Error(
    "This PDF appears to be a scanned image. For an accurate audit, please take a screenshot and upload it in the IMAGE tab, or copy and paste the text manually in the TEXT tab."
  );
}

// For image files (photos of contracts)
export async function analyzeContractImage(
  file: File,
  signal?: AbortSignal
): Promise<ContractAnalysis> {
  const base64 = await fileToBase64(file);

  return fetchWithRobustErrorHandling("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      imageBase64: base64,
      imageType: file.type,
    }),
    signal,
  }, file.size);
}

// For pasted text
export async function analyzeContractText(
  text: string,
  signal?: AbortSignal
): Promise<ContractAnalysis> {
  return fetchWithRobustErrorHandling("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
    signal,
  }, text.length);
}