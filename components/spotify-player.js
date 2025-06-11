"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { spotifyAuth } from "@/lib/spotify-auth";
import SpotifyLoginButton from "./spotify-login-button";

export default function SpotifyPlayer({ song }) {
  const [player, setPlayer] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [deviceId, setDeviceId] = useState(null);
  const [trackUri, setTrackUri] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const scriptLoaded = useRef(false);

  // Check if we have a valid Spotify ID
  const spotifyId = song.spotifyId || extractSpotifyId(song.previewUrl);
  const isLoggedIn = spotifyAuth.isLoggedIn();

  // Load Spotify Web Playback SDK
  useEffect(() => {
    if (!isLoggedIn || scriptLoaded.current) return;

    // Load the Spotify Web Playback SDK
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      scriptLoaded.current = true;
      initializePlayer();
    };

    // Check if user has Spotify Premium
    const checkPremium = async () => {
      try {
        const token = spotifyAuth.getToken();
        if (!token) return;

        const response = await fetch("https://api.spotify.com/v1/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setIsPremium(data.product === "premium");
        }
      } catch (err) {
        console.error("Error checking Spotify subscription:", err);
      }
    };

    checkPremium();

    return () => {
      window.onSpotifyWebPlaybackSDKReady = null;
      if (player) {
        player.disconnect();
      }
    };
  }, [isLoggedIn]);

  // Initialize player when SDK is ready
  const initializePlayer = () => {
    if (!window.Spotify || !spotifyAuth.isLoggedIn()) return;

    const token = spotifyAuth.getToken();
    if (!token) return;

    const newPlayer = new window.Spotify.Player({
      name: "Jazz Classics Web Player",
      getOAuthToken: (cb) => {
        cb(token);
      },
      volume: volume / 100,
    });

    // Error handling
    newPlayer.addListener("initialization_error", ({ message }) => {
      console.error("Initialization error:", message);
      setError("Failed to initialize Spotify player");
    });

    newPlayer.addListener("authentication_error", ({ message }) => {
      console.error("Authentication error:", message);
      setError("Spotify authentication failed");
      spotifyAuth.logout();
    });

    newPlayer.addListener("account_error", ({ message }) => {
      console.error("Account error:", message);
      setError("Spotify Premium required for playback");
      setIsPremium(false);
    });

    newPlayer.addListener("playback_error", ({ message }) => {
      console.error("Playback error:", message);
      setError("Playback error occurred");
    });

    // Ready
    newPlayer.addListener("ready", ({ device_id }) => {
      console.log("Spotify player ready with device ID:", device_id);
      setDeviceId(device_id);
      setIsReady(true);
      setError(null);
    });

    // Not Ready
    newPlayer.addListener("not_ready", ({ device_id }) => {
      console.log("Device ID has gone offline", device_id);
      setIsReady(false);
    });

    // Player State
    newPlayer.addListener("player_state_changed", (state) => {
      if (!state) return;

      setCurrentTime(state.position);
      setDuration(state.duration);
      setIsPlaying(!state.paused);

      // Update track URI
      if (state.track_window?.current_track) {
        setTrackUri(state.track_window.current_track.uri);
      }
    });

    newPlayer.connect().then((success) => {
      if (success) {
        console.log("Spotify player connected successfully");
        setPlayer(newPlayer);
      } else {
        console.error("Failed to connect Spotify player");
        setError("Failed to connect Spotify player");
      }
    });

    return () => {
      newPlayer.disconnect();
    };
  };

  // Play a track
  const playTrack = async () => {
    if (!isReady || !deviceId || !spotifyId) return;

    setIsLoading(true);
    const token = spotifyAuth.getToken();

    try {
      await fetch(
        `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            uris: [`spotify:track:${spotifyId}`],
          }),
        }
      );
      setIsPlaying(true);
    } catch (err) {
      console.error("Error playing track:", err);
      setError("Failed to play track");
    } finally {
      setIsLoading(false);
    }
  };

  // Pause playback
  const pausePlayback = async () => {
    if (!player) return;

    try {
      await player.pause();
      setIsPlaying(false);
    } catch (err) {
      console.error("Error pausing playback:", err);
    }
  };

  // Toggle play/pause
  const togglePlay = () => {
    if (isPlaying) {
      pausePlayback();
    } else {
      playTrack();
    }
  };

  // Handle seek
  const handleSeek = async (value) => {
    if (!player || !duration) return;

    const position = Math.round((value[0] / 100) * duration);
    try {
      await player.seek(position);
      setCurrentTime(position);
    } catch (err) {
      console.error("Error seeking:", err);
    }
  };

  // Handle volume change
  const handleVolumeChange = (value) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (player) {
      player.setVolume(newVolume / 100);
    }
    setIsMuted(newVolume === 0);
  };

  // Toggle mute
  const toggleMute = () => {
    if (isMuted) {
      if (player) {
        player.setVolume(volume / 100);
      }
      setIsMuted(false);
    } else {
      if (player) {
        player.setVolume(0);
      }
      setIsMuted(true);
    }
  };

  // Format time
  const formatTime = (ms) => {
    if (!ms || isNaN(ms)) return "0:00";
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor(ms / 1000 / 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Extract Spotify ID from URL
  function extractSpotifyId(url) {
    if (!url) return null;

    // Try to extract from preview URL
    const previewMatch = url.match(/track\/([a-zA-Z0-9]+)/);
    if (previewMatch && previewMatch[1]) {
      return previewMatch[1];
    }

    return null;
  }

  // Calculate progress
  const progress = duration ? (currentTime / duration) * 100 : 0;

  // Open in Spotify
  const openInSpotify = () => {
    if (!spotifyId) return;
    window.open(`https://open.spotify.com/track/${spotifyId}`, "_blank");
  };

  return (
    <Card className="w-full jazz-card-light dark:jazz-card-dark border-amber-200/50 dark:border-amber-800/30">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Song Info */}
          <div className="text-center">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-amber-100">
              {song.title}
            </h3>
            <p className="text-muted-foreground dark:text-gray-400">
              {song.composer}
            </p>
          </div>

          {/* Spotify Login */}
          {!isLoggedIn && (
            <div className="text-center py-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Connect your Spotify Premium account to play full songs
              </p>
              <div className="flex justify-center">
                <SpotifyLoginButton />
              </div>
            </div>
          )}

          {/* Premium Required */}
          {isLoggedIn && !isPremium && (
            <div className="text-center py-4">
              <AlertCircle className="w-8 h-8 text-amber-600 dark:text-amber-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Spotify Premium is required for full song playback
              </p>
              <Button
                variant="link"
                size="sm"
                className="text-[#1DB954] hover:text-[#1aa34a] mt-2"
                onClick={() =>
                  window.open("https://www.spotify.com/premium", "_blank")
                }
              >
                Get Spotify Premium
              </Button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="text-center py-2">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Player Controls */}
          {isLoggedIn && isPremium && (
            <>
              {/* Progress Bar */}
              <div className="space-y-2">
                <Slider
                  value={[progress]}
                  onValueChange={handleSeek}
                  max={100}
                  step={1}
                  className="w-full"
                  disabled={!isReady || !duration}
                />
                <div className="flex justify-between text-sm text-muted-foreground dark:text-gray-400">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center space-x-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={togglePlay}
                  disabled={!isReady || isLoading || !spotifyId}
                  className="h-12 w-12 border-amber-600 dark:border-amber-400 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                >
                  {isLoading ? (
                    <div className="animate-spin w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full" />
                  ) : isPlaying ? (
                    <Pause className="h-6 w-6" />
                  ) : (
                    <Play className="h-6 w-6" />
                  )}
                </Button>

                {spotifyId && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={openInSpotify}
                    className="h-8 w-8 text-[#1DB954]"
                    title="Open in Spotify"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Volume Control */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMute}
                  className="h-8 w-8 text-gray-600 dark:text-gray-400"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  onValueChange={handleVolumeChange}
                  max={100}
                  step={1}
                  className="flex-1"
                />
              </div>
            </>
          )}

          {/* Spotify Attribution */}
          <div className="text-center text-xs text-gray-500 dark:text-gray-500 pt-2">
            <p>Powered by Spotify</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
