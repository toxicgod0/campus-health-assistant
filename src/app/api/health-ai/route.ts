import { NextRequest, NextResponse } from 'next/server';

// ─── Configuration ────────────────────────────────────────────────────────────
// To switch between cloud and local, change AI_PROVIDER in .env.local.
// cloud → calls HuggingFace router (internet required, uses free quota)
// local → calls the Python server running on this PC at localhost:8000
const AI_PROVIDER = process.env.AI_PROVIDER ?? 'cloud';

const HF_TOKEN = process.env.HUGGINGFACE_API_TOKEN;
const MODEL = 'google/medgemma-4b-it';
const CLOUD_URL = `https://router.huggingface.co/models/${MODEL}/v1/chat/completions`;
const LOCAL_URL = 'http://localhost:8000/chat';

// ─── Shared message type ──────────────────────────────────────────────────────
type Message = { role: 'system' | 'user'; content: string };

// ─── Core caller — picks cloud or local automatically ─────────────────────────
async function callMedGemma(messages: Message[]): Promise<string> {
  if (AI_PROVIDER === 'local') {
    // Calls the Python FastAPI server (server.py in medgemma-backend)
    const res = await fetch(LOCAL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Local server error ${res.status}: ${err}`);
    }
    const data = await res.json();
    return data.response ?? '';
  }

  // Default: cloud (HuggingFace router)
  if (!HF_TOKEN) throw new Error('HUGGINGFACE_API_TOKEN is not set in .env.local');
  const res = await fetch(CLOUD_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${HF_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      max_tokens: 600,
      temperature: 0.4,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`HuggingFace API error ${res.status}: ${err}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
}

// ─── JSON extractor ────────────────────────────────────────────────────────────
function extractJSON(raw: string) {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('MedGemma did not return a valid JSON response. Raw: ' + raw.slice(0, 200));
  return JSON.parse(match[0]);
}

// ─── Route handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { type } = body;

  try {
    // ── Symptom guidance ──────────────────────────────────────────────────────
    if (type === 'symptom') {
      const { symptoms, additionalDetails, duration, severity } = body;

      const messages: Message[] = [
        {
          role: 'system',
          content:
            'You are MedGemma, a clinical medical AI embedded in a university campus health platform. ' +
            'Your job is to assess a student\'s reported symptoms carefully and provide personalised guidance. ' +
            'Always reason about the specific symptoms described before concluding. Be direct, compassionate, and specific. ' +
            'Never give generic advice — tie every point to the actual symptoms and details the student provided.',
        },
        {
          role: 'user',
          content:
            `A student at Maseno University has reported the following health situation:\n\n` +
            `Symptoms: ${symptoms.length > 0 ? symptoms.join(', ') : 'not specified'}\n` +
            `Additional details: ${additionalDetails || 'none provided'}\n` +
            `Duration: ${duration}\n` +
            `Severity: ${severity}\n\n` +
            `Based on these specific symptoms and details, assess the urgency and provide guidance.\n\n` +
            `Respond with ONLY a raw JSON object — no markdown, no explanation outside the JSON:\n` +
            `{\n` +
            `  "urgency": "Urgent attention suggested" or "Medical review recommended soon" or "Monitor and use supportive care",\n` +
            `  "likelyConcern": "2-3 sentences specifically about what these symptoms may indicate and why",\n` +
            `  "recommendations": ["specific step tied to their symptoms", "specific step 2", "specific step 3"]\n` +
            `}`,
        },
      ];

      const raw = await callMedGemma(messages);
      const parsed = extractJSON(raw);

      return NextResponse.json({
        urgency: parsed.urgency,
        likelyConcern: parsed.likelyConcern,
        recommendations: parsed.recommendations,
        note: `Assessed by MedGemma (${AI_PROVIDER} mode). This is preliminary AI guidance, not a medical diagnosis.`,
      });
    }

    // ── First-aid guidance ────────────────────────────────────────────────────
    if (type === 'firstaid') {
      const { problem, details } = body;

      const messages: Message[] = [
        {
          role: 'system',
          content:
            'You are MedGemma, a clinical medical AI embedded in a university campus health platform. ' +
            'Provide precise, actionable first-aid guidance tailored to the exact situation described. ' +
            'Be specific — do not give generic steps that could apply to any injury. ' +
            'Base every tip on the details the student has provided.',
        },
        {
          role: 'user',
          content:
            `A student at Maseno University needs first-aid guidance.\n\n` +
            `Problem type: ${problem}\n` +
            `Details: ${details || 'none provided'}\n\n` +
            `Provide specific first-aid advice for this exact situation.\n\n` +
            `Respond with ONLY a raw JSON object — no markdown, no explanation outside the JSON:\n` +
            `{\n` +
            `  "summary": "2-3 sentences assessing this specific situation and the immediate priority",\n` +
            `  "tips": ["specific step 1 for this case", "specific step 2", "specific step 3"],\n` +
            `  "getHelp": ["specific warning sign to watch for and exactly when to seek emergency help"]\n` +
            `}`,
        },
      ];

      const raw = await callMedGemma(messages);
      const parsed = extractJSON(raw);

      return NextResponse.json({
        summary: parsed.summary,
        tips: parsed.tips,
        getHelp: parsed.getHelp,
        note: `Assessed by MedGemma (${AI_PROVIDER} mode). Not a substitute for emergency care.`,
      });
    }

    return NextResponse.json({ error: 'Invalid request type.' }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
