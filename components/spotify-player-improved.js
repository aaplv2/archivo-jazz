"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { spotifyService } from "@/lib/services/spotify-services";
import { SpotifyPlayerService } from "@/lib/services/spotify-player-service";
import {
  handleAuthError,
  handlePlayerError,
  handlePlaybackError,
} from "@/lib/utils/error-handlers";
import { extractSpotifyId } from "@/lib/utils/formatters";

// Import sub-components
import TrackInfo from "./spotify/track-info";
import ProgressBar from "./spotify/progress-bar";
import PlayerControls from "./spotify/player-controls";
import VolumeControl from "./spotify/volume-control";
import ErrorDisplay from "./spotify/error-display";
import LoginPrompt from "./spotify/login-prompt";
import PremiumPrompt from "./spotify/premium-prompt";
import LoadingState from "./spotify/loading-state";
import RegionSelector from "./spotify/region-selector";

export default function SpotifyPlayerImproved({ song }) {
  // State
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);

  // Refs
  const playerServiceRef = useRef(null);
  const intervalRef = useRef(null);

  // Extract Spotify ID
  const spotifyId = song.spotifyId || extractSpotifyId(song.previewUrl);
  const isLoggedIn = spotifyService.isLoggedIn();

  // Initialize player service
  useEffect(() => {
    if (!playerServiceRef.current) {
      playerServiceRef.current = new SpotifyPlayerService();
    }

    return () => {
      // Cleanup
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      if (playerServiceRef.current) {
        playerServiceRef.current.disconnect();
      }
    };
  }, []);

  // Load SDK and initialize player when logged in
  useEffect(() => {
    if (!isLoggedIn) return;

    const initializeSpotify = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const playerService = playerServiceRef.current;

        // Register callbacks
        playerService.registerCallbacks({
          onReady: ({ deviceId }) => {
            setIsReady(true);
            setError(null);
            setIsLoading(false);
          },
          onNotReady: () => {
            setIsReady(false);
          },
          onPlayerStateChanged: (state) => {
            if (!state) return;

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
              startProgressTracking();
            } else if (state.paused && intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
          },
          onInitializationError: (error) => {
            setError(
              handlePlayerError({ ...error, code: "initialization_error" })
            );
            setIsLoading(false);
          },
          onAuthenticationError: (error) => {
            setError(
              handleAuthError({ ...error, code: "authentication_error" })
            );
            setIsLoading(false);
          },
          onAccountError: (error) => {
            setIsPremium(false);
            setError(handlePlaybackError({ ...error, code: "account_error" }));
            setIsLoading(false);
          },
          onPlaybackError: (error) => {
            setError(handlePlaybackError(error));
          },
        });

        // Load SDK
        await playerService.loadSpotifySDK();
        setSdkLoaded(true);

        // Check Premium status
        const isPremium = await spotifyService.checkPremiumStatus();
        setIsPremium(isPremium);

        // Initialize player
        await playerService.initializePlayer();
      } catch (error) {
        if (error.name === "SpotifyError") {
          setError(handlePlayerError(error));
        } else {
          setError({
            type: "unknown",
            message: "An unexpected error occurred",
            action: "refresh",
          });
        }
        setIsLoading(false);
      }
    };

    initializeSpotify();
  }, [isLoggedIn]);

  // Start progress tracking
  const startProgressTracking = () => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Set up a new interval
    intervalRef.current = setInterval(() => {
      const playerService = playerServiceRef.current;
      if (!playerService || !playerService.player) return;

      playerService
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

  // Play a track
  const playTrack = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const playerService = playerServiceRef.current;
      if (!playerService) {
        throw new Error("Player service not initialized");
      }

      const result = await playerService.playTrack(spotifyId);

      if (!result.success) {
        setError(handlePlaybackError({ message: result.error }));
      }
    } catch (error) {
      setError(handlePlayerError(error));
    } finally {
      setIsLoading(false);
    }
  };

  // Pause playback
  const pausePlayback = async () => {
    try {
      const playerService = playerServiceRef.current;
      if (!playerService) return;

      await playerService.pausePlayback();
    } catch (error) {
      console.error("Error pausing playback:", error);
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
    try {
      const playerService = playerServiceRef.current;
      if (!playerService || !duration) return;

      const position = Math.round((value[0] / 100) * duration);
      await playerService.seekToPosition(position);
      setCurrentTime(position);
    } catch (error) {
      console.error("Error seeking:", error);
    }
  };

  // Handle volume change
  const handleVolumeChange = (value) => {
    const newVolume = value[0];
    setVolume(newVolume);

    const playerService = playerServiceRef.current;
    if (playerService) {
      playerService.setVolume(newVolume);
    }

    setIsMuted(newVolume === 0);
  };

  // Toggle mute
  const toggleMute = () => {
    const playerService = playerServiceRef.current;
    if (!playerService) return;

    if (isMuted) {
      playerService.setVolume(volume);
      setIsMuted(false);
    } else {
      playerService.setVolume(0);
      setIsMuted(true);
    }
  };

  // Open in Spotify
  const openInSpotify = () => {
    if (!spotifyId) return;
    window.open(`https://open.spotify.com/track/${spotifyId}`, "_blank");
  };

  // Determine loading message
  const getLoadingMessage = () => {
    if (!sdkLoaded) return "Loading Spotify SDK...";
    if (!isReady) return "Initializing player...";
    return "Setting up playback...";
  };

  return (
    <Card className="w-full jazz-card-light dark:jazz-card-dark border-amber-200/50 dark:border-amber-800/30">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Track Info */}
          <TrackInfo song={song} currentTrack={currentTrack} />

          {/* Region Selector - Added for location control */}
          {isLoggedIn && (
            <div className="flex justify-end">
              <RegionSelector />
            </div>
          )}

          {/* Login Prompt */}
          {!isLoggedIn && <LoginPrompt />}

          {/* Loading State */}
          {isLoggedIn && (isLoading || !isReady) && !error && (
            <LoadingState message={getLoadingMessage()} />
          )}

          {/* Premium Required */}
          {isLoggedIn && !isPremium && !isLoading && <PremiumPrompt />}

          {/* Error Display */}
          {error && <ErrorDisplay error={error} />}

          {/* No Spotify ID */}
          {isLoggedIn && isPremium && !spotifyId && !isLoading && (
            <div className="text-center py-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This song is not available on Spotify
              </p>
            </div>
          )}

          {/* Player Controls */}
          {isLoggedIn && isPremium && spotifyId && isReady && (
            <>
              {/* Progress Bar */}
              <ProgressBar
                currentTime={currentTime}
                duration={duration}
                onSeek={handleSeek}
                disabled={isLoading}
              />

              {/* Controls */}
              <PlayerControls
                isPlaying={isPlaying}
                isLoading={isLoading}
                onTogglePlay={togglePlay}
                onOpenInSpotify={openInSpotify}
                spotifyId={spotifyId}
              />

              {/* Volume Control */}
              <VolumeControl
                volume={volume}
                isMuted={isMuted}
                onVolumeChange={handleVolumeChange}
                onToggleMute={toggleMute}
              />
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
