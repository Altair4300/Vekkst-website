import { useRef, useEffect, useCallback, useState } from "react";
import { Play } from "lucide-react";

interface SmartVideoProps {
  src: string;
  className?: string;
  poster?: string;
}

export default function SmartVideo({ src, className = "", poster }: SmartVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  // Try muted autoplay on mount (desktop usually works, mobile is blocked)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
  }, [src]);

  // Pause when scrolled out of view
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting && isPlaying) {
            video.pause();
            video.muted = true;
            setIsPlaying(false);
            setIsMuted(true);
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [isPlaying]);

  // Click to play/pause
  const handleClick = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.muted = false;
      setIsMuted(false);
      video.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  }, [isPlaying]);

  return (
    <div className="relative group cursor-pointer" onClick={handleClick}>
      <video
        ref={videoRef}
        src={src}
        loop
        playsInline
        muted={isMuted}
        preload="auto"
        className={className}
        poster={poster}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Play button overlay when not playing */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
          <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Play className="w-7 h-7 text-[#E60012] ml-1" fill="currentColor" />
          </div>
        </div>
      )}

      {/* Mute indicator when playing muted */}
      {isPlaying && isMuted && (
        <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"/>
          </svg>
          Tap for sound
        </div>
      )}

      {/* Sound on indicator */}
      {isPlaying && !isMuted && (
        <div className="absolute top-3 right-3 bg-[#E60012]/80 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/>
          </svg>
          Sound On
        </div>
      )}
    </div>
  );
}
