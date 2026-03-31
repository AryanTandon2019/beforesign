// app/api/analyze/route.ts

import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60; // Allow up to 60 seconds for long contracts

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text, imageBase64, imageType } = body;

    if (!text && !imageBase64) {
      return NextResponse.json(
        { error: "No contract text or image provided" },
        { status: 400 }
      );
    }

    const systemPrompt = `You are an elite contract analyst with 25 years of experience protecting freelancers, employees, tenants, and small business owners from unfair contracts.

Your job is to identify the MOST CRITICAL clauses (limit to 15) that impact the signer. Focus on risks, unfair terms, and red flags, but also acknowledge standard fair terms.

## SCORING CALIBRATION — IMPORTANT:
You must be balanced. Do not be overly aggressive with risk ratings.

### WHAT IS "SAFE"?
If a clause is standard industry practice and balanced for both parties, it is SAFE. Period.
Examples of SAFE clauses:
- Payment within 14-30 days with late penalties = SAFE
- 2-3 rounds of revisions included, extras billed hourly = SAFE
- IP transfers to client upon FULL PAYMENT, freelancer keeps pre-existing work = SAFE
- Either party can terminate with 14 days notice = SAFE
- Liability capped at project fee for both sides = SAFE
- 1 year confidentiality, mutual = SAFE
- Portfolio usage allowed = SAFE
- Mediation before court = SAFE
- Entire agreement clause = SAFE

### WHEN TO MARK AS "CAUTION"?
Mark as CAUTION only if: the clause is slightly unusual, mildly favors one party, or has minor gaps.

### WHEN TO MARK AS "DANGER"?
Mark as DANGER only if: the clause is clearly one-sided, could cause serious financial harm, or removes important rights.

### SCORING GUIDE (Based on 10 clauses):
- 0-2 risky (caution/danger) clauses = score 80-95
- 3-4 risky (caution/danger) clauses = score 55-75
- 5-7 risky (caution/danger) clauses = score 30-50
- 8+ risky (caution/danger) clauses = score 5-25

**CRITICAL RULE:** If you rate more than 40% of clauses in a contract as "danger" or "caution", STOP and re-read each clause. Ask yourself: "Is this actually harmful or just not perfect?" If it is just not perfect, mark it SAFE.

## YOUR ANALYSIS RULES:

1. ANALYZE THE MOST IMPORTANT CLAUSES (up to 15). Focus on high-impact areas like Payment, Liability, IP, Termination, and Non-competes.

2. For each clause, determine the risk level based on the calibration above.

3. EXPLAIN IN PLAIN ENGLISH. No legal jargon. Write as if explaining to a smart 20-year-old who has never read a contract before. Be specific about what could go wrong.

4. GIVE ACTIONABLE SUGGESTIONS. Don't just say "this is risky." Tell them exactly what to ask for or what language to change.

## YOUR OUTPUT FORMAT:

Return ONLY valid JSON. No markdown. No backticks. No explanation text outside the JSON.

{
  "overall_score": <number 0-100 following the scoring guide>,
  "overall_verdict": "<one sentence summary — be direct and specific>",
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
            text: "Analyze the MOST CRITICAL risks and protections in this contract image (limit to 15 clauses). Return ONLY valid JSON as specified in your instructions.",
          },
        ],
      });
    } else {
      // For text input — trim to ~25,000 chars to avoid timeout but keep the core contract
      const trimmedText = text.length > 25000 ? text.substring(0, 25000) + "... [Truncated for speed]" : text;
      
      messages.push({
        role: "user",
        content: `Analyze the critical risks and protections in this contract. Return ONLY valid JSON as specified in your instructions.\n\n--- CONTRACT START ---\n${trimmedText}\n--- CONTRACT END ---`,
      });
    }

    // DEBUG LOGGING (excluding large base64)
    console.log("Analysis Engine: v6-bundler-native");
    if (text) console.log(`Text Input Size: ${text.length} chars`);
    if (imageBase64) {
      const sizeMB = (imageBase64.length * 0.75) / (1024 * 1024);
      console.log(`Image Input Detected: ~${sizeMB.toFixed(2)}MB`);
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error("CRITICAL: OPENAI_API_KEY is missing");
      return NextResponse.json(
        { error: "Server configuration error: API key is missing. Please check your environment variables." },
        { status: 500 }
      );
    }

    let response;
    try {
      response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: messages,
          temperature: 0,
          max_tokens: 2500, // Reduced from 4000 for faster generation
          response_format: { type: "json_object" },
        }),
      });
    } catch (fetchError: any) {
      console.error("Fetch to OpenAI failed:", fetchError);
      return NextResponse.json(
        { error: `Failed to connect to AI service: ${fetchError.message}` },
        { status: 502 }
      );
    }

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        const errorText = await response.text();
        console.error("OpenAI returned non-JSON error:", errorText);
        return NextResponse.json(
          { error: `AI Service Error (${response.status}): ${errorText.slice(0, 100)}` },
          { status: response.status }
        );
      }
      
      console.error("OpenAI API error details (v6-stable):", errorData);
      const openAIErrorMessage = errorData.error?.message || "Unknown OpenAI error";
      return NextResponse.json(
        { 
          error: `OpenAI API Error: ${openAIErrorMessage}`,
          debug_id: "v6-stable-bundler"
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "No analysis generated. AI returned an empty response." },
        { status: 500 }
      );
    }

    // Parse and validate the JSON response
    let analysis;
    try {
      analysis = JSON.parse(content);
    } catch (e) {
      console.error("Failed to parse AI response as JSON:", content);
      return NextResponse.json(
        { error: "AI returned an invalid response format. Please try again." },
        { status: 500 }
      );
    }

    if (!analysis.clauses || typeof analysis.overall_score !== 'number') {
      console.error("Incomplete JSON response from GPT-4o-mini:", analysis);
      return NextResponse.json(
        { error: "The AI was unable to generate a complete audit for this document. Please ensure it's a clear contract and try again." },
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