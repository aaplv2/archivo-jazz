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
  Loader2,
} from "lucide-react";
import { spotifyAuth } from "@/lib/spotify-auth";
import SpotifyLoginButton from "./spotify-login-button";

export default function SpotifyPlayerImproved({ song }) {
  const [player, setPlayer] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [deviceId, setDeviceId] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const scriptLoaded = useRef(false);
  const intervalRef = useRef(null);
  const sdkReadyHandled = useRef(false);
  const playerInitialized = useRef(false);
  const playbackStarted = useRef(false);

  // Check if we have a valid Spotify ID
  const spotifyId = song.spotifyId || extractSpotifyId(song.previewUrl);
  const isLoggedIn = spotifyAuth.isLoggedIn();

  // Cleanup when component unmounts or user navigates away
  useEffect(() => {
    return () => {
      // Stop playback and cleanup
      if (player) {
        try {
          player.pause().catch(() => {});
          player.disconnect().catch(() => {});
        } catch (e) {
          // Ignore errors during cleanup
        }
      }

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [player]);

  // Initialize player when SDK becomes ready
  useEffect(() => {
    if (sdkLoaded && isLoggedIn && !playerInitialized.current) {
      console.log("SDK is ready, initializing player...");
      playerInitialized.current = true;
      initializePlayer();
    }
  }, [sdkLoaded, isLoggedIn]);

  // Load Spotify Web Playback SDK
  useEffect(() => {
    if (!isLoggedIn || scriptLoaded.current) return;

    const loadSpotifySDK = () => {
      return new Promise((resolve, reject) => {
        // Check if SDK is already loaded
        if (window.Spotify) {
          console.log("Spotify SDK already available");
          setSdkLoaded(true);
          resolve();
          return;
        }

        // Define the callback function BEFORE loading the script
        window.onSpotifyWebPlaybackSDKReady = () => {
          console.log("Spotify Web Playback SDK Ready");
          if (!sdkReadyHandled.current) {
            sdkReadyHandled.current = true;
            setSdkLoaded(true);
            resolve();
          }
        };

        // Create script element
        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;

        script.onload = () => {
          console.log("Spotify SDK script loaded");
          scriptLoaded.current = true;
        };

        script.onerror = () => {
          console.error("Failed to load Spotify SDK script");
          reject(new Error("Failed to load Spotify SDK"));
        };

        document.head.appendChild(script);

        // Fallback timeout
        setTimeout(() => {
          if (!sdkReadyHandled.current) {
            console.warn("Spotify SDK ready callback timeout");
            if (window.Spotify) {
              console.log("Spotify object found, setting SDK as loaded");
              setSdkLoaded(true);
              resolve();
            } else {
              reject(new Error("Spotify SDK ready timeout"));
            }
          }
        }, 10000);
      });
    };

    const initializeSpotify = async () => {
      try {
        setIsLoading(true);
        setError(null);

        await loadSpotifySDK();
        console.log("SDK loaded successfully");

        // Check Premium status
        await checkPremiumStatus();
      } catch (err) {
        console.error("Error loading Spotify SDK:", err);
        setError(`Failed to load Spotify player: ${err.message}`);
        setIsLoading(false);
      }
    };

    initializeSpotify();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isLoggedIn]);

  // Check Premium status
  const checkPremiumStatus = async () => {
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
        console.log("User subscription:", data.product);
      } else if (response.status === 401) {
        spotifyAuth.logout();
        setError("Session expired. Please reconnect to Spotify.");
      }
    } catch (err) {
      console.error("Error checking Spotify subscription:", err);
    }
  };

  // Initialize player when SDK is ready
  const initializePlayer = () => {
    console.log("initializePlayer called with:", {
      hasSpotify: !!window.Spotify,
      isLoggedIn: spotifyAuth.isLoggedIn(),
      sdkLoaded,
    });

    if (!window.Spotify) {
      console.error("Spotify SDK not available");
      setError("Spotify SDK not loaded");
      setIsLoading(false);
      return;
    }

    if (!spotifyAuth.isLoggedIn()) {
      console.error("User not logged in");
      setError("Please log in to Spotify");
      setIsLoading(false);
      return;
    }

    const token = spotifyAuth.getToken();
    if (!token) {
      setError("No valid token available");
      setIsLoading(false);
      return;
    }

    try {
      console.log("Creating Spotify Player...");

      const newPlayer = new window.Spotify.Player({
        name: "Jazz Classics Web Player",
        getOAuthToken: (cb) => {
          const currentToken = spotifyAuth.getToken();
          if (currentToken) {
            cb(currentToken);
          } else {
            setError("Authentication expired. Please reconnect.");
            spotifyAuth.logout();
          }
        },
        volume: volume / 100,
      });

      // Error handling
      newPlayer.addListener("initialization_error", ({ message }) => {
        console.error("Initialization error:", message);
        setError("Failed to initialize Spotify player");
        setIsLoading(false);
      });

      newPlayer.addListener("authentication_error", ({ message }) => {
        console.error("Authentication error:", message);
        setError("Spotify authentication failed");
        spotifyAuth.logout();
        setIsLoading(false);
      });

      newPlayer.addListener("account_error", ({ message }) => {
        console.error("Account error:", message);
        setError("Spotify Premium required for playback");
        setIsPremium(false);
        setIsLoading(false);
      });

      newPlayer.addListener("playback_error", ({ message }) => {
        console.error("Playback error:", message);
        // Don't show errors for cpapi.spotify.com 404s
        if (!message.includes("cpapi.spotify.com")) {
          setError("Playback error occurred");
        }
      });

      // Ready
      newPlayer.addListener("ready", ({ device_id }) => {
        console.log("Spotify player ready with device ID:", device_id);
        setDeviceId(device_id);
        setIsReady(true);
        setError(null);
        setIsLoading(false);
      });

      // Not Ready
      newPlayer.addListener("not_ready", ({ device_id }) => {
        console.log("Device ID has gone offline", device_id);
        setIsReady(false);
      });

      // Player State Changed - This is crucial for progress tracking
      newPlayer.addListener("player_state_changed", (state) => {
        if (!state) {
          console.log("No state available");
          return;
        }

        // Update playback state
        setIsPlaying(!state.paused);

        // Only update time if we're actually playing
        if (!state.paused) {
          setCurrentTime(state.position);
          setDuration(state.duration);
        }

        // Update current track info
        if (state.track_window?.current_track) {
          setCurrentTrack(state.track_window.current_track);
        }

        // Start progress tracking if we're playing
        if (!state.paused && !intervalRef.current) {
          startProgressTracking(newPlayer);
        } else if (state.paused && intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      });

      // Connect player
      console.log("Connecting Spotify player...");
      newPlayer.connect().then((success) => {
        if (success) {
          console.log("Spotify player connected successfully");
          setPlayer(newPlayer);
        } else {
          console.error("Failed to connect Spotify player");
          setError("Failed to connect Spotify player");
          setIsLoading(false);
        }
      });
    } catch (err) {
      console.error("Error initializing player:", err);
      setError(`Failed to initialize player: ${err.message}`);
      setIsLoading(false);
    }
  };

  // Start progress tracking
  const startProgressTracking = (playerInstance) => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Set up a new interval
    intervalRef.current = setInterval(() => {
      playerInstance
        .getCurrentState()
        .then((state) => {
          if (state && !state.paused) {
            setCurrentTime(state.position);
          }
        })
        .catch(() => {
          // Ignore errors during polling
        });
    }, 1000);
  };

  // Play a track using the REST API instead of the SDK
  const playTrack = async () => {
    if (!isReady || !deviceId || !spotifyId) {
      console.log("Cannot play track:", { isReady, deviceId, spotifyId });
      return;
    }

    setIsLoading(true);
    const token = spotifyAuth.getToken();

    try {
      console.log(`Playing track: ${spotifyId} on device: ${deviceId}`);

      // Use the REST API to start playback
      const response = await fetch(
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

      if (response.ok) {
        console.log("Track play request successful");
        playbackStarted.current = true;

        // Let the player_state_changed event handle the rest
        // This avoids conflicts between the REST API and the SDK
      } else if (response.status === 401) {
        setError("Session expired. Please reconnect to Spotify.");
        spotifyAuth.logout();
      } else if (response.status === 404) {
        setError("Device not found. Please refresh and try again.");
      } else {
        const errorData = await response.json();
        console.error("Play track error:", errorData);
        setError(errorData.error?.message || "Failed to play track");
      }
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
      // Let the player_state_changed event handle the state update
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
    const previewMatch = url.match(/track\/([a-zA-Z0-9]+)/);
    return previewMatch?.[1] || null;
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
            {currentTrack && (
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Now playing: {currentTrack.name} by{" "}
                {currentTrack.artists[0]?.name}
              </p>
            )}
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

          {/* Loading State */}
          {isLoggedIn && (isLoading || !isReady) && !error && (
            <div className="text-center py-4">
              <Loader2 className="w-8 h-8 text-[#1DB954] mx-auto mb-2 animate-spin" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {!sdkLoaded
                  ? "Loading Spotify SDK..."
                  : !isReady
                  ? "Initializing player..."
                  : "Setting up playback..."}
              </p>
            </div>
          )}

          {/* Premium Required */}
          {isLoggedIn && !isPremium && !isLoading && (
            <div className="text-center py-4">
              <AlertCircle className="w-8 h-8 text-amber-600 dark:text-amber-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Spotify Premium is required for full song playback
              </p>
              <Button
                variant="outline"
                size="sm"
                className="bg-[#1DB954] text-white hover:bg-[#1aa34a] border-[#1DB954]"
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
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 mx-auto mb-1" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              {error.includes("reconnect") && (
                <div className="mt-2">
                  <SpotifyLoginButton />
                </div>
              )}
            </div>
          )}

          {/* No Spotify ID */}
          {isLoggedIn && isPremium && !spotifyId && !isLoading && (
            <div className="text-center py-4">
              <AlertCircle className="w-8 h-8 text-amber-600 dark:text-amber-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This song is not available on Spotify
              </p>
            </div>
          )}

          {/* Player Controls */}
          {isLoggedIn && isPremium && spotifyId && isReady && (
            <>
              {/* Progress Bar */}
              <div className="space-y-2">
                <Slider
                  value={[progress]}
                  onValueChange={handleSeek}
                  max={100}
                  step={1}
                  className="w-full"
                  disabled={!duration}
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
                  disabled={isLoading}
                  className="h-12 w-12 border-[#1DB954] text-[#1DB954] hover:bg-[#1DB954]/10"
                >
                  {isLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="h-6 w-6" />
                  ) : (
                    <Play className="h-6 w-6" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={openInSpotify}
                  className="h-8 w-8 text-[#1DB954] hover:bg-[#1DB954]/10"
                  title="Open in Spotify"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
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
          <div className="text-center text-xs text-gray-500 dark:text-gray-500 pt-2 border-t border-gray-200 dark:border-gray-700">
            <p>Powered by Spotify</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
