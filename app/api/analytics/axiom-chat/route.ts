import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { SendAxiomMessageSchema } from "@/lib/analytics/axiom-chat-contract";
import { loadAxiomChat, sendAxiomMessage, toAxiomServiceError } from "@/lib/analytics/axiom-chat-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function failureResponse(error: unknown) {
  if (error instanceof z.ZodError || error instanceof SyntaxError) {
    return NextResponse.json({ success: false, error: { code: "invalid_request", message: "That question request was invalid.", retryAfterSeconds: null } }, { status: 400 });
  }
  const failure = toAxiomServiceError(error);
  return NextResponse.json({ success: false, error: { code: failure.code, message: failure.message, retryAfterSeconds: failure.retryAfterSeconds } }, { status: failure.httpStatus });
}

export function GET() {
  try {
    return NextResponse.json({ success: true, turns: loadAxiomChat() });
  } catch (error) {
    return failureResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const input = SendAxiomMessageSchema.parse(await request.json());
    return NextResponse.json({ success: true, turn: await sendAxiomMessage(input) });
  } catch (error) {
    return failureResponse(error);
  }
}
