import '@/lib/fetchConfig';
import { NextRequest, NextResponse } from 'next/server';

// ─── Configuration ────────────────────────────────────────────────────────────
const MODEL = 'medgemma:4b';

// ─── Shared message type ──────────────────────────────────────────────────────
type Message = { role: 'system' | 'user'; content: string };

// ─── Core caller — calls our self-hosted Gemma 4 server ───────────────────────
async function callGemma(messages: Message[]): Promise<string> {
  const serverUrl = process.env.GEMMA_SERVER_URL;
  const apiKey = process.env.GEMMA_API_KEY;

  if (!serverUrl || !apiKey) {
    throw new Error(
      'GEMMA_SERVER_URL or GEMMA_API_KEY not found in environment variables.'
    );
  }

  const res = await fetch(`${serverUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      max_tokens: 600,
      temperature: 0.4,
    }),
    signal: AbortSignal.timeout(10 * 60 * 1000),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemma server error ${res.status}: ${err}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
}

// ─── JSON extractor ────────────────────────────────────────────────────────────
function extractJSON(raw: string) {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Gemma did not return valid JSON. Raw: ' + raw.slice(0, 500));
  try {
    return JSON.parse(match[0]);
  } catch {
    throw new Error('JSON parse failed. Extracted: ' + match[0].slice(0, 500));
  }
}

// ─── Route handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { type } = body;

  try {
    if (type === 'symptom') {
      const { symptoms, additionalDetails, duration, severity } = body;

      const messages: Message[] = [
        {
          role: 'system',
          content:
                'You are MedGemma, a medical AI at a university health centre. ' +
                'You provide thorough, clinically informed symptom assessments. ' +
                'Always respond with ONLY a raw JSON object — no markdown fences, no extra text.',
        },
        {
          role: 'user',
          content:
            `Student health report:\n` +
            `- Symptoms: ${symptoms.join(', ') || 'not specified'}\n` +
            `- Extra details: ${additionalDetails || 'none'}\n` +
            `- How long: ${duration}\n` +
            `- Severity: ${severity}\n\n` +
            `Analyse these symptoms. Respond with a JSON object:\n` +
            `{\n` +
            `  "urgency": "<choose EXACTLY ONE: Urgent attention suggested | Medical review recommended soon | Monitor and use supportive care>",\n` +
            `  "likelyConcern": "<4-6 detailed sentences: what could be causing these symptoms, how they relate to each other, what the duration and severity suggest, and risk factors>",\n` +
            `  "recommendations": [\n` +
            `    "<detailed recommendation 1 with reasoning>",\n` +
            `    "<detailed recommendation 2 with reasoning>",\n` +
            `    "<detailed recommendation 3 with reasoning>",\n` +
            `    "<detailed recommendation 4: when to escalate to emergency care>"\n` +
            `  ]\n` +
            `}`,
        },
      ];

      const raw = await callGemma(messages);
      const parsed = extractJSON(raw);

      return NextResponse.json({
        urgency: parsed.urgency,
        likelyConcern: parsed.likelyConcern,
        recommendations: parsed.recommendations,
        note: `Assessed by MedGemma. Preliminary AI guidance, not a medical diagnosis.`,
      });
    }

    if (type === 'firstaid') {
      const { problem, details } = body;

      const messages: Message[] = [
        {
          role: 'system',
          content:
                'You are MedGemma, a medical AI at a university health centre. ' +
                'You provide thorough, clinically informed first-aid guidance. ' +
                'Always respond with ONLY a raw JSON object — no markdown fences, no extra text.',
        },
        {
          role: 'user',
          content:
            `A student needs first-aid help.\n` +
            `- Problem: ${problem}\n` +
            `- Details: ${details || 'none provided'}\n\n` +
            `Provide detailed first-aid guidance. Respond with a JSON object:\n` +
            `{\n` +
            `  "summary": "<3-4 sentences assessing the situation and immediate priority>",\n` +
            `  "tips": [\n` +
            `    "<detailed step 1 with reasoning>",\n` +
            `    "<detailed step 2 with reasoning>",\n` +
            `    "<detailed step 3 with reasoning>",\n` +
            `    "<detailed step 4: what NOT to do and why>"\n` +
            `  ],\n` +
            `  "getHelp": ["<detailed warning signs requiring immediate professional attention>"]\n` +
            `}`,
        },
      ];

      const raw = await callGemma(messages);
      const parsed = extractJSON(raw);

      return NextResponse.json({
        summary: parsed.summary,
        tips: parsed.tips,
        getHelp: parsed.getHelp,
        note: `Assessed by MedGemma. Not a substitute for emergency care.`
      });
    }

    return NextResponse.json({ error: 'Invalid request type.' }, { status: 400 });
  } catch (err) {
    let message = 'Unknown error';
    if (err instanceof Error) {
      message = err.message;
      const cause = (err as unknown as { cause?: Error }).cause;
      if (cause) message += ' | Cause: ' + cause.message;
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}