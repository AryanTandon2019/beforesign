import path from "path";

export async function extractTextFromPDF(fileBuffer: Buffer): Promise<string> {
  // Use the named export PDFParse from the modern pdf-parse fork (v2.4.5+)
  const { PDFParse } = await import("pdf-parse");

  // Fix: Use the legacy build which is more compatible with Node.js/Next.js server-side
  // We point to the minified worker which is often more reliable in dev environments
  const workerSrc = path.join(process.cwd(), "node_modules", "pdfjs-dist", "legacy", "build", "pdf.worker.min.mjs");
  PDFParse.setWorker(workerSrc);

  // Instantiate the parser with the file buffer
  const parser = new PDFParse({ data: fileBuffer });

  // Extract text from the PDF
  const data = await parser.getText();
  return data.text;
}