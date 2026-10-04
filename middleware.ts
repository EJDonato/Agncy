import { NextRequest, NextResponse } from "next/server";

const OBSOLETE_ANALYTICS_ACTION_IDS = new Set([
  "005ee2cea12fcb7b4e15a7f74e30d9a6b6a4ede72d",
  "00ae6fc8230aefd25ad9beaa65903fd367ee56b3e8",
]);

export function middleware(request: NextRequest) {
  const actionId = request.headers.get("next-action");
  if (request.method !== "POST" || !actionId || !OBSOLETE_ANALYTICS_ACTION_IDS.has(actionId)) {
    return NextResponse.next();
  }

  const body = `:N${Date.now()}\n0:{"a":"$@1","f":"","b":"development"}\n1:null\n`;
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Cache-Control": "no-store, must-revalidate",
      "Content-Type": "text/x-component",
      "x-action-revalidated": "[[],0,0]",
    },
  });
}

export const config = { matcher: "/analytics" };
