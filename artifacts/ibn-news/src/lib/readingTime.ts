export function readingTime(content: string): string {
  if (!content) return "1 min read";
  const words = content.trim().split(/\s+/).length;
  const mins = Math.max(1, Math.round(words / 238));
  return `${mins} min read`;
}