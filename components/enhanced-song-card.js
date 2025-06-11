import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Music, Users, Play } from "lucide-react";
import SafeImage from "./safe-image";

export default function EnhancedSongCard({ song }) {
  return (
    <Link
      href={`/songs/${song.id}`}
      className="block transition-transform hover:scale-105"
    >
      <Card className="h-full hover:shadow-lg transition-shadow jazz-card-light dark:jazz-card-dark border-amber-200/50 dark:border-amber-800/30">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg leading-tight mb-1 text-gray-900 dark:text-amber-100">
                {song.title}
              </CardTitle>
              <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                {song.composer}
              </CardDescription>
            </div>
            <div className="ml-2 flex-shrink-0">
              {song.previewUrl &&
              song.previewUrl !== "/placeholder-audio.mp3" ? (
                <Play className="w-5 h-5 text-green-600 dark:text-green-400" />
              ) : (
                <Music className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Album Art */}
          {song.albumArt &&
            song.albumArt !== "/placeholder.svg?height=300&width=300" && (
              <div className="mb-3">
                <SafeImage
                  src={song.albumArt}
                  alt={`${song.title} album art`}
                  width={200}
                  height={200}
                  className="w-full h-32"
                />
              </div>
            )}

          <div className="flex items-center justify-between mb-2">
            <Badge
              variant="default"
              className="text-xs bg-amber-600 dark:bg-amber-700 text-white"
            >
              {song.year}
            </Badge>
            <Badge
              variant="outline"
              className="text-xs border-amber-600 dark:border-amber-400 text-amber-700 dark:text-amber-300"
            >
              {song.decade}
            </Badge>
          </div>

          {/* Enhanced metadata */}
          <div className="space-y-1 mb-2">
            {song.listeners && (
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <Users className="w-3 h-3 mr-1" />
                {Number.parseInt(song.listeners).toLocaleString()} listeners
              </div>
            )}
            {song.tags && song.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {song.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2">
            {song.description}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
