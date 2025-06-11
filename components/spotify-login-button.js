"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { spotifyAuth } from "@/lib/spotify-auth";
import { LogOut, Music, AlertCircle } from "lucide-react";

export default function SpotifyLoginButton() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsLoggedIn(spotifyAuth.isLoggedIn());
    }
  }, []);

  const handleLogin = () => {
    try {
      setIsLoading(true);
      setError(null);

      const loginUrl = spotifyAuth.getLoginUrl();

      if (!loginUrl) {
        setError(
          "Spotify configuration error. Please check environment variables."
        );
        setIsLoading(false);
        return;
      }

      console.log("Redirecting to:", loginUrl);
      window.location.href = loginUrl;
    } catch (err) {
      console.error("Login error:", err);
      setError("Failed to initiate Spotify login");
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    spotifyAuth.logout();
    setIsLoggedIn(false);
    setError(null);
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      {error && (
        <div className="flex items-center space-x-1 text-red-600 dark:text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {isLoggedIn ? (
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="flex items-center space-x-2 bg-black text-white hover:bg-gray-800"
        >
          <LogOut className="w-4 h-4" />
          <span>Disconnect Spotify</span>
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogin}
          disabled={isLoading}
          className="flex items-center space-x-2 bg-[#1DB954] text-white hover:bg-[#1aa34a]"
        >
          <Music className="w-4 h-4" />
          <span>{isLoading ? "Connecting..." : "Connect Spotify"}</span>
        </Button>
      )}

      {/* Debug info in development */}
      {process.env.NODE_ENV === "development" && (
        <div className="text-xs text-gray-500 mt-2">
          <p>Domain: {spotifyAuth.getCurrentDomain()}</p>
          <p>
            Client ID: {process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID ? "✓" : "✗"}
          </p>
        </div>
      )}
    </div>
  );
}
