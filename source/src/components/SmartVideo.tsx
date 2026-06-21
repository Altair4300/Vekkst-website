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
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Attempt autoplay on mount and when src changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setIsLoading(true);
    setHasError(false);
    setIsPlaying(false);
    setIsMuted(true);

    // Try to autoplay muted
    video.muted = true;
    const playPromise = video.play();
    if (playPromise) {
      playPromise.then(() => {
        setIsPlaying(true);
        setIsMuted(true);
      }).catch(() => {
        // Autoplay blocked or not ready, will show play button
        setIsPlaying(false);
      });
    }
  }, [src]);

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
          } else {
            // Scrolled into view - try to autoplay muted
            video.muted = true;
            video.play().then(() => {
              setIsPlaying(true);
              setIsMuted(true);
            }).catch(() => {
              // Autoplay blocked or still loading
            });
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  // Handle click on video
  const handleClick = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying && !isMuted) {
      // Playing with sound - pause
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
        setIsPlaying(false);
      });
    }
  }, [isPlaying, isMuted]);

  // Handle video events
  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoading(false);
    setIsPlaying(false);
  }, []);

  const handleCanPlay = useCallback(() => {
    setHasError(false);
    setIsLoading(false);
  }, []);

  const handleLoadedData = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
  }, []);

  const handleWaiting = useCallback(() => {
    setIsLoading(true);
  }, []);

  const handlePlaying = useCallback(() => {
    setIsLoading(false);
    setIsPlaying(true);
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
        onCanPlay={handleCanPlay}
        onLoadedData={handleLoadedData}
        onWaiting={handleWaiting}
        onPlaying={handlePlaying}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Loading state */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Error state - show poster with retry hint */}
      {hasError && poster && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <img src={poster} alt="Video poster" className="w-full h-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <div className="text-center">
              <svg className="w-10 h-10 text-red-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
              <p className="text-white text-sm font-medium">Video unavailable</p>
              <p className="text-gray-400 text-xs mt-1">Click to retry</p>
            </div>
          </div>
        </div>
      )}

      {/* Error state without poster */}
      {hasError && !poster && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <div className="text-center">
            <svg className="w-10 h-10 text-red-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            <p className="text-white text-sm">Video unavailable</p>
          </div>
        </div>
      )}

      {/* Play overlay when not playing and not loading */}
      {!isPlaying && !isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
          <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <svg className="w-7 h-7 text-[#E60012] ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>
      )}

      {/* Mute indicator when playing muted */}
      {isPlaying && isMuted && !hasError && (
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
