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
  const src = `https://www.youtube.com/embed/${parsedId}?modestbranding=1&rel=0&fs=1`

  return (
    <div className="w-full bg-slate-900 aspect-video rounded-3xl md:rounded-[2.5rem] overflow-hidden shadow-sm">
      <iframe
        src={src}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
        allowFullScreen={true}
        className="w-full h-full border-0"
      />
    </div>
  )
}
