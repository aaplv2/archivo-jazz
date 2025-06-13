/**
 * Core Spotify service for handling authentication and API interactions
 */
export class SpotifyService {
  constructor() {
    this.clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
    this.tokenKey = "spotify_auth_token";
    this.stateKey = "spotify_auth_state";
    this.redirectUri =
      typeof window !== "undefined"
        ? `${window.location.origin}/spotify-callback`
        : "";
    this.scopes = [
      "streaming",
      "user-read-email",
      "user-read-private",
      "user-read-playback-state",
      "user-modify-playback-state",
    ];
    // Store the user's market/country code
    this.userMarket =
      typeof window !== "undefined"
        ? localStorage.getItem("user_market") || "US"
        : "US";
  }

  // Generate a random string for state verification
  generateRandomString(length) {
    let text = "";
    const possible =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  // Generate code verifier for PKCE
  generateCodeVerifier() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return this.base64URLEncode(array);
  }

  // Base64 URL encode
  base64URLEncode(buffer) {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");
  }

  // Generate code challenge from verifier using SHA-256
  async generateCodeChallenge(verifier) {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return this.base64URLEncode(digest);
  }

  // Get the login URL for Spotify OAuth - using Authorization Code with PKCE flow
  async getLoginUrl() {
    if (!this.clientId) {
      console.error(
        "Spotify Client ID not found. Please check your environment variables."
      );
      return null;
    }

    try {
      // Generate and store state for security
      const state = this.generateRandomString(16);
      localStorage.setItem(this.stateKey, state);

      // Generate code verifier and challenge for PKCE
      const codeVerifier = this.generateCodeVerifier();
      localStorage.setItem("code_verifier", codeVerifier);

      // Create code challenge using S256 method
      const codeChallenge = await this.generateCodeChallenge(codeVerifier);

      // Use the authorization code flow with PKCE
      const params = new URLSearchParams({
        client_id: this.clientId,
        response_type: "code",
        redirect_uri: this.redirectUri,
        state: state,
        scope: this.scopes.join(" "),
        code_challenge_method: "S256",
        code_challenge: codeChallenge,
        show_dialog: "true",
      });

      return `https://accounts.spotify.com/authorize?${params.toString()}`;
    } catch (error) {
      console.error("Error generating login URL:", error);
      return null;
    }
  }

  // Exchange authorization code for access token
  async exchangeCodeForToken(code) {
    try {
      const codeVerifier = localStorage.getItem("code_verifier");
      if (!codeVerifier) {
        throw new Error("Code verifier not found");
      }

      // Create a server-side API route to handle the token exchange
      const response = await fetch("/api/spotify/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          redirectUri: this.redirectUri,
          codeVerifier,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to exchange code for token");
      }

      const data = await response.json();

      // Store the tokens
      localStorage.setItem(this.tokenKey, data.access_token);

      // Store expiration time
      const expiresIn = data.expires_in || 3600;
      const expirationTime = Date.now() + expiresIn * 1000;
      localStorage.setItem(
        `${this.tokenKey}_expiration`,
        expirationTime.toString()
      );

      // Store refresh token if available
      if (data.refresh_token) {
        localStorage.setItem(`${this.tokenKey}_refresh`, data.refresh_token);
      }

      // Clean up code verifier
      localStorage.removeItem("code_verifier");

      return {
        success: true,
        token: data.access_token,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to exchange code for token",
      };
    }
  }

  // Handle the callback from Spotify OAuth
  async handleCallback() {
    try {
      // Check for authorization code in URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      const state = urlParams.get("state");
      const error = urlParams.get("error");
      const errorDescription = urlParams.get("error_description");

      // Check for errors first
      if (error) {
        return {
          success: false,
          error: errorDescription || error || "Authentication failed",
        };
      }

      // Verify state
      const storedState = localStorage.getItem(this.stateKey);
      if (state !== storedState) {
        return { success: false, error: "State verification failed" };
      }

      // Clear state
      localStorage.removeItem(this.stateKey);

      if (!code) {
        return { success: false, error: "No authorization code received" };
      }

      // Exchange code for token
      const tokenResult = await this.exchangeCodeForToken(code);

      // If successful, get user profile to determine market
      if (tokenResult.success) {
        await this.updateUserMarket();
      }

      return tokenResult;
    } catch (error) {
      return { success: false, error: "Failed to process authentication" };
    }
  }

