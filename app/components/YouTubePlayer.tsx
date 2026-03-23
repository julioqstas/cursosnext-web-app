'use client'

interface YouTubePlayerProps {
  youtubeId: string
  title: string
}

function extractYouTubeId(urlOrId: string) {
  // If it's already 11 chars and has no slashes, assume it's the raw ID
  if (urlOrId.length === 11 && !urlOrId.includes('/')) return urlOrId
  // Otherwise try to extract it from various URL formats
  const match = urlOrId.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})/)
  return match ? match[1] : urlOrId
}

export default function YouTubePlayer({ youtubeId, title }: YouTubePlayerProps) {
  const parsedId = extractYouTubeId(youtubeId)
  const src = `https://www.youtube.com/embed/${parsedId}?modestbranding=1&controls=0&rel=0&iv_load_policy=3&showinfo=0&disablekb=1`

  return (
    <div className="relative w-full bg-black aspect-video">
      <iframe
        src={src}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 w-full h-full border-0"
      />
      {/* Protective overlay — blocks clicks to YouTube UI */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        aria-hidden="true"
      />
    </div>
  )
}
