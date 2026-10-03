import { notFound } from "next/navigation";
import { getScriptWithVersions } from "@/lib/db/queries/scripts";
import { SingleScriptEditor } from "./_components/single-script-editor";

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
    <SingleScriptEditor
      script={{
        id: data.script.id,
        title: data.script.title,
        format: data.script.format,
        targetDurationSec: data.script.targetDurationSec,
        status: data.script.status,
      }}
      baselineText={data.latestAiVersion?.fullContent || ""}
      initialContent={data.latestEditable?.fullContent || ""}
      initialEditSummary={data.diff?.editSummary || null}
    />
  );
}
