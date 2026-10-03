import { notFound } from "next/navigation";
import { getScriptWithVersions } from "@/lib/db/queries/scripts";
import { SplitEditor } from "./_components/split-editor";

interface ScriptPageProps {
  params: Promise<{ id: string }>;
}

export default async function ScriptDetailPage({ params }: ScriptPageProps) {
  const { id } = await params;
  const data = getScriptWithVersions(id);

  if (!data) {
    notFound();
  }

  return (
    <SplitEditor
      script={{
        id: data.script.id,
        title: data.script.title,
        format: data.script.format,
        targetDurationSec: data.script.targetDurationSec,
        status: data.script.status,
      }}
      initialDraftText={data.initialDraft?.fullContent || ""}
      initialFinalText={data.latestFinal?.fullContent || data.initialDraft?.fullContent || ""}
      initialEditSummary={data.diff?.editSummary || null}
    />
  );
}
