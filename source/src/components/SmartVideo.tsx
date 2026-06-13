import { useRef, useEffect, useCallback, useState } from "react";

interface SmartVideoProps {
  src: string;
  className?: string;
  poster?: string;
}

// Global state to track which video is currently unmuted
let globalActiveVideo: HTMLVideoElement | null = null;

function setActiveVideo(video: HTMLVideoElement | null) {
  if (globalActiveVideo && globalActiveVideo !== video) {
    globalActiveVideo.muted = true;
    globalActiveVideo.pause();
  }
  globalActiveVideo = video;
}

export default function SmartVideo({ src, className = "", poster }: SmartVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  // Intersection Observer - detect when video is in viewport
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            // Scrolled out of view - pause and mute
            video.pause();
            video.muted = true;
            setIsPlaying(false);
            setIsMuted(true);
            if (globalActiveVideo === video) {
              globalActiveVideo = null;
            }
          }
        });
      },
      { threshold: 0.3 } // At least 30% visible
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  // Handle click on video
  const handleClick = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying && !isMuted) {
      // Already playing with sound - pause
      video.pause();
      setIsPlaying(false);
      setActiveVideo(null);
    } else if (isPlaying && isMuted) {
      // Playing muted - unmute
      video.muted = false;
      setIsMuted(false);
      setActiveVideo(video);
    } else {
      // Not playing - start with sound
      video.muted = false;
      setIsMuted(false);
      setActiveVideo(video);
      video.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        // Autoplay blocked, show play button state
        setIsPlaying(false);
      });
    }
  }, [isPlaying, isMuted]);

  // Handle video ending
  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    setIsMuted(true);
    if (globalActiveVideo === videoRef.current) {
      globalActiveVideo = null;
    }
  }, []);

  return (
    <div className="relative group cursor-pointer" onClick={handleClick}>
      <video
        ref={videoRef}
        src={src}
        controls
        loop
        playsInline
        preload="metadata"
        className={className}
        poster={poster}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      {/* Play overlay when not playing */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
          <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <svg className="w-7 h-7 text-[#E60012] ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
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
          Click for sound
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
