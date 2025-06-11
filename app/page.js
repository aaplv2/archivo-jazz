import { getSongsByDecade } from "@/lib/songs-data";
import Link from "next/link";
import { Music2 } from "lucide-react";
import ThemeToggle from "@/components/theme-toggle";

export default function HomePage() {
  const songs1920s = getSongsByDecade("1920s").sort((a, b) =>
    a.title.localeCompare(b.title)
  );
  const songs1930s = getSongsByDecade("1930s").sort((a, b) =>
    a.title.localeCompare(b.title)
  );
  const songs1940s = getSongsByDecade("1940s").sort((a, b) =>
    a.title.localeCompare(b.title)
  );

  const DecadeColumn = ({ decade, songs, bgColor }) => (
    <div className="jazz-card-light dark:jazz-card-dark rounded-lg p-6 shadow-sm border border-amber-200/50 dark:border-amber-800/30">
      <h2
        className={`text-2xl font-bold text-center mb-6 ${bgColor} dark:text-amber-300`}
      >
        {decade}
      </h2>
      <ul className="space-y-3">
        {songs.map((song) => (
          <li key={song.id}>
            <Link
              href={`/songs/${song.id}`}
              className="block text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 hover:underline transition-colors duration-200 text-center py-1"
            >
              {song.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="min-h-screen jazz-bg-light dark:jazz-bg-dark transition-colors duration-300">
      {/* Header */}
      <header className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm border-b border-amber-200/50 dark:border-amber-800/30">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex-1" />
            <div className="flex items-center space-x-3">
              <Music2 className="w-8 h-8 text-amber-600 dark:text-amber-400" />
              <h1 className="text-4xl font-bold text-gray-900 dark:text-amber-100">
                Jazz Classics
              </h1>
            </div>
            <div className="flex-1 flex justify-end">
              <ThemeToggle />
            </div>
          </div>
          <p className="text-center text-gray-600 dark:text-gray-400 mt-3 text-lg">
            Timeless jazz standards from the golden age
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Three Columns Layout */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <DecadeColumn
              decade="1920s"
              songs={songs1920s}
              bgColor="text-amber-700"
            />
            <DecadeColumn
              decade="1930s"
              songs={songs1930s}
              bgColor="text-orange-700"
            />
            <DecadeColumn
              decade="1940s"
              songs={songs1940s}
              bgColor="text-red-700"
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-600 dark:text-gray-400">
          <p className="text-sm">
            Celebrating the timeless music of the Jazz Age • 1920s - 1940s
          </p>
        </footer>
      </main>
    </div>
  );
}
