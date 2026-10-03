import { NextRequest, NextResponse } from "next/server";
import { importMetaCsvFile } from "@/lib/analytics/importer";
import { revalidatePath } from "next/cache";

const MAX_CSV_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file was uploaded." },
        { status: 400 }
      );
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {
      return NextResponse.json(
        { success: false, error: "Only .csv files are supported." },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        { success: false, error: "The uploaded CSV file is empty (0 bytes)." },
        { status: 400 }
      );
    }

    if (file.size > MAX_CSV_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: "File exceeds the 25MB maximum size limit." },
        { status: 413 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await importMetaCsvFile(buffer, file.name);

    // Invalidate analytics caches
    revalidatePath("/analytics");
    revalidatePath("/");

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to process CSV file.";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
