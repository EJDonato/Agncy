import { after, NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  createPerformanceAnalysisJob,
  getLatestPerformanceAnalysisJob,
  getPerformanceAnalysisJob,
  runPerformanceAnalysisJob,
} from "@/lib/analytics/performance-analysis-jobs";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const JobQuerySchema = z.object({ id: z.string().min(1).max(100).optional() });

function errorResponse(error: unknown) {
  const isInvalidRequest = error instanceof z.ZodError;
  const message = isInvalidRequest
    ? "The performance analysis job request was invalid."
    : error instanceof Error ? error.message : "Could not access the performance analysis job.";
  return NextResponse.json({ success: false, error: message }, { status: isInvalidRequest ? 400 : 500 });
}

export function GET(request: NextRequest) {
  try {
    const query = JobQuerySchema.parse({ id: request.nextUrl.searchParams.get("id") ?? undefined });
    const job = query.id ? getPerformanceAnalysisJob(query.id) : getLatestPerformanceAnalysisJob();
    return NextResponse.json({ success: true, job });
  } catch (error) {
    return errorResponse(error);
  }
}

export function POST() {
  try {
    const result = createPerformanceAnalysisJob();
    if (result.isNew) after(() => runPerformanceAnalysisJob(result.job.id));
    return NextResponse.json({ success: true, job: result.job }, { status: 202 });
  } catch (error) {
    return errorResponse(error);
  }
}
