"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { spotifyService } from "@/lib/services/spotify-services";
import { LogOut, Music, AlertCircle } from "lucide-react";

export default function SpotifyLoginButton() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsLoggedIn(spotifyService.isLoggedIn());
    }
  }, []);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if crypto.subtle is available (required for PKCE)
      if (!window.crypto || !window.crypto.subtle) {
        setError(
          "Your browser doesn't support the required security features. Please use a modern browser."
        );
        setIsLoading(false);
        return;
      }

      const loginUrl = await spotifyService.getLoginUrl();

      if (!loginUrl) {
        setError(
          "Spotify configuration error. Please check environment variables."
        );
        setIsLoading(false);
        return;
      }

      window.location.href = loginUrl;
    } catch (err) {
      console.error("Login error:", err);
      setError("Failed to initiate Spotify login");
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    spotifyService.logout();
    setIsLoggedIn(false);
    setError(null);
    window.location.reload(); // Reload to reset player state
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      {error && (
        <div className="flex items-center space-x-1 text-red-600 dark:text-red-400 text-sm max-w-xs text-center">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="text-xs">{error}</span>
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
    </div>
  );
}
