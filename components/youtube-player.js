"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";

export default function YouTubePlayer({ song }) {
  const [videoId, setVideoId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const searchYouTube = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Create a search query using song title and composer
        const searchQuery = `${song.title} ${song.composer.split(",")[0]} jazz`;

        const response = await fetch(
          `/api/youtube/search?q=${encodeURIComponent(searchQuery)}`
        );

        if (!response.ok) {
          throw new Error("Failed to search YouTube");
        }

        const data = await response.json();

        if (data.success && data.videoId) {
          setVideoId(data.videoId);
        } else {
          setError("No video found");
        }
      } catch (err) {
        console.error("YouTube search error:", err);
        setError("Failed to load YouTube video");
      } finally {
        setIsLoading(false);
      }
    };

    searchYouTube();
  }, [song.title, song.composer]);

  if (isLoading) {
    return (
      <Card className="w-full jazz-card-light dark:jazz-card-dark border-amber-200/50 dark:border-amber-800/30">
        <CardContent
          className="p-6 flex justify-center items-center"
          style={{ minHeight: "240px" }}
        >
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-amber-600 dark:text-amber-400 mx-auto mb-2 animate-spin" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Searching YouTube...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !videoId) {
    return (
      <Card className="w-full jazz-card-light dark:jazz-card-dark border-amber-200/50 dark:border-amber-800/30">
        <CardContent
          className="p-6 flex justify-center items-center"
          style={{ minHeight: "240px" }}
        >
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-amber-600 dark:text-amber-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {error || "No YouTube video available"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full jazz-card-light dark:jazz-card-dark border-amber-200/50 dark:border-amber-800/30">
      <CardContent className="p-6">
        <div className="aspect-video">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title={`${song.title} by ${song.composer}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full rounded-md"
          ></iframe>
        </div>
        <div className="text-center text-xs text-gray-500 dark:text-gray-500 pt-2">
          <p>Video from YouTube</p>
        </div>
      </CardContent>
    </Card>
  );
}
