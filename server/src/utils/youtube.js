const ID_PATTERNS = [
  /(?:youtube\.com\/watch\?v=)([\w-]{11})/,
  /(?:youtube\.com\/live\/)([\w-]{11})/,
  /(?:youtu\.be\/)([\w-]{11})/,
  /(?:youtube\.com\/shorts\/)([\w-]{11})/,
  /(?:youtube\.com\/embed\/)([\w-]{11})/,
];

export function extractYoutubeId(url) {
  for (const pattern of ID_PATTERNS) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}
