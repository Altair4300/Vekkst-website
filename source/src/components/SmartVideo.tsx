import { useRef, useState, useEffect, useCallback } from "react";
import { Play, Volume2, VolumeX, RefreshCw } from "lucide-react";

interface SmartVideoProps {
  src: string;
  className?: string;
  poster?: string;
}

export default function SmartVideo({ src, className = "", poster }: SmartVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const clearError = useCallback(() => setLoadError(null), []);

  const handleClick = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
      return;
    }

    // Clear any previous error and try to load
    setLoadError(null);

    // Always play muted first — required for mobile autoplay
    video.muted = true;
    setIsMuted(true);

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.error("[SmartVideo] Play failed:", err, "src:", src);
          setIsPlaying(false);
          if (err.name === "NotAllowedError") {
            setLoadError("Tap to play video");
          } else {
            setLoadError("Video failed to load");
          }
        });
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  // Pause when scrolled out of view
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting && !video.paused) {
            video.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  // Reset state when src changes
  useEffect(() => {
    setLoadError(null);
    setHasLoaded(false);
    setIsPlaying(false);
  }, [src]);

  const isUnavailable = loadError && loadError !== "Tap to play video";

  return (
    <div className="relative group cursor-pointer" onClick={handleClick}>
      {/* Error overlay — only for genuine load failures, not "tap to play" */}
      {isUnavailable && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20">
          {poster ? (
            <img
              src={poster}
              alt="Video preview"
              className="absolute inset-0 w-full h-full object-cover opacity-40"
            />
          ) : null}
          <div className="relative z-10 flex flex-col items-center gap-3 px-4">
            <p className="text-gray-300 text-sm text-center">
              Video unavailable on this device.
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearError();
                handleClick();
              }}
              className="flex items-center gap-2 text-xs text-amber-400 hover:text-amber-300 transition-colors"
            >
              <RefreshCw className="w-3 h-3" /> Retry
            </button>
          </div>
        </div>
      )}

      <video
        ref={videoRef}
        src={src}
        loop
        playsInline
        muted={isMuted}
        preload="none"
        className={className}
        poster={poster}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onLoadedData={() => {
          setHasLoaded(true);
          setLoadError(null);
        }}
        onLoadedMetadata={() => {
          setHasLoaded(true);
          setLoadError(null);
        }}
        onError={() => {
          console.error("[SmartVideo] Video error, src:", src);
          setLoadError("Failed to load video");
        }}
      />

      {/* Play button overlay — shown when not playing and no error */}
      {!isPlaying && !isUnavailable && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
          <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Play className="w-7 h-7 text-[#E60012] ml-1" fill="currentColor" />
          </div>
        </div>
      )}

      {/* Mute/unmute button when playing */}
      {isPlaying && (
        <button
          onClick={toggleMute}
          className="absolute top-3 right-3 bg-black/60 text-white px-2 py-1 rounded flex items-center gap-1 text-xs hover:bg-black/80 transition-colors"
        >
          {isMuted ? (
            <>
              <VolumeX className="w-3 h-3" />
              Tap for sound
            </>
          ) : (
            <>
              <Volume2 className="w-3 h-3" />
              Sound On
            </>
          )}
        </button>
      )}
    </div>
  );
}
