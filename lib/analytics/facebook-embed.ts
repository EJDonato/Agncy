export function getFacebookEmbedUrl(permalink: string, postType: string | null): string | null {
  try {
    const url = new URL(permalink);
    const isFacebook = url.hostname === "facebook.com" || url.hostname.endsWith(".facebook.com") || url.hostname === "fb.watch";
    if (url.protocol !== "https:" || !isFacebook) return null;

    const isVideo = postType === "Reel" || postType === "Video" || /\/(reel|videos)\//i.test(url.pathname);
    const plugin = isVideo ? "video.php" : "post.php";
    const params = new URLSearchParams({ href: url.toString(), show_text: "true", width: "500" });
    return `https://www.facebook.com/plugins/${plugin}?${params.toString()}`;
  } catch {
    return null;
  }
}
