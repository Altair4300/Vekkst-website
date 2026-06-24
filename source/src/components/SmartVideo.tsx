import { useRef, useState, useEffect } from "react";
import { Play, Volume2, VolumeX } from "lucide-react";

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

  // Log the src for debugging
  useEffect(() => {
    console.log("[SmartVideo] src:", src);
  }, [src]);

  const handleClick = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
      return;
    }

    // Always play muted first — this works on ALL browsers including mobile
    video.muted = true;
    setIsMuted(true);
    
    // iOS Safari requires user gesture and playsInline
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.error("[SmartVideo] Play failed:", err, "src:", src);
          // On mobile, if autoplay fails, show error
          setIsPlaying(false);
          if (err.name === "NotAllowedError") {
            setLoadError("Tap to play video");
          }
        });
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation(); // Don't pause the video
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

  return (
    <div className="relative group cursor-pointer" onClick={handleClick}>
      {loadError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
          <p className="text-red-400 text-sm text-center px-4">Video failed to load.<br/>Check admin upload.</p>
        </div>
      )}
      <video
        ref={videoRef}
        src={src}
        loop
        playsInline
        muted={isMuted}
        preload="metadata"
        className={className}
        poster={poster}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={() => {
          console.error("[SmartVideo] Video error, src:", src);
          setLoadError("Failed to load video");
        }}
      />

      {/* Play button when not playing */}
      {!isPlaying && !loadError && (
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
