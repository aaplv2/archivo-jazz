// Spotify authentication helper
export class SpotifyAuth {
  constructor() {
    this.clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
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
    this.tokenKey = "spotify_auth_token";
    this.stateKey = "spotify_auth_state";
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

      console.log("PKCE Debug:", {
        verifier: codeVerifier.substring(0, 10) + "...",
        challenge: codeChallenge.substring(0, 10) + "...",
        method: "S256",
      });

      // Use the authorization code flow with PKCE
      const params = new URLSearchParams({
        client_id: this.clientId,
        response_type: "code",
        redirect_uri: this.redirectUri,
        state: state,
        scope: this.scopes.join(" "),
        code_challenge_method: "S256", // Changed to S256
        code_challenge: codeChallenge,
        show_dialog: "true",
      });

      const loginUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;
      console.log("Login URL generated successfully");
      return loginUrl;
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

      console.log("Exchanging code for token...");

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
        console.error("Token exchange failed:", errorData);
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

      console.log("Token exchange successful");
      return {
        success: true,
        token: data.access_token,
      };
    } catch (error) {
      console.error("Token exchange error:", error);
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

      console.log("Callback params:", {
        code: !!code,
        state,
        error,
        errorDescription,
      });

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
      return await this.exchangeCodeForToken(code);
    } catch (error) {
      console.error("Callback handling error:", error);
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
      console.error("Token refresh error:", error);
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
  }

  // Get current domain for debugging
  getCurrentDomain() {
    if (typeof window === "undefined") return "server-side";
    return window.location.origin;
  }
}

// Create a singleton instance
export const spotifyAuth = new SpotifyAuth();
