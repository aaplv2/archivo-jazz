// Last.fm API client
export class LastFmAPI {
  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_LASTFM_API_KEY;
    this.baseUrl = "https://ws.audioscrobbler.com/2.0/";
  }

  async searchTrack(artist, track) {
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
      const data = await response.json();
      return data.results?.trackmatches?.track?.[0] || null;
    } catch (error) {
      console.error("Last.fm API error:", error);
      return null;
    }
  }

  async getTrackInfo(artist, track) {
    const params = new URLSearchParams({
      method: "track.getInfo",
      artist: artist,
      track: track,
      api_key: this.apiKey,
      format: "json",
    });

    try {
      const response = await fetch(`${this.baseUrl}?${params}`);
      const data = await response.json();
      return data.track || null;
    } catch (error) {
      console.error("Last.fm track info error:", error);
      return null;
    }
  }

  async getArtistInfo(artist) {
    const params = new URLSearchParams({
      method: "artist.getInfo",
      artist: artist,
      api_key: this.apiKey,
      format: "json",
    });

    try {
      const response = await fetch(`${this.baseUrl}?${params}`);
      const data = await response.json();
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
    this.userAgent = "JazzClassicsWebsite/1.0.0 (your-email@example.com)";
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
  }

  async getAccessToken() {
    if (this.accessToken) return this.accessToken;

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

      const data = await response.json();
      this.accessToken = data.access_token;
      return this.accessToken;
    } catch (error) {
      console.error("Spotify token error:", error);
      return null;
    }
  }

  async searchTrack(query) {
    const token = await this.getAccessToken();
    if (!token) return null;

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
      const data = await response.json();
      return data.tracks?.items || [];
    } catch (error) {
      console.error("Spotify search error:", error);
      return [];
    }
  }
}
