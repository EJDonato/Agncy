import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { SendSeraMessageSchema } from "@/lib/scripts/sera-chat-contract";
import { sendSeraMessage, toSeraServiceError } from "@/lib/scripts/sera-chat-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const input = SendSeraMessageSchema.parse(await request.json());
    const result = await sendSeraMessage(input);
    revalidatePath(`/scripts/${input.scriptId}`);
    revalidatePath("/scripts");
    return NextResponse.json({ success: true, result });
  } catch (error) {
    if (error instanceof z.ZodError || error instanceof SyntaxError) {
      return NextResponse.json({
        success: false,
        error: { code: "invalid_request", message: "That message request was invalid.", retryAfterSeconds: null },
      }, { status: 400 });
    }
    const failure = toSeraServiceError(error);
    return NextResponse.json({
      success: false,
      error: { code: failure.code, message: failure.message, retryAfterSeconds: failure.retryAfterSeconds },
    }, { status: failure.httpStatus });
  }
}
