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

  // Get the login URL for Spotify OAuth
  getLoginUrl() {
    const state = this.generateRandomString(16);
    localStorage.setItem(this.stateKey, state);

    const params = new URLSearchParams({
      response_type: "token",
      client_id: this.clientId,
      scope: this.scopes.join(" "),
      redirect_uri: this.redirectUri,
      state: state,
      show_dialog: true,
    });

    return `https://accounts.spotify.com/authorize?${params.toString()}`;
  }

  // Handle the callback from Spotify OAuth
  handleCallback() {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);

    const token = params.get("access_token");
    const state = params.get("state");
    const storedState = localStorage.getItem(this.stateKey);

    if (token && state === storedState) {
      localStorage.removeItem(this.stateKey);
      localStorage.setItem(this.tokenKey, token);

      // Store expiration time (default 1 hour)
      const expiresIn = params.get("expires_in") || 3600;
      const expirationTime = Date.now() + expiresIn * 1000;
      localStorage.setItem(
        `${this.tokenKey}_expiration`,
        expirationTime.toString()
      );

      return { success: true, token };
    } else {
      return { success: false, error: "Authentication failed" };
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
      this.logout();
      return null;
    }

    return token;
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
  }
}

// Create a singleton instance
export const spotifyAuth = new SpotifyAuth();
