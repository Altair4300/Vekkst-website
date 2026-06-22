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
  const [hasError, setHasError] = useState(false);

  // Always preload metadata so the video knows its dimensions and can play
  // On mobile, don't autoplay - just show the play button
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Reset when src changes
    setHasError(false);
    setIsPlaying(false);
    setIsMuted(true);

    // Try muted autoplay (desktop will work, mobile will block)
    video.muted = true;
    video.play().then(() => {
      setIsPlaying(true);
    }).catch(() => {
      // Autoplay blocked - expected on mobile, show play button
      setIsPlaying(false);
    });
  }, [src]);

  // Intersection Observer - pause when scrolled out of view
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
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
  }, []);

  // Handle click - play/pause
  const handleClick = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      // Pause
      video.pause();
      setIsPlaying(false);
    } else {
      // Try to play
      setHasError(false);
      video.muted = false;
      setIsMuted(false);
      video.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        // Still can't play - show error
        setIsPlaying(false);
        setHasError(true);
      });
    }
  }, [isPlaying]);

  // Handle error
  const handleError = useCallback(() => {
    setHasError(true);
    setIsPlaying(false);
  }, []);

  return (
    <div className="relative group cursor-pointer" onClick={handleClick}>
      <video
        ref={videoRef}
        src={src}
        loop
        playsInline
        muted={isMuted}
        preload="metadata"
        className={className}
        poster={poster}
        onError={handleError}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Error state - show poster with play button */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center">
          {poster && <img src={poster} alt="Video poster" className="w-full h-full object-cover" />}
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg mx-auto mb-3">
                <Play className="w-7 h-7 text-[#E60012] ml-1" fill="currentColor" />
              </div>
              <p className="text-white text-sm font-medium">Tap to play</p>
            </div>
          </div>
        </div>
      )}

      {/* Play button overlay when not playing */}
      {!isPlaying && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
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
