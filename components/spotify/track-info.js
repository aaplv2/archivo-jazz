import { Badge } from "@/components/ui/badge";

export default function TrackInfo({ song, currentTrack }) {
  return (
    <div className="text-center">
      <h3 className="font-semibold text-lg text-gray-900 dark:text-amber-100">
        {song.title}
      </h3>
      <p className="text-muted-foreground dark:text-gray-400">
        {song.composer}
      </p>

      {currentTrack && (
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
          Now playing: {currentTrack.name} by {currentTrack.artists[0]?.name}
        </p>
      )}

      {song.spotifyId && (
        <div className="mt-1">
          <Badge
            variant="outline"
            className="bg-[#1DB954]/10 text-[#1DB954] border-[#1DB954]/30"
          >
            Spotify Available
          </Badge>
        </div>
      )}
    </div>
  );
}