  // Get the stored token
  getToken() {
    if (typeof window === "undefined") return null;

    const token = localStorage.getItem(this.tokenKey);
    const expirationTime = localStorage.getItem(`${this.tokenKey}_expiration`);

    if (!token || !expirationTime) return null;

    // Check if token is expired
    if (Date.now() > Number.parseInt(expirationTime)) {
      // Try to refresh the token
      this.refreshToken();
      return null;
    }

    return token;
  }

  // Refresh the access token
  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem(`${this.tokenKey}_refresh`);
      if (!refreshToken) {
        this.logout();
        return { success: false, error: "No refresh token available" };
      }

      const response = await fetch("/api/spotify/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refreshToken,
        }),
      });

      if (!response.ok) {
        this.logout();
        return { success: false, error: "Failed to refresh token" };
      }

      const data = await response.json();

      // Store the new access token
      localStorage.setItem(this.tokenKey, data.access_token);

      // Update expiration time
      const expiresIn = data.expires_in || 3600;
      const expirationTime = Date.now() + expiresIn * 1000;
      localStorage.setItem(
        `${this.tokenKey}_expiration`,
        expirationTime.toString()
      );

      // Store new refresh token if provided
      if (data.refresh_token) {
        localStorage.setItem(`${this.tokenKey}_refresh`, data.refresh_token);
      }

      return { success: true, token: data.access_token };
    } catch (error) {
      this.logout();
      return { success: false, error: "Failed to refresh token" };
    }
  }

  // Check if user is logged in
  isLoggedIn() {
    return !!this.getToken();
  }

  // Logout user
  logout() {
    if (typeof window === "undefined") return;

    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(`${this.tokenKey}_expiration`);
    localStorage.removeItem(`${this.tokenKey}_refresh`);
    localStorage.removeItem(this.stateKey);
    localStorage.removeItem("code_verifier");
    // Don't remove user_market to preserve region settings
  }

  // Get user profile information
  async getUserProfile() {
    try {
      const token = this.getToken();
      if (!token) return null;

      const response = await fetch("https://api.spotify.com/v1/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.logout();
        }
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  }

  // Update user market from profile
  async updateUserMarket() {
    try {
      const profile = await this.getUserProfile();
      if (profile && profile.country) {
        this.userMarket = profile.country;
        localStorage.setItem("user_market", profile.country);
        console.log(`User market set to: ${profile.country}`);
      }
    } catch (error) {
      console.error("Error updating user market:", error);
    }
  }

  // Get user's market/country
  getUserMarket() {
    // Try to get from localStorage first
    if (typeof window !== "undefined") {
      const storedMarket = localStorage.getItem("user_market");
      if (storedMarket) {
        this.userMarket = storedMarket;
        return storedMarket;
      }
    }
    return this.userMarket;
  }

  // Set user's market/country manually
  setUserMarket(marketCode) {
    if (typeof window !== "undefined" && marketCode) {
      this.userMarket = marketCode;
      localStorage.setItem("user_market", marketCode);
    }
  }

  // Check if user has Spotify Premium
  async checkPremiumStatus() {
    try {
      const profile = await this.getUserProfile();
      return profile?.product === "premium";
    } catch (error) {
      return false;
    }
  }

  // Play a track on the specified device
  async playTrack(deviceId, trackId) {
    try {
      const token = this.getToken();
      if (!token || !deviceId || !trackId)
        return { success: false, error: "Missing required parameters" };

      // Include market parameter to respect user's region
      const market = this.getUserMarket();

      const response = await fetch(
        `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            uris: [`spotify:track:${trackId}`],
            market: market, // Add market parameter
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          this.logout();
          return { success: false, error: "Session expired" };
        }

        if (response.status === 404) {
          return { success: false, error: "Device not found" };
        }

        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error?.message || "Failed to play track",
        };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || "Failed to play track" };
    }
  }

  // Search for tracks with market parameter
  async searchTrack(query) {
    try {
      const token = this.getToken();
      if (!token) return { success: false, error: "Not authenticated" };

      const market = this.getUserMarket();

      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(
          query
        )}&type=track&limit=1&market=${market}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        return { success: false, error: "Search failed" };
      }

      const data = await response.json();
      return {
        success: true,
        track: data.tracks?.items?.[0] || null,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Create a singleton instance
export const spotifyService = new SpotifyService();
