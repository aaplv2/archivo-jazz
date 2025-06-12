/**
 * Custom error class for Spotify-related errors
 */
export class SpotifyError extends Error {
  constructor(message, code) {
    super(message);
    this.name = "SpotifyError";
    this.code = code;
  }
}

/**
 * Error handler for Spotify authentication errors
 */
export function handleAuthError(error) {
  console.error("Authentication error:", error);

  if (error.code === "not_logged_in") {
    return {
      type: "auth",
      message: "Please log in to Spotify",
      action: "login",
    };
  }

  if (error.code === "no_token") {
    return {
      type: "auth",
      message: "Session expired. Please reconnect to Spotify.",
      action: "login",
    };
  }

  return {
    type: "auth",
    message: "Authentication failed. Please try again.",
    action: "login",
  };
}

/**
 * Error handler for Spotify player errors
 */
export function handlePlayerError(error) {
  console.error("Player error:", error);

  if (error.code === "sdk_not_available") {
    return {
      type: "player",
      message: "Spotify player could not be loaded. Please refresh the page.",
      action: "refresh",
    };
  }

  if (error.code === "connection_failed") {
    return {
      type: "player",
      message: "Failed to connect to Spotify. Please refresh and try again.",
      action: "refresh",
    };
  }

  if (error.code === "player_not_ready") {
    return {
      type: "player",
      message: "Player not ready. Please wait a moment and try again.",
      action: "wait",
    };
  }

  return {
    type: "player",
    message: "An error occurred with the Spotify player.",
    action: "refresh",
  };
}

/**
 * Error handler for Spotify playback errors
 */
export function handlePlaybackError(error) {
  console.error("Playback error:", error);

  if (error.message?.includes("premium")) {
    return {
      type: "account",
      message: "Spotify Premium is required for playback",
      action: "upgrade",
    };
  }

  if (error.message?.includes("device")) {
    return {
      type: "device",
      message: "Device not found. Please refresh and try again.",
      action: "refresh",
    };
  }

  return {
    type: "playback",
    message: "Failed to play track. Please try again.",
    action: "retry",
  };
}
