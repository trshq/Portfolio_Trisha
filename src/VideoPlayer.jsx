import { useEffect, useRef, useState } from "react";

// YouTube supplies the real artwork. Only the thumbnail loads before a click;
// the player preserves the video's proportions inside the stable 16:9 stage.
export default function VideoPlayer({ project }) {
  const [loaded, setLoaded] = useState(false);
  const [thumbnailUnavailable, setThumbnailUnavailable] = useState(false);
  const playerRef = useRef(null);
  const videoId = project.youtubeId || project.youtubeUrl.match(/(?:shorts\/|youtu\.be\/|[?&]v=)([\w-]{11})/)?.[1];
  useEffect(() => { if (loaded) playerRef.current?.focus(); }, [loaded]);
  return <div className="youtube-stage">
    <div className="youtube-screen">
      {loaded ? <iframe
        ref={playerRef}
        src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0`}
        title={project.name}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      /> : <button className="youtube-load" type="button" aria-label={`Play video: ${project.name}`} onClick={() => setLoaded(true)}>
        {!thumbnailUnavailable && <img src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`} alt="" width="480" height="360" loading="lazy" decoding="async" onError={() => setThumbnailUnavailable(true)} />}
        <span className="youtube-play-icon" aria-hidden="true"><svg width="34" height="34" viewBox="0 0 32 32"><path d="m12 8 12 8-12 8Z" fill="currentColor" /></svg></span>
        {thumbnailUnavailable && <span className="youtube-thumbnail-fallback">Play video · YouTube</span>}
      </button>}
    </div>
  </div>;
}
