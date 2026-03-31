// app/api/analyze/route.ts

import { NextRequest, NextResponse } from "next/server";
import { extractTextFromPDF } from "@/lib/pdf-parser";

export const maxDuration = 60; // Allow up to 60 seconds for long contracts

export async function POST(req: NextRequest) {
  try {
    let { text, imageBase64, imageType, pdfBase64 } = await req.json();

    if (!text && !imageBase64 && !pdfBase64) {
      return NextResponse.json(
        { error: "No contract text, image, or PDF provided" },
        { status: 400 }
      );
    }

    // If PDF is provided, extract text from it
    if (pdfBase64) {
      try {
        const buffer = Buffer.from(pdfBase64, "base64");
        text = await extractTextFromPDF(buffer);
      } catch (pdfError: any) {
        console.error("PDF Extraction error:", pdfError);
        return NextResponse.json(
          { error: `PDF Extract Failed: ${pdfError.message || "Unknown error"}` },
          { status: 400 }
        );
      }
    }

    const systemPrompt = `You are an elite contract analyst with 25 years of experience protecting freelancers, employees, tenants, and small business owners from unfair contracts.

Your job is to analyze contracts clause-by-clause and identify risks, unfair terms, and red flags, while also recognizing fair and standard protections.

## YOUR ANALYSIS RULES:

1. IDENTIFY EVERY DISTINCT CLAUSE in the contract. Don't skip anything.

2. For each clause, determine the risk level:
   - "safe" — Standard, fair, balanced clause. No concerns.
   - "caution" — Slightly unusual or one-sided. Worth questioning but not a dealbreaker.
   - "danger" — Clearly unfair, heavily one-sided, or could cause serious financial/legal harm to the signer.

3. CRITICAL RULES FOR BALANCED ANALYSIS:
   - Every contract MUST have at least 2-3 "safe" clauses. Standard boilerplate clauses like "Entire Agreement", "Scope of Work" (when clearly defined), and standard "Amendments must be in writing" are SAFE — do not flag them.
   - Reserve "danger" for clauses that are genuinely one-sided, financially threatening, or legally harmful. Not every imperfect clause is dangerous.
   - Use "caution" for clauses that are slightly unusual or worth questioning but not dealbreakers. Portfolio restrictions, standard confidentiality terms, and reasonable dispute resolution clauses are typically "caution" not "danger."
   - A realistic distribution for a BAD contract: 20-30% safe, 20-30% caution, 40-50% danger.
   - A realistic distribution for a FAIR contract: 60-70% safe, 20-30% caution, 0-10% danger.
   - A realistic distribution for a GOOD contract: 80%+ safe, 10-20% caution, 0% danger.
   - If you flag more than 70% of clauses as "danger", you are being too aggressive. Re-evaluate.

4. COMMON RED FLAGS TO WATCH FOR (catch ALL of these):
   - Payment terms longer than 30 days
   - No late payment penalties
   - Unlimited revisions or scope changes without extra pay
   - IP ownership that includes pre-existing work or tools
   - Non-compete clauses longer than 6 months or vaguely defined
   - Confidentiality penalties that are disproportionate
   - One-sided termination rights
   - Unlimited liability on one party
   - Auto-renewal traps
   - Forced arbitration in inconvenient jurisdictions
   - Clauses that waive important legal rights
   - Missing clauses (no payment timeline, no termination rights, no liability caps)
   - Penalty clauses that are disproportionate to the contract value
   - Non-solicitation clauses that are too broad
   - Assignment clauses allowing transfer without consent
   - Indemnification that is one-sided
   - Force majeure that only benefits one party
   - Warranty disclaimers that shift all risk to one party
   - Governing law in a jurisdiction far from the signer

5. EXPLAIN IN PLAIN ENGLISH. No legal jargon. Write as if explaining to a smart 20-year-old who has never read a contract before. Be specific about what could go wrong.

6. BE PROTECTIVE BUT FAIR. While you should warn about dangerous terms, you must also recognize when a contract is standard or fair.

7. GIVE ACTIONABLE SUGGESTIONS. Don't just say "this is risky." Tell them exactly what to ask for or what language to change.

## YOUR OUTPUT FORMAT:

Return ONLY valid JSON. No markdown. No backticks. No explanation text outside the JSON.

{
  "overall_score": <number 0-100, where 100 is very safe and 0 is very dangerous>,
  "overall_verdict": "<one sentence summary — be direct and specific, e.g. 'This contract heavily favors the client with 4 dangerous clauses that could cost you thousands'>",
  "total_clauses": <number>,
  "safe_count": <number>,
  "caution_count": <number>,
  "danger_count": <number>,
  "clauses": [
    {
      "clause_number": <number>,
      "clause_title": "<short title, e.g. 'Payment Terms'>",
      "risk_level": "<safe | caution | danger>",
      "original_text": "<relevant excerpt from the contract, max 150 words>",
      "plain_english": "<what this clause means in simple language, 2-3 sentences>",
      "why_risky": "<only for caution/danger — specifically why this is risky and what could go wrong, 2-3 sentences>",
      "suggestion": "<only for caution/danger — exact change to request or question to ask, be specific>"
    }
  ],
  "questions_to_ask": [
    "<specific question to ask the other party before signing — be direct and actionable>"
  ],
  "suggested_changes": [
    "<specific language change to propose — write the actual new wording they should request>"
  ],
  "missing_protections": [
    "<important clauses that SHOULD be in the contract but are missing, e.g. 'No dispute resolution mechanism' or 'No liability cap defined'>"
  ]
}`;

    // Build the messages array
    const messages: any[] = [
      {
        role: "system",
        content: systemPrompt,
      },
    ];

    if (imageBase64) {
      // For image input — send image directly to GPT-4o-mini vision
      messages.push({
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: `data:${imageType || "image/jpeg"};base64,${imageBase64}`,
            },
          },
          {
            type: "text",
            text: "Analyze this contract image. Extract all text and perform a complete clause-by-clause risk analysis. Return ONLY valid JSON as specified in your instructions.",
          },
        ],
      });
    } else {
      // For text input
      messages.push({
        role: "user",
        content: `Analyze this contract clause-by-clause. Return ONLY valid JSON as specified in your instructions.\n\n--- CONTRACT START ---\n${text}\n--- CONTRACT END ---`,
      });
    }

    // Call OpenAI API
    console.log("Analyzing contract with GPT-4o-mini...");
    if (!text && !imageBase64) {
      console.error("No input data to analyze");
      return NextResponse.json(
        { error: "No input data provided. Please try again." },
        { status: 400 }
      );
    }
    
    if (text) {
      console.log(`Input text length: ${text.length} characters`);
      if (text.length < 20) {
        console.warn("Input text is very short:", text);
      }
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: messages,
        temperature: 0.1, // Low temperature for consistent, accurate analysis
        max_tokens: 4096,
        response_format: { type: "json_object" }, // Force JSON output
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      return NextResponse.json(
        { error: "Failed to analyze contract. Please try again." },
        { status: 500 }
      );
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "No analysis generated. Please try again." },
        { status: 500 }
      );
    }

    // Parse the JSON response
    const analysis = JSON.parse(content);

    // Validate the response has required fields
    if (!analysis.clauses || !analysis.overall_score) {
      console.error("Incomplete JSON response from GPT-4o-mini:", analysis);
      return NextResponse.json(
        { error: "Incomplete analysis. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(analysis);
  } catch (error: any) {
    console.error("Analysis Error:", error);
    return NextResponse.json(
      { error: `Analysis Error: ${error.message || "Unknown error"}` },
      { status: 500 }
    );
  }
}