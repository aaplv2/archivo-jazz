"use client";

import { Button } from "@/components/ui/button";
import { Play, Pause, ExternalLink, Loader2 } from "lucide-react";

export default function PlayerControls({
  isPlaying,
  isLoading,
  onTogglePlay,
  onOpenInSpotify,
  spotifyId,
}) {
  return (
    <div className="flex items-center justify-center space-x-4">
      <Button
        variant="outline"
        size="icon"
        onClick={onTogglePlay}
        disabled={isLoading}
        className="h-12 w-12 border-[#1DB954] text-[#1DB954] hover:bg-[#1DB954]/10"
      >
        {isLoading ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : isPlaying ? (
          <Pause className="h-6 w-6" />
        ) : (
          <Play className="h-6 w-6" />
        )}
      </Button>

      {spotifyId && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenInSpotify}
          className="h-8 w-8 text-[#1DB954] hover:bg-[#1DB954]/10"
          title="Open in Spotify"
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
