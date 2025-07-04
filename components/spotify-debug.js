"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { spotifyAuth } from "@/lib/spotify-auth";
import TokenManager from "./spotify/token-manager";

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
      cryptoSupport:
        typeof window !== "undefined" && window.crypto?.subtle
          ? "Available"
          : "Not Available",
      spotifySDK:
        typeof window !== "undefined" && window.Spotify
          ? "Loaded"
          : "Not Loaded",
      sdkCallback:
        typeof window !== "undefined" && window.onSpotifyWebPlaybackSDKReady
          ? "Defined"
          : "Not Defined",
      localStorage:
        typeof window !== "undefined"
          ? {
              token: localStorage.getItem("spotify_auth_token")
                ? "Present"
                : "None",
              expiration:
                localStorage.getItem("spotify_auth_token_expiration") || "None",
              refresh: localStorage.getItem("spotify_auth_token_refresh")
                ? "Present"
                : "None",
              state: localStorage.getItem("spotify_auth_state") || "None",
              codeVerifier: localStorage.getItem("code_verifier")
                ? "Present"
                : "None",
            }
          : "N/A",
    };
    setDebugInfo(info);
  };

  const clearStorage = () => {
    spotifyAuth.logout();
    setDebugInfo(null);
  };

  const testPKCE = async () => {
    try {
      if (!window.crypto?.subtle) {
        alert("Crypto API not available");
        return;
      }

      const verifier = spotifyAuth.generateCodeVerifier();
      const challenge = await spotifyAuth.generateCodeChallenge(verifier);

      alert(
        `PKCE Test:\nVerifier: ${verifier.substring(
          0,
          20
        )}...\nChallenge: ${challenge.substring(0, 20)}...`
      );
    } catch (error) {
      alert(`PKCE Test Failed: ${error.message}`);
    }
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
        <div className="flex space-x-2 flex-wrap gap-1">
          <Button size="sm" variant="outline" onClick={checkConfiguration}>
            Check Config
          </Button>
          <Button size="sm" variant="outline" onClick={clearStorage}>
            Clear Storage
          </Button>
          <Button size="sm" variant="outline" onClick={testPKCE}>
            Test PKCE
          </Button>
        </div>

        {debugInfo && (
          <div className="text-xs space-y-1 bg-gray-100 dark:bg-gray-800 p-2 rounded max-h-40 overflow-y-auto">
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
              <strong>Crypto Support:</strong> {debugInfo.cryptoSupport}
            </p>
            <p>
              <strong>Logged In:</strong> {debugInfo.isLoggedIn ? "Yes" : "No"}
            </p>
            <p>
              <strong>Token:</strong> {debugInfo.token}
            </p>
            <p>
              <strong>Storage:</strong>
            </p>
            <pre className="text-xs bg-gray-200 dark:bg-gray-700 p-1 rounded">
              {JSON.stringify(debugInfo.localStorage, null, 2)}
            </pre>
          </div>
        )}

        {debugInfo && (
          <div className="mt-4">
            <TokenManager />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
