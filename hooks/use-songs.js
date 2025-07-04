"use client";

import { useState, useEffect } from "react";
import { getAllSongs } from "@/lib/songs-data";

export function useSongs() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSongs() {
      try {
        setLoading(true);

        // First, show static data immediately
        const staticSongs = getAllSongs();
        setSongs(staticSongs);
        setLoading(false);

        // Then try to fetch enriched data in the background
        try {
          const response = await fetch("/api/songs");

          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              setSongs(data.data);
            }
          }
        } catch (enrichError) {
          console.log(
            "API enrichment failed, using static data:",
            enrichError.message
          );
          // Keep static data, don't show error to user
        }
      } catch (err) {
        console.error("Error fetching songs:", err);
        setError(err.message);
        // Fallback to static data
        setSongs(getAllSongs());
        setLoading(false);
      }
    }

    fetchSongs();
  }, []);

  return { songs, loading, error };
}

export function useSong(slug) {
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSong() {
      if (!slug) return;

      try {
        setLoading(true);

        // Try to fetch enriched data from API
        const response = await fetch(`/api/songs/${slug}`);

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setSong(data.data);
          } else {
            // Fallback to static data
            const { getSongBySlug } = await import("@/lib/songs-data");
            setSong(getSongBySlug(slug));
          }
        } else {
          // Fallback to static data
          const { getSongBySlug } = await import("@/lib/songs-data");
          setSong(getSongBySlug(slug));
        }
      } catch (err) {
        console.error("Error fetching song:", err);
        setError(err.message);
        // Fallback to static data
        const { getSongBySlug } = await import("@/lib/songs-data");
        setSong(getSongBySlug(slug));
      } finally {
        setLoading(false);
      }
    }

    fetchSong();
  }, [slug]);

  return { song, loading, error };
}
