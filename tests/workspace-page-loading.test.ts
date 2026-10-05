import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { WorkspacePageLoading } from "../components/workspace-page-loading";

test("workspace navigation skeleton exposes an accessible loading state", () => {
  const html = renderToStaticMarkup(createElement(WorkspacePageLoading));

  assert.match(html, /role="status"/);
  assert.match(html, /aria-label="Loading destination page"/);
  assert.match(html, /Loading destination page/);
  assert.match(html, /motion-safe:animate-pulse/);
});
