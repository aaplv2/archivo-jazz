import { getSongBySlug, getAllSongs } from "@/lib/songs-data";
import SongPlayer from "@/components/song-player";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, User, Disc, FileText } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import ThemeToggle from "@/components/theme-toggle";

export async function generateStaticParams() {
  const songs = getAllSongs();
  return songs.map((song) => ({
    slug: song.id,
  }));
}

export default async function SongPage({ params }) {
  const { slug } = await params;
  const song = getSongBySlug(slug);

  if (!song) {
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
            <div className="flex justify-center space-x-2">
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
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Player Section */}
            <div className="space-y-6">
              <SongPlayer song={song} />

              {/* Album Art Placeholder */}
              <Card className="jazz-card-light dark:jazz-card-dark border-amber-200/50 dark:border-amber-800/30">
                <CardContent className="p-6">
                  <div className="aspect-square bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Disc className="w-16 h-16 text-amber-600 dark:text-amber-400 mx-auto mb-2" />
                      <p className="text-gray-600 dark:text-gray-400">
                        Album Artwork
                      </p>
                    </div>
                  </div>
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
                </CardContent>
              </Card>

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
