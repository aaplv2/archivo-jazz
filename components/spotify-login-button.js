"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { spotifyAuth } from "@/lib/spotify-auth";
import { LogOut, Music } from "lucide-react";

export default function SpotifyLoginButton() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    if (typeof window !== "undefined") {
      return spotifyAuth.isLoggedIn();
    }
    return false;
  });

  const handleLogin = () => {
    const loginUrl = spotifyAuth.getLoginUrl();
    window.location.href = loginUrl;
  };

  const handleLogout = () => {
    spotifyAuth.logout();
    setIsLoggedIn(false);
  };

  return (
    <div>
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
          className="flex items-center space-x-2 bg-[#1DB954] text-white hover:bg-[#1aa34a]"
        >
          <Music className="w-4 h-4" />
          <span>Connect Spotify</span>
        </Button>
      )}
    </div>
  );
}
