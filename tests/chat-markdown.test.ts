import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ChatMarkdown } from "../components/chat-markdown";

test("renders persona Markdown as readable semantic HTML", () => {
  const html = renderToStaticMarkup(createElement(ChatMarkdown, {
    content: "**Finding**\n\n- First\n- Second\nNext line",
  }));

  assert.match(html, /<strong>Finding<\/strong>/);
  assert.match(html, /<ul>/);
  assert.match(html, /<br\/>\s*Next line/);
});

test("does not render raw HTML from persona responses", () => {
  const html = renderToStaticMarkup(createElement(ChatMarkdown, {
    content: "Before <script>alert('no')</script> after",
  }));

  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /Before alert/);
});
