import React from "react";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";

interface ChatMarkdownProps {
  content: string;
}

export function ChatMarkdown({ content }: ChatMarkdownProps) {
  return (
    <div className="min-w-0 space-y-2 break-words [&_a]:font-medium [&_a]:text-[#1f54fc] [&_a]:underline [&_a]:underline-offset-2 [&_blockquote]:border-l-2 [&_blockquote]:border-slate-300 [&_blockquote]:pl-3 [&_blockquote]:italic [&_code]:rounded [&_code]:bg-slate-200/70 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_h1]:text-sm [&_h1]:font-semibold [&_h1]:text-slate-950 [&_h2]:text-[13px] [&_h2]:font-semibold [&_h2]:text-slate-950 [&_h3]:font-semibold [&_h3]:text-slate-900 [&_li]:pl-0.5 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5 [&_p]:whitespace-pre-wrap [&_strong]:font-semibold [&_strong]:text-slate-950 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        skipHtml
        components={{
          a: ({ node, ...props }) => {
            void node;
            return <a {...props} rel="noreferrer noopener" target="_blank" />;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
