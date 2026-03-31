import OpenAI from "openai";

let openai: OpenAI | null = null;

function getOpenAIClient() {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

export const ANALYZE_PROMPT = `
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
  "clauses": [
    {
      "clause_number": number,
      "clause_title": "string",
      "risk_level": "safe" | "caution" | "danger",
      "original_text": "string",
      "plain_english": "string",
      "why_risky": "string" | null,
      "suggestion": "string" | null
    },
    ...
  ],
  "questions_to_ask": ["string", ...],
  "suggested_changes": ["string", ...]
}
`;

export async function analyzeContract(text: string) {
  const response = await getOpenAIClient().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: ANALYZE_PROMPT },
      { role: "user", content: `Analyze this contract:\n\n${text}` },
    ],
    response_format: { type: "json_object" },
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error("No response from OpenAI");

  return JSON.parse(content);
}

export async function analyzeContractImage(base64Image: string) {
  const response = await getOpenAIClient().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: ANALYZE_PROMPT },
      {
        role: "user",
        content: [
          { type: "text", text: "Analyze this contract image:" },
          {
            type: "image_url",
            image_url: { url: `data:image/jpeg;base64,${base64Image}` },
          },
        ],
      },
    ],
    response_format: { type: "json_object" },
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error("No response from OpenAI");

  return JSON.parse(content);
}
