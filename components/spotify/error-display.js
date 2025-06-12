"use client";

import { AlertCircle } from "lucide-react";
import SpotifyLoginButton from "../spotify-login-button";

export default function ErrorDisplay({ error }) {
  if (!error) return null;

  return (
    <div className="text-center py-2">
      <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 mx-auto mb-1" />
      <p className="text-sm text-red-600 dark:text-red-400">{error.message}</p>

      {error.action === "login" && (
        <div className="mt-2">
          <SpotifyLoginButton />
        </div>
      )}

      {error.action === "refresh" && (
        <button
          className="mt-2 text-sm text-blue-600 dark:text-blue-400 underline"
          onClick={() => window.location.reload()}
        >
          Refresh page
        </button>
      )}

      {error.action === "upgrade" && (
        <a
          href="https://www.spotify.com/premium"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 block text-sm text-[#1DB954] underline"
        >
          Get Spotify Premium
        </a>
      )}
    </div>
  );
}
