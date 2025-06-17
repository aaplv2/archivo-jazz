import { spotifyService } from "./spotify-services";
import { SpotifyError } from "../utils/error-handlers";

/**
 * Service for handling Spotify Web Playback SDK
 */
export class SpotifyPlayerService {
  constructor() {
    this.player = null;
    this.deviceId = null;
    this.isReady = false;
    this.sdkLoaded = false;
    this.volume = 0.7;
    this.callbacks = {
      onReady: () => {},
      onNotReady: () => {},
      onPlayerStateChanged: () => {},
      onError: () => {},
      onInitializationError: () => {},
      onAuthenticationError: () => {},
      onAccountError: () => {},
      onPlaybackError: () => {},
    };
  }

  // Register callbacks
  registerCallbacks(callbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  // Load the Spotify Web Playback SDK
  async loadSpotifySDK() {
    return new Promise((resolve, reject) => {
      // Check if SDK is already loaded
      if (window.Spotify) {
        this.sdkLoaded = true;
        resolve();
        return;
      }

      // Define the callback function BEFORE loading the script
      window.onSpotifyWebPlaybackSDKReady = () => {
        this.sdkLoaded = true;
        resolve();
      };

      // Create script element
      const script = document.createElement("script");
      script.src = "https://sdk.scdn.co/spotify-player.js";
      script.async = true;

      script.onerror = () => {
        reject(
          new SpotifyError("Failed to load Spotify SDK", "sdk_load_error")
        );
      };

      document.head.appendChild(script);

      // Fallback timeout
      setTimeout(() => {
        if (!this.sdkLoaded) {
          if (window.Spotify) {
            this.sdkLoaded = true;
            resolve();
          } else {
            reject(
              new SpotifyError("Spotify SDK ready timeout", "sdk_timeout")
            );
          }
        }
      }, 10000);
    });
  }

  // Initialize the player
  async initializePlayer() {
    if (!window.Spotify) {
      throw new SpotifyError("Spotify SDK not available", "sdk_not_available");
    }

    if (!spotifyService.isLoggedIn()) {
      throw new SpotifyError("User not logged in", "not_logged_in");
    }

    const token = spotifyService.getToken();
    if (!token) {
      throw new SpotifyError("No valid token available", "no_token");
    }

    // Create the player instance
    this.player = new window.Spotify.Player({
      name: "Jazz Classics Web Player",
      getOAuthToken: (cb) => {
        const currentToken = spotifyService.getToken();
        if (currentToken) {
          cb(currentToken);
        } else {
          this.callbacks.onAuthenticationError({
            message: "Authentication expired",
          });
          spotifyService.logout();
        }
      },
      volume: this.volume,
    });

    // Set up event listeners
    this.player.addListener("ready", ({ device_id }) => {
      this.deviceId = device_id;
      this.isReady = true;
      this.callbacks.onReady({ deviceId: device_id });
    });

    this.player.addListener("not_ready", ({ device_id }) => {
      this.isReady = false;
      this.callbacks.onNotReady({ deviceId: device_id });
    });

    this.player.addListener("player_state_changed", (state) => {
      this.callbacks.onPlayerStateChanged(state);
    });

    this.player.addListener("initialization_error", (error) => {
      this.callbacks.onInitializationError(error);
    });

    this.player.addListener("authentication_error", (error) => {
      this.callbacks.onAuthenticationError(error);
      spotifyService.logout();
    });

    this.player.addListener("account_error", (error) => {
      this.callbacks.onAccountError(error);
    });

    this.player.addListener("playback_error", (error) => {
      // Filter out cpapi.spotify.com errors
      if (!error.message.includes("cpapi.spotify.com")) {
        this.callbacks.onPlaybackError(error);
      }
    });

    // Connect the player
    const connected = await this.player.connect();
    if (!connected) {
      throw new SpotifyError(
        "Failed to connect Spotify player",
        "connection_failed"
      );
    }

    return this.player;
  }

  // Play a track
  async playTrack(trackId) {
    if (!this.isReady || !this.deviceId || !trackId) {
      throw new SpotifyError(
        "Player not ready or missing track ID",
        "player_not_ready"
      );
    }

    return await spotifyService.playTrack(this.deviceId, trackId);
  }

  // Pause playback
  async pausePlayback() {
    if (!this.player) {
      throw new SpotifyError(
        "Player not initialized",
        "player_not_initialized"
      );
    }

    try {
      await this.player.pause();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Seek to position
  async seekToPosition(positionMs) {
    if (!this.player) {
      throw new SpotifyError(
        "Player not initialized",
        "player_not_initialized"
      );
    }

    try {
      await this.player.seek(positionMs);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Set volume
  async setVolume(volumePercent) {
    if (!this.player) {
      throw new SpotifyError(
        "Player not initialized",
        "player_not_initialized"
      );
    }

    try {
      const volume = volumePercent / 100;
      this.volume = volume;
      await this.player.setVolume(volume);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get current playback state
  async getCurrentState() {
    if (!this.player) {
      throw new SpotifyError(
        "Player not initialized",
        "player_not_initialized"
      );
    }

    try {
      return await this.player.getCurrentState();
    } catch (error) {
      throw new SpotifyError(
        "Failed to get current state",
        "state_fetch_failed"
      );
    }
  }

  // Disconnect the player
  disconnect() {
    if (this.player) {
      try {
        // Remove all listeners before disconnecting
        this.player.removeListener("ready");
        this.player.removeListener("not_ready");
        this.player.removeListener("player_state_changed");
        this.player.removeListener("initialization_error");
        this.player.removeListener("authentication_error");
        this.player.removeListener("account_error");
        this.player.removeListener("playback_error");

        // Disconnect the player
        this.player.disconnect();
        console.log("Spotify player disconnected successfully");
      } catch (error) {
        console.error("Error disconnecting player:", error);
      } finally {
        this.player = null;
      }
    }

    this.deviceId = null;
    this.isReady = false;
  }

  // Cleanup method to properly release resources
  cleanup() {
    // Clear any intervals
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }

    // Disconnect the player
    this.disconnect();

    // Reset all state
    this.deviceId = null;
    this.isReady = false;
    this.sdkLoaded = false;
    this.callbacks = {
      onReady: () => {},
      onNotReady: () => {},
      onPlayerStateChanged: () => {},
      onError: () => {},
      onInitializationError: () => {},
      onAuthenticationError: () => {},
      onAccountError: () => {},
      onPlaybackError: () => {},
    };
  }
}
