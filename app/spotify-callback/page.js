"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { spotifyAuth } from "@/lib/spotify-auth";
import { Music2 } from "lucide-react";

export default function SpotifyCallback() {
  const router = useRouter();
  const [status, setStatus] = useState("Processing authentication...");

  useEffect(() => {
    // Process the callback
    const result = spotifyAuth.handleCallback();

    if (result.success) {
      setStatus("Authentication successful! Redirecting...");

      // Redirect back to home page after a short delay
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } else {
      setStatus(`Authentication failed: ${result.error}`);

      // Redirect back to home page after a longer delay
      setTimeout(() => {
        router.push("/");
      }, 3000);
    }
  }, [router]);

  return (
    <div className="min-h-screen jazz-bg-light dark:jazz-bg-dark flex flex-col items-center justify-center">
      <div className="text-center">
        <Music2 className="w-16 h-16 text-[#1DB954] mx-auto mb-4 animate-pulse" />
        <h1 className="text-2xl font-bold mb-4">Spotify Authentication</h1>
        <p className="text-gray-600 dark:text-gray-400">{status}</p>
      </div>
    </div>
  );
}
