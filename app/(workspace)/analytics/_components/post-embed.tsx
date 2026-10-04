"use client";

import { ExternalLink, ImageOff } from "lucide-react";
import { getFacebookEmbedUrl } from "@/lib/analytics/facebook-embed";

interface PostEmbedProps {
  permalink: string | null;
  postType: string | null;
  title: string;
}

export function PostEmbed({ permalink, postType, title }: PostEmbedProps) {
  const embedUrl = permalink ? getFacebookEmbedUrl(permalink, postType) : null;
  const frameHeight = postType === "Reel" || postType === "Video" ? 580 : 620;

  if (!permalink || !embedUrl) {
    return (
      <div className="h-[260px] w-full max-w-[220px] rounded-xl border border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center gap-2 text-center p-4">
        <ImageOff className="w-6 h-6 text-slate-400" />
        <p className="text-xs text-slate-500">A Facebook preview is not available for this permalink.</p>
        {permalink && <PostLink permalink={permalink} title={title} />}
      </div>
    );
  }

  return (
    <div className="w-full max-w-[220px] space-y-2">
      <div className="h-[260px] w-[220px] max-w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <iframe
          src={embedUrl}
          title={`Facebook post preview: ${title}`}
          width="500"
          height={String(frameHeight)}
          className="block origin-top-left scale-[0.44]"
          loading="lazy"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
      <PostLink permalink={permalink} title={title} />
    </div>
  );
}

function PostLink({ permalink, title }: { permalink: string; title: string }) {
  return (
    <a href={permalink} target="_blank" rel="noreferrer" aria-label={`Open ${title} on Facebook`} className="inline-flex items-center gap-1.5 text-[11px] text-brand-amber hover:underline">
      <ExternalLink className="w-3 h-3" /> Open on Facebook
    </a>
  );
}
