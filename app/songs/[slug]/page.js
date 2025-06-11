"use client";

import { use } from "react";
import { useSong } from "@/app/hooks/use-songs";
import SongPlayer from "@/components/song-player";
import SafeImage from "@/components/safe-image";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Calendar,
  User,
  Disc,
  FileText,
  Users,
  Tag,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import ThemeToggle from "@/components/theme-toggle";
import LoadingSpinner from "@/components/loading-spinner";
import SpotifyPlayer from "@/components/spotify-player";

export default function SongPage({ params }) {
  // Properly unwrap the params Promise
  const { slug } = use(params);
  const { song, loading, error } = useSong(slug);

  if (loading) {
    return (
      <div className="min-h-screen jazz-bg-light dark:jazz-bg-dark transition-colors duration-300">
        <LoadingSpinner message="Loading song details..." />
      </div>
    );
  }

  if (error || !song) {
    notFound();
  }

  return (
    <div className="min-h-screen jazz-bg-light dark:jazz-bg-dark transition-colors duration-300">
      {/* Header */}
      <header className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm border-b border-amber-200/50 dark:border-amber-800/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button
                variant="ghost"
                className="mb-2 text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Songs
              </Button>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Song Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-amber-100 mb-2">
              {song.title}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
              {song.composer}
            </p>
            <div className="flex justify-center space-x-2 mb-4">
              <Badge
                variant="default"
                className="bg-amber-600 dark:bg-amber-700 text-white"
              >
                {song.year}
              </Badge>
              <Badge
                variant="outline"
                className="border-amber-600 dark:border-amber-400 text-amber-700 dark:text-amber-300"
              >
                {song.decade}
              </Badge>
              {song.previewUrl &&
                song.previewUrl !== "/placeholder-audio.mp3" && (
                  <Badge variant="default" className="bg-green-600 text-white">
                    Preview Available
                  </Badge>
                )}
            </div>

            {/* Enhanced stats */}
            {(song.listeners || song.playcount) && (
              <div className="flex justify-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                {song.listeners && (
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {Number.parseInt(song.listeners).toLocaleString()} listeners
                  </div>
                )}
                {song.playcount && (
                  <div className="flex items-center">
                    <Disc className="w-4 h-4 mr-1" />
                    {Number.parseInt(song.playcount).toLocaleString()} plays
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Player Section */}
            <div className="space-y-6">
              {song.spotifyId ? <SpotifyPlayer song={song} /> : <SongPlayer song={song} />}

              {/* Album Art */}
              <Card className="jazz-card-light dark:jazz-card-dark border-amber-200/50 dark:border-amber-800/30">
                <CardContent className="p-6">
                  <SafeImage
                    src={song.albumArt}
                    alt={`${song.title} album art`}
                    width={400}
                    height={400}
                    className="aspect-square"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Song Details */}
            <div className="space-y-6">
              {/* Basic Info */}
              <Card className="jazz-card-light dark:jazz-card-dark border-amber-200/50 dark:border-amber-800/30">
                <CardHeader>
                  <CardTitle className="flex items-center text-gray-900 dark:text-amber-100">
                    <FileText className="w-5 h-5 mr-2" />
                    Song Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      Composer:
                    </span>
                    <span className="ml-2 text-gray-700 dark:text-gray-300">
                      {song.composer}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      Year:
                    </span>
                    <span className="ml-2 text-gray-700 dark:text-gray-300">
                      {song.year}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Disc className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      Album:
                    </span>
                    <span className="ml-2 text-gray-700 dark:text-gray-300">
                      {song.album}
                    </span>
                  </div>
                  {song.duration && (
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        Duration:
                      </span>
                      <span className="ml-2 text-gray-700 dark:text-gray-300">
                        {Math.floor(song.duration / 60000)}:
                        {((song.duration % 60000) / 1000)
                          .toFixed(0)
                          .padStart(2, "0")}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tags */}
              {song.tags && song.tags.length > 0 && (
                <Card className="jazz-card-light dark:jazz-card-dark border-amber-200/50 dark:border-amber-800/30">
                  <CardHeader>
                    <CardTitle className="flex items-center text-gray-900 dark:text-amber-100">
                      <Tag className="w-5 h-5 mr-2" />
                      Music Tags
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {song.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Description */}
              <Card className="jazz-card-light dark:jazz-card-dark border-amber-200/50 dark:border-amber-800/30">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-amber-100">
                    About This Song
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {song.description}
                  </p>
                </CardContent>
              </Card>

              {/* Artist Bio */}
              {song.artistBio && (
                <Card className="jazz-card-light dark:jazz-card-dark border-amber-200/50 dark:border-amber-800/30">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-amber-100">
                      About the Artist
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {song.artistBio}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Era Context */}
              <Card className="jazz-card-light dark:jazz-card-dark border-amber-200/50 dark:border-amber-800/30">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-amber-100">
                    Musical Era
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    The {song.decade}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {song.decade === "1920s" &&
                      "The Roaring Twenties marked the birth of the Jazz Age, with its energetic rhythms, improvisation, and cultural revolution that defined a generation."}
                    {song.decade === "1930s" &&
                      "The 1930s saw the rise of swing music and big bands, bringing jazz to mainstream audiences during the Great Depression era."}
                    {song.decade === "1940s" &&
                      "The 1940s introduced bebop, a revolutionary jazz style characterized by complex harmonies, fast tempos, and virtuosic improvisation."}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
