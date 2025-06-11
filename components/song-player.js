"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Pause, Volume2, VolumeX, AlertCircle } from "lucide-react";

export default function SongPlayer({ song }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef(null);

  // Check if we have a valid audio URL
  const hasValidAudio =
    song.previewUrl && song.previewUrl !== "/placeholder-audio.mp3";

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !hasValidAudio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration || 0);
    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => {
      setIsLoading(false);
      setHasError(false);
    };
    const handleError = (e) => {
      console.error("Audio error:", e);
      setHasError(true);
      setIsLoading(false);
      setIsPlaying(false);
    };
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("loadstart", handleLoadStart);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("error", handleError);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("loadstart", handleLoadStart);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [hasValidAudio, song.previewUrl]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio || !hasValidAudio) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        setIsLoading(true);
        await audio.play();
        setIsPlaying(true);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Playback error:", error);
      setHasError(true);
      setIsLoading(false);
      setIsPlaying(false);
    }
  };

  const handleSeek = (value) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;

    const newTime = (value[0] / 100) * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (value) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = volume / 100;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const formatTime = (time) => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <Card className="w-full jazz-card-light dark:jazz-card-dark border-amber-200/50 dark:border-amber-800/30">
      <CardContent className="p-6">
        {hasValidAudio && (
          <audio
            ref={audioRef}
            src={song.previewUrl}
            preload="none"
            crossOrigin="anonymous"
          />
        )}

        <div className="space-y-4">
          {/* Song Info */}
          <div className="text-center">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-amber-100">
              {song.title}
            </h3>
            <p className="text-muted-foreground dark:text-gray-400">
              {song.composer}
            </p>
          </div>

          {/* Audio Status */}
          {!hasValidAudio && (
            <div className="text-center py-4">
              <AlertCircle className="w-8 h-8 text-amber-600 dark:text-amber-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No audio preview available
              </p>
            </div>
          )}

          {hasError && (
            <div className="text-center py-4">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400 mx-auto mb-2" />
              <p className="text-sm text-red-600 dark:text-red-400">
                Audio could not be loaded
              </p>
            </div>
          )}

          {hasValidAudio && !hasError && (
            <>
              {/* Progress Bar */}
              <div className="space-y-2">
                <Slider
                  value={[progress]}
                  onValueChange={handleSeek}
                  max={100}
                  step={1}
                  className="w-full"
                  disabled={!duration}
                />
                <div className="flex justify-between text-sm text-muted-foreground dark:text-gray-400">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center space-x-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={togglePlay}
                  disabled={isLoading}
                  className="h-12 w-12 border-amber-600 dark:border-amber-400 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                >
                  {isLoading ? (
                    <div className="animate-spin w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full" />
                  ) : isPlaying ? (
                    <Pause className="h-6 w-6" />
                  ) : (
                    <Play className="h-6 w-6" />
                  )}
                </Button>
              </div>

              {/* Volume Control */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMute}
                  className="h-8 w-8 text-gray-600 dark:text-gray-400"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  onValueChange={handleVolumeChange}
                  max={100}
                  step={1}
                  className="flex-1"
                />
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
