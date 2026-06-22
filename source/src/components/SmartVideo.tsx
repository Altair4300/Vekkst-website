import { useRef, useEffect, useCallback, useState } from "react";
import { Play } from "lucide-react";

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
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile on mount
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Reset state when src changes
  useEffect(() => {
    setIsLoading(false);
    setHasError(false);
    setIsPlaying(false);
    setIsMuted(true);
    setRetryCount(0);
  }, [src]);

  // Intersection Observer - only autoplay on desktop
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
          } else if (!isMobile) {
            // Desktop: try to autoplay muted
            video.muted = true;
            video.play().then(() => {
              setIsPlaying(true);
              setIsMuted(true);
            }).catch(() => {
              // Autoplay blocked
            });
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [isMobile]);

  // Load video with retry
  const loadVideo = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    setIsLoading(true);
    setHasError(false);

    // On mobile, load with preload="metadata" first
    if (isMobile) {
      video.preload = "metadata";
    } else {
      video.preload = "auto";
    }

    video.load();

    // Set a timeout for loading
    const timeout = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        if (retryCount < 2) {
          setRetryCount((c) => c + 1);
          loadVideo(); // Retry
        } else {
          setHasError(true);
        }
      }
    }, 15000); // 15 second timeout for large files

    return () => clearTimeout(timeout);
  }, [isMobile, retryCount, isLoading]);

  // Handle click on video / poster
  const handleClick = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    // On first click or if not loaded, load the video
    if (!video.src || video.readyState === 0) {
      loadVideo();
      return;
    }

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
      setIsLoading(true);
      video.play().then(() => {
        setIsPlaying(true);
        setIsLoading(false);
      }).catch(() => {
        setIsPlaying(false);
        setIsLoading(false);
        setHasError(true);
      });
    }
  }, [isPlaying, isMuted, loadVideo]);

  // Handle video events
  const handleError = useCallback(() => {
    setIsLoading(false);
    if (retryCount < 2) {
      setRetryCount((c) => c + 1);
      // Retry after a short delay
      setTimeout(() => {
        const video = videoRef.current;
        if (video) {
          video.load();
        }
      }, 1000);
    } else {
      setHasError(true);
    }
  }, [retryCount]);

  const handleCanPlay = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
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

  const handleStalled = useCallback(() => {
    // Network stalled - show loading but don't error immediately
    setIsLoading(true);
  }, []);

  return (
    <div className="relative group cursor-pointer" onClick={handleClick}>
      <video
        ref={videoRef}
        src={src}
        loop
        playsInline
        muted={isMuted}
        preload={isMobile ? "none" : "metadata"}
        className={className}
        poster={poster}
        onError={handleError}
        onCanPlay={handleCanPlay}
        onLoadedData={handleLoadedData}
        onWaiting={handleWaiting}
        onPlaying={handlePlaying}
        onStalled={handleStalled}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Loading state */}
      {isLoading && (
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
              <svg className="w-10 h-10 text-amber-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <p className="text-white text-sm font-medium">Tap to play video</p>
            </div>
          </div>
        </div>
      )}

      {/* Error state without poster */}
      {hasError && !poster && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <div className="text-center">
            <svg className="w-10 h-10 text-amber-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p className="text-white text-sm">Tap to play</p>
          </div>
        </div>
      )}

      {/* Initial state on mobile: show play button overlay */}
      {!isPlaying && !isLoading && !hasError && isMobile && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
          <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Play className="w-7 h-7 text-[#E60012] ml-1" fill="currentColor" />
          </div>
        </div>
      )}

      {/* Play overlay on desktop when not playing and not loading */}
      {!isPlaying && !isLoading && !hasError && !isMobile && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
          <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Play className="w-7 h-7 text-[#E60012] ml-1" fill="currentColor" />
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
