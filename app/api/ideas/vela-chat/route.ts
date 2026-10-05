import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { SendVelaMessageSchema } from "@/lib/ideas/vela-chat-contract";
import { loadVelaChat, sendVelaMessage, toVelaServiceError } from "@/lib/ideas/vela-chat-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function failureResponse(error: unknown) {
  if (error instanceof z.ZodError || error instanceof SyntaxError) {
    return NextResponse.json({ success: false, error: { code: "invalid_request", message: "That Vela message was invalid.", retryAfterSeconds: null } }, { status: 400 });
  }
  const failure = toVelaServiceError(error);
  return NextResponse.json({ success: false, error: { code: failure.code, message: failure.message, retryAfterSeconds: failure.retryAfterSeconds } }, { status: failure.httpStatus });
}

export function GET() {
  try {
    return NextResponse.json({ success: true, turns: loadVelaChat() });
  } catch (error) {
    return failureResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const input = SendVelaMessageSchema.parse(await request.json());
    const turn = await sendVelaMessage(input);
    if (turn.action === "generate") revalidatePath("/ideas");
    return NextResponse.json({ success: true, turn });
  } catch (error) {
    return failureResponse(error);
  }
}
