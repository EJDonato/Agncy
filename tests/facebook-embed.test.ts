import assert from "node:assert/strict";
import test from "node:test";
import { getFacebookEmbedUrl } from "../lib/analytics/facebook-embed";

test("uses the Facebook video plugin for Reel permalinks", () => {
  const embed = getFacebookEmbedUrl("https://www.facebook.com/reel/123456/", "Reel");
  assert.ok(embed?.startsWith("https://www.facebook.com/plugins/video.php?"));
  assert.match(embed ?? "", /href=https%3A%2F%2Fwww.facebook.com%2Freel%2F123456%2F/);
});

test("uses the Facebook post plugin for regular posts", () => {
  const embed = getFacebookEmbedUrl("https://www.facebook.com/example/posts/123", "Content");
  assert.ok(embed?.startsWith("https://www.facebook.com/plugins/post.php?"));
});

test("rejects non-Facebook and insecure permalinks", () => {
  assert.equal(getFacebookEmbedUrl("https://example.com/post/123", "Content"), null);
  assert.equal(getFacebookEmbedUrl("http://facebook.com/post/123", "Content"), null);
});
