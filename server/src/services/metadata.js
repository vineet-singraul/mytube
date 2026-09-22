// YouTube ka public oEmbed endpoint istemal karte hain (koi API key ya
// yt-dlp/ffmpeg ki zaroorat nahi) taaki title/channel mil jaaye. Thumbnail
// seedha YouTube ke apne CDN se URL bana ke le lete hain.
export async function fetchYoutubeMetadata(youtubeId, youtubeUrl) {
  const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(youtubeUrl)}&format=json`;
  const res = await fetch(oembedUrl);
  if (!res.ok) {
    throw new Error('Video nahi mila (private, deleted, ya invalid link ho sakta hai)');
  }
  const data = await res.json();
  return {
    title: data.title || youtubeUrl,
    channel: data.author_name || '',
    thumbnail: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`,
  };
}
