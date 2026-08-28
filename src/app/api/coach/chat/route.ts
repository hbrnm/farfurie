import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `Ești "Coach Farfurie", un asistent nutrițional prietenos, empatic și extrem de practic, specializat pe alimentația din România.
Cunoști produsele locale și ingredientele accesibile din supermarketurile din România (lactate naturale, conserve de pește, leguminoase, carnea slabă) și mâncărurile tradiționale (sarmale, ciorbă de burtă, mici, mămăligă, zacuscă).

Reguli:
1. Răspunde direct, concis și încurajator (2-4 propoziții). Fără teorie plictisitoare.
2. Înțelege contextul nutrițional al utilizatorului furnizat în request (calorii rămase azi, proteine, grame, stare sărbători).
3. Oferă opțiuni concrete cu ingrediente generale curate și accesibile.
4. Fără vinovăție! Dacă utilizatorul a băut o bere sau a mâncat o prăjitură, încurajează-l să logheze și să ajusteze cina cu proteină.`;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      prompt: string;
      context?: {
        remainingKcal?: number;
        remainingProtein?: number;
        eatenKcal?: number;
        goalKcal?: number;
        holidayMode?: boolean;
      };
    };

    if (!body.prompt || body.prompt.trim().length === 0) {
      return NextResponse.json({ error: "missing_prompt" }, { status: 400 });
    }

    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      return NextResponse.json(
        {
          reply:
            "Pentru conversații live cu Gemini AI, adaugă GEMINI_API_KEY în mediul tău de producție sau .env.local.",
        },
        { status: 200 },
      );
    }

    const ai = new GoogleGenAI({ apiKey: key });

    const contextStr = body.context
      ? `\nContext utilizator: Mai are ${body.context.remainingKcal ?? 0} kcal, ${body.context.remainingProtein ?? 0}g proteină. Consumat azi: ${body.context.eatenKcal ?? 0} / ${body.context.goalKcal ?? 2000} kcal. Mod sărbători: ${body.context.holidayMode ? "ACTIV" : "INACTIV"}.`
      : "";

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: `${SYSTEM_PROMPT}${contextStr}\n\nÎntrebarea utilizatorului: ${body.prompt}` },
          ],
        },
      ],
      config: {
        temperature: 0.7,
      },
    });

    const reply = response.text?.trim() || "Nu am putut genera un răspuns. Încearcă din nou.";
    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({ error: "chat_failed" }, { status: 500 });
  }
}
