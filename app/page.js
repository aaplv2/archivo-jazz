"use client";

import { useSongs } from "../hooks/use-songs";
import { Music2 } from "lucide-react";
import ThemeToggle from "@/components/theme-toggle";
import LoadingSpinner from "@/components/loading-spinner";
import Link from "next/link";
import SpotifyLoginButton from "@/components/spotify-login-button";
import SpotifyDebug from "@/components/spotify-debug";

export default function HomePage() {
  const { songs, loading, error } = useSongs();

  if (loading) {
    return (
      <div className="min-h-screen jazz-bg-light dark:jazz-bg-dark transition-colors duration-300">
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
          </div>
        </header>
        <LoadingSpinner message="Loading jazz classics..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen jazz-bg-light dark:jazz-bg-dark transition-colors duration-300">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Error Loading Songs
            </h2>
            <p className="text-gray-600 dark:text-gray-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Group songs by decade and sort alphabetically
  const songs1920s = songs
    .filter((song) => song.decade === "1920s")
    .sort((a, b) => a.title.localeCompare(b.title));
  const songs1930s = songs
    .filter((song) => song.decade === "1930s")
    .sort((a, b) => a.title.localeCompare(b.title));
  const songs1940s = songs
    .filter((song) => song.decade === "1940s")
    .sort((a, b) => a.title.localeCompare(b.title));

  const DecadeColumn = ({ decade, songs, bgColor }) => (
    <div className="jazz-card-light dark:jazz-card-dark rounded-lg p-6 shadow-sm border border-amber-200/50 dark:border-amber-800/30">
      <h2
        className={`text-2xl font-bold text-center mb-6 ${bgColor} dark:text-amber-300`}
      >
        {decade}
        <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
          ({songs.length} songs)
        </span>
      </h2>
      <ul className="space-y-3">
        {songs.map((song) => (
          <li key={song.id}>
            <Link
              href={`/songs/${song.id}`}
              className="block text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 hover:underline transition-colors duration-200 text-center py-1 group"
            >
              <div className="flex items-center justify-center space-x-2">
                <span>{song.title}</span>
                {song.previewUrl &&
                  song.previewUrl !== "/placeholder-audio.mp3" && (
                    <span className="text-green-600 dark:text-green-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      ♪
                    </span>
                  )}
              </div>
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
            <div className="flex-1 flex justify-start">
              <div>
                <SpotifyLoginButton />
                <SpotifyDebug />
              </div>
            </div>
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
          {songs.some((song) => song.listeners) && (
            <p className="text-center text-sm text-amber-600 dark:text-amber-400 mt-2">
              ✨ Enhanced with real-time music data
            </p>
          )}
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
          <p className="text-xs mt-2 opacity-75">
            Data enhanced by Last.fm, Spotify, and MusicBrainz APIs
          </p>
        </footer>
      </main>
    </div>
  );
}
