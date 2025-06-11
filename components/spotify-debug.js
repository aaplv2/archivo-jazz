"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { spotifyAuth } from "@/lib/spotify-auth";

export default function SpotifyDebug() {
  const [debugInfo, setDebugInfo] = useState(null);

  const checkConfiguration = () => {
    const info = {
      clientId: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
      currentDomain: spotifyAuth.getCurrentDomain(),
      redirectUri:
        typeof window !== "undefined"
          ? `${window.location.origin}/spotify-callback`
          : "N/A",
      isLoggedIn: spotifyAuth.isLoggedIn(),
      token: spotifyAuth.getToken() ? "Present" : "None",
      localStorage:
        typeof window !== "undefined"
          ? {
              token: localStorage.getItem("spotify_auth_token")
                ? "Present"
                : "None",
              expiration:
                localStorage.getItem("spotify_auth_token_expiration") || "None",
              state: localStorage.getItem("spotify_auth_state") || "None",
            }
          : "N/A",
    };
    setDebugInfo(info);
  };

  const clearStorage = () => {
    spotifyAuth.logout();
    setDebugInfo(null);
  };

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-sm">Spotify Debug (Dev Only)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex space-x-2">
          <Button size="sm" variant="outline" onClick={checkConfiguration}>
            Check Config
          </Button>
          <Button size="sm" variant="outline" onClick={clearStorage}>
            Clear Storage
          </Button>
        </div>

        {debugInfo && (
          <div className="text-xs space-y-1 bg-gray-100 dark:bg-gray-800 p-2 rounded">
            <p>
              <strong>Client ID:</strong>{" "}
              {debugInfo.clientId ? "✓ Set" : "✗ Missing"}
            </p>
            <p>
              <strong>Domain:</strong> {debugInfo.currentDomain}
            </p>
            <p>
              <strong>Redirect URI:</strong> {debugInfo.redirectUri}
            </p>
            <p>
              <strong>Logged In:</strong> {debugInfo.isLoggedIn ? "Yes" : "No"}
            </p>
            <p>
              <strong>Token:</strong> {debugInfo.token}
            </p>
            <p>
              <strong>Storage:</strong>{" "}
              {JSON.stringify(debugInfo.localStorage, null, 2)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
