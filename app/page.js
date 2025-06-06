import { getAllSongs } from "@/lib/songs-data";
import SongCard from "@/components/song-card";
import { Badge } from "@/components/ui/badge";
import { Music2, Calendar, Users } from "lucide-react";

export default function HomePage() {
  const songs = getAllSongs();
  const decades = ["1920s", "1930s", "1940s"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center space-x-3">
            <Music2 className="w-8 h-8 text-amber-600" />
            <h1 className="text-3xl font-bold text-gray-900">Jazz Classics</h1>
          </div>
          <p className="text-center text-gray-600 mt-2">
            Timeless jazz standards from the golden age
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 text-center">
            <Music2 className="w-8 h-8 text-amber-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {songs.length}
            </div>
            <div className="text-gray-600">Jazz Standards</div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 text-center">
            <Calendar className="w-8 h-8 text-amber-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">3</div>
            <div className="text-gray-600">Decades Covered</div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 text-center">
            <Users className="w-8 h-8 text-amber-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">1920s-1940s</div>
            <div className="text-gray-600">Golden Age</div>
          </div>
        </div>

        {/* Decades Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <Badge variant="default" className="text-sm px-4 py-2">
            All Songs
          </Badge>
          {decades.map((decade) => (
            <Badge key={decade} variant="outline" className="text-sm px-4 py-2">
              {decade}
            </Badge>
          ))}
        </div>

        {/* Songs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {songs.map((song) => (
            <SongCard key={song.id} song={song} />
          ))}
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-600">
          <p className="text-sm">
            Celebrating the timeless music of the Jazz Age • 1920s - 1940s
          </p>
        </footer>
      </main>
    </div>
  );
}
