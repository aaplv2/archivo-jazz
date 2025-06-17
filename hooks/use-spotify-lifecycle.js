"use client";

import { useEffect, useRef } from "react";
import { spotifyService } from "@/lib/services/spotify-service";

export function useSpotifyLifecycle() {
  const cleanupRef = useRef(false);

  useEffect(() => {
    // Mark that we're managing the lifecycle
    cleanupRef.current = true;

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, pause any playback
        console.log("Page hidden, pausing Spotify playback");
      } else {
        // Page is visible again, check token health
        if (spotifyService.isLoggedIn() && spotifyService.isTokenStale()) {
          console.log("Page visible, refreshing stale token");
          spotifyService.refreshToken();
        }
      }
    };

    // Handle before page unload
    const handleBeforeUnload = () => {
      // Ensure cleanup happens before page unloads
      if (cleanupRef.current) {
        console.log("Page unloading, cleaning up Spotify resources");
        // The actual cleanup will be handled by component unmount effects
      }
    };

    // Add event listeners
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      // Cleanup event listeners
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      cleanupRef.current = false;
    };
  }, []);

  // Return utility functions
  return {
    isTokenStale: () => spotifyService.isTokenStale(),
    refreshToken: () => spotifyService.refreshToken(),
    revokeToken: () => spotifyService.revokeToken(),
    regenerateToken: () => spotifyService.regenerateToken(),
  };
}
