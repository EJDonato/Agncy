import { ExternalLink, ImageOff } from "lucide-react";
import { getFacebookEmbedUrl } from "@/lib/analytics/facebook-embed";

interface PostEmbedProps {
  permalink: string | null;
  postType: string | null;
  title: string;
}

export function PostEmbed({ permalink, postType, title }: PostEmbedProps) {
  const embedUrl = permalink ? getFacebookEmbedUrl(permalink, postType) : null;

  if (!permalink || !embedUrl) {
    return (
      <div className="min-h-48 rounded-lg border border-dashed border-border-subtle bg-surface-raised flex flex-col items-center justify-center gap-2 text-center p-6">
        <ImageOff className="w-6 h-6 text-slate-500" />
        <p className="text-xs text-slate-400">A Facebook preview is not available for this permalink.</p>
        {permalink && <PostLink permalink={permalink} title={title} />}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="w-full max-w-[500px] overflow-hidden rounded-lg border border-border-subtle bg-white">
        <iframe
          src={embedUrl}
          title={`Facebook post preview: ${title}`}
          width="500"
          height={postType === "Reel" || postType === "Video" ? "580" : "620"}
          className="block w-full max-w-full"
          loading="lazy"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
      <p className="text-[11px] text-slate-500">Public posts load from Facebook. Restricted or removed posts may not display.</p>
      <PostLink permalink={permalink} title={title} />
    </div>
  );
}

function PostLink({ permalink, title }: { permalink: string; title: string }) {
  return (
    <a href={permalink} target="_blank" rel="noreferrer" aria-label={`Open ${title} on Facebook`} className="inline-flex items-center gap-1.5 text-xs text-brand-amber hover:underline">
      <ExternalLink className="w-3.5 h-3.5" /> Open original post
    </a>
  );
}
