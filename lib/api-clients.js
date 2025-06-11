// Last.fm API client
export class LastFmAPI {
  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_LASTFM_API_KEY;
    this.baseUrl = "https://ws.audioscrobbler.com/2.0/";
  }

  async searchTrack(artist, track) {
    if (!this.apiKey) {
      console.warn("Last.fm API key not found");
      return null;
    }

    const params = new URLSearchParams({
      method: "track.search",
      artist: artist,
      track: track,
      api_key: this.apiKey,
      format: "json",
      limit: 1,
    });

    try {
      const response = await fetch(`${this.baseUrl}?${params}`);

      if (!response.ok) {
        console.error(`Last.fm search API error: ${response.status}`);
        return null;
      }

      const data = await response.json();

      if (data.error) {
        console.error("Last.fm API error:", data.message);
        return null;
      }

      return data.results?.trackmatches?.track?.[0] || null;
    } catch (error) {
      console.error("Last.fm search API error:", error);
      return null;
    }
  }

  async getTrackInfo(artist, track) {
    if (!this.apiKey) {
      console.warn("Last.fm API key not found");
      return null;
    }

    const params = new URLSearchParams({
      method: "track.getInfo",
      artist: artist,
      track: track,
      api_key: this.apiKey,
      format: "json",
    });

    try {
      const response = await fetch(`${this.baseUrl}?${params}`);

      if (!response.ok) {
        console.error(`Last.fm track info API error: ${response.status}`);
        return null;
      }

      const data = await response.json();

      if (data.error) {
        console.error("Last.fm API error:", data.message);
        return null;
      }

      return data.track || null;
    } catch (error) {
      console.error("Last.fm track info error:", error);
      return null;
    }
  }

  async getArtistInfo(artist) {
    if (!this.apiKey) {
      console.warn("Last.fm API key not found");
      return null;
    }

    const params = new URLSearchParams({
      method: "artist.getInfo",
      artist: artist,
      api_key: this.apiKey,
      format: "json",
    });

    try {
      const response = await fetch(`${this.baseUrl}?${params}`);

      if (!response.ok) {
        console.error(`Last.fm artist info API error: ${response.status}`);
        return null;
      }

      const data = await response.json();

      if (data.error) {
        console.error("Last.fm API error:", data.message);
        return null;
      }

      return data.artist || null;
    } catch (error) {
      console.error("Last.fm artist info error:", error);
      return null;
    }
  }
}

// MusicBrainz API client
export class MusicBrainzAPI {
  constructor() {
    this.baseUrl = "https://musicbrainz.org/ws/2";
    this.userAgent = "JazzClassicsWebsite/1.0.0 (contact@example.com)";
  }

  async searchRecording(query) {
    const params = new URLSearchParams({
      query: query,
      fmt: "json",
      limit: 5,
    });

    try {
      const response = await fetch(`${this.baseUrl}/recording?${params}`, {
        headers: {
          "User-Agent": this.userAgent,
        },
      });

      if (!response.ok) {
        console.error(`MusicBrainz API error: ${response.status}`);
        return [];
      }

      const data = await response.json();
      return data.recordings || [];
    } catch (error) {
      console.error("MusicBrainz API error:", error);
      return [];
    }
  }

  async getRecordingDetails(mbid) {
    const params = new URLSearchParams({
      fmt: "json",
      inc: "artist-credits+releases+tags",
    });

    try {
      const response = await fetch(
        `${this.baseUrl}/recording/${mbid}?${params}`,
        {
          headers: {
            "User-Agent": this.userAgent,
          },
        }
      );

      if (!response.ok) {
        console.error(
          `MusicBrainz recording details API error: ${response.status}`
        );
        return null;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("MusicBrainz recording details error:", error);
      return null;
    }
  }
}

// Spotify API client
export class SpotifyAPI {
  constructor() {
    this.clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
    this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    this.baseUrl = "https://api.spotify.com/v1";
    this.tokenUrl = "https://accounts.spotify.com/api/token";
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  async getAccessToken() {
    // Check if we have a valid token
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    if (!this.clientId || !this.clientSecret) {
      console.warn("Spotify API credentials not found");
      return null;
    }

    const credentials = Buffer.from(
      `${this.clientId}:${this.clientSecret}`
    ).toString("base64");

    try {
      const response = await fetch(this.tokenUrl, {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
      });

      if (!response.ok) {
        console.error(`Spotify token API error: ${response.status}`);
        return null;
      }

      const data = await response.json();

      if (data.error) {
        console.error("Spotify token error:", data.error_description);
        return null;
      }

      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + data.expires_in * 1000 - 60000; // Subtract 1 minute for safety

      return this.accessToken;
    } catch (error) {
      console.error("Spotify token error:", error);
      return null;
    }
  }

  async searchTrack(query) {
    const token = await this.getAccessToken();
    if (!token) return [];

    const params = new URLSearchParams({
      q: query,
      type: "track",
      limit: 5,
    });

    try {
      const response = await fetch(`${this.baseUrl}/search?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error(`Spotify search API error: ${response.status}`);
        return [];
      }

      const data = await response.json();

      if (data.error) {
        console.error("Spotify search error:", data.error.message);
        return [];
      }

      return data.tracks?.items || [];
    } catch (error) {
      console.error("Spotify search error:", error);
      return [];
    }
  }
}
