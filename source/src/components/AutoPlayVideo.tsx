import { useRef, useEffect, useState } from "react";
import { Volume2, VolumeX, Play, Pause } from "lucide-react";

interface AutoPlayVideoProps {
  src: string;
  className?: string;
  poster?: string;
}

export default function AutoPlayVideo({ src, className = "", poster }: AutoPlayVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(1);

  // Auto-play on mount
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.play().catch(() => {
      // Autoplay blocked, will show play button
      setIsPlaying(false);
    });
  }, [src]);

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play();
      setIsPlaying(true);
    }
  };

  const handleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isMuted) {
      video.muted = false;
      setIsMuted(false);
    } else {
      video.muted = true;
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    video.volume = newVolume;

    // Unmute if volume is increased
    if (newVolume > 0 && isMuted) {
      video.muted = false;
      setIsMuted(false);
    }
  };

  return (
    <div className="relative group">
      <video
        ref={videoRef}
        src={src}
        loop
        playsInline
        autoPlay
        preload="auto"
        className={className}
        poster={poster}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Controls overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-3">
          {/* Play/Pause button */}
          <button
            onClick={handlePlayPause}
            className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </button>

          {/* Volume slider */}
          <div className="flex items-center gap-2 flex-1">
            <button
              onClick={handleMute}
              className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>

            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-24 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-amber-400"
              title="Volume"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
