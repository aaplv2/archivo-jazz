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

export async function generateStaticParams() {
  const songs = getAllSongs();
  return songs.map((song) => ({
    slug: song.id,
  }));
}

export default function SongPage({ params }) {
  const song = getSongBySlug(params.slug);

  if (!song) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/">
            <Button variant="ghost" className="mb-2">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Songs
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Song Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {song.title}
            </h1>
            <p className="text-xl text-gray-600 mb-4">{song.composer}</p>
            <div className="flex justify-center space-x-2">
              <Badge variant="default">{song.year}</Badge>
              <Badge variant="outline">{song.decade}</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Player Section */}
            <div className="space-y-6">
              <SongPlayer song={song} />

              {/* Album Art Placeholder */}
              <Card>
                <CardContent className="p-6">
                  <div className="aspect-square bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Disc className="w-16 h-16 text-amber-600 mx-auto mb-2" />
                      <p className="text-gray-600">Album Artwork</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Song Details */}
            <div className="space-y-6">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Song Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span className="font-medium">Composer:</span>
                    <span className="ml-2">{song.composer}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span className="font-medium">Year:</span>
                    <span className="ml-2">{song.year}</span>
                  </div>
                  <div className="flex items-center">
                    <Disc className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span className="font-medium">Album:</span>
                    <span className="ml-2">{song.album}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>About This Song</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    {song.description}
                  </p>
                </CardContent>
              </Card>

              {/* Era Context */}
              <Card>
                <CardHeader>
                  <CardTitle>Musical Era</CardTitle>
                  <CardDescription>The {song.decade}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
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
