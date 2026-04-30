import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "@src/config/env";
import { ocrResultSchema, type OcrResult } from "@src/utils/validators";

const MODEL_NAME = "gemini-2.0-flash";
const REQUEST_TIMEOUT_MS = 30_000;

export interface OcrInput {
  readonly imageBase64: string;
  readonly mimeType: "image/jpeg" | "image/png";
}

export interface OcrSuccess {
  readonly status: "ok";
  readonly result: OcrResult;
}

export interface OcrFailure {
  readonly status: "error";
  readonly reason:
    | "low_confidence"
    | "invalid_response"
    | "network"
    | "unauthorized"
    | "timeout"
    | "rate_limited";
  readonly detail?: string;
}

export type OcrResponse = OcrSuccess | OcrFailure;

export const OCR_PROMPT = `You are extracting structured data from a Hungarian receipt photo.
Return ONLY valid JSON matching this exact shape:
{
  "merchant": string,
  "merchantTaxId": string | null,
  "date": "YYYY.MM.DD",
  "grossAmount": integer (HUF),
  "netAmount": integer (HUF),
  "vatRate": 0.05 | 0.18 | 0.27,
  "vatAmount": integer (HUF),
  "items": [{ "name": string, "grossAmount": integer, "netAmount": integer, "vatRate": 0.05 | 0.18 | 0.27 }]
}
Rules:
- All HUF amounts MUST be integers (no decimals).
- gross - net MUST equal vat (±1 HUF rounding).
- merchantTaxId is the adószám if present, else null.
- vatRate is the dominant rate on the receipt.
- If a field is unreadable, omit the receipt entirely.
- If the document is not a receipt or is too blurry, return: {"error": "unreadable"}.
`;

const stripFences = (text: string): string => {
  const trimmed = text.trim();
  if (trimmed.startsWith("```")) {
    return trimmed.replace(/^```(?:json)?/, "").replace(/```$/, "").trim();
  }
  return trimmed;
};

const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), ms),
    ),
  ]);
};

const mapNetworkError = (e: unknown): OcrFailure => {
  const message = e instanceof Error ? e.message : String(e);
  if (message === "timeout") {
    return { status: "error", reason: "timeout" };
  }
  if (/429|rate/i.test(message)) {
    return { status: "error", reason: "rate_limited", detail: message };
  }
  if (/401|403|api key/i.test(message)) {
    return { status: "error", reason: "unauthorized", detail: message };
  }
  return { status: "error", reason: "network", detail: message };
};

export const parseOcrResponse = (raw: unknown): OcrResponse => {
  if (
    raw &&
    typeof raw === "object" &&
    "error" in raw &&
    (raw as { error: unknown }).error === "unreadable"
  ) {
    return { status: "error", reason: "low_confidence" };
  }
  const parsed = ocrResultSchema.safeParse(raw);
  if (parsed.success) {
    return { status: "ok", result: parsed.data };
  }
  return {
    status: "error",
    reason: "invalid_response",
    detail: parsed.error.issues.map((i) => i.message).join("; "),
  };
};

export const runOcr = async (input: OcrInput): Promise<OcrResponse> => {
  if (!env.geminiApiKey) {
    return {
      status: "error",
      reason: "unauthorized",
      detail: "EXPO_PUBLIC_GEMINI_API_KEY is not set",
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(env.geminiApiKey);
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    });

    const response = await withTimeout(
      model.generateContent([
        { text: OCR_PROMPT },
        {
          inlineData: { data: input.imageBase64, mimeType: input.mimeType },
        },
      ]),
      REQUEST_TIMEOUT_MS,
    );

    const text = stripFences(response.response.text());
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      return {
        status: "error",
        reason: "invalid_response",
        detail: "Gemini returned non-JSON output",
      };
    }
    return parseOcrResponse(parsed);
  } catch (e) {
    return mapNetworkError(e);
  }
};
