import { LastFmAPI, MusicBrainzAPI, SpotifyAPI } from "./api-clients.js";

export class SongService {
  constructor() {
    this.lastfm = new LastFmAPI();
    this.musicbrainz = new MusicBrainzAPI();
    this.spotify = new SpotifyAPI();
  }

  async enrichSongData(song) {
    try {
      // Get data from multiple sources
      const [lastfmTrack, lastfmArtist, musicbrainzRecordings, spotifyTracks] =
        await Promise.all([
          this.lastfm.getTrackInfo(
            song.composer.split(",")[0].trim(),
            song.title
          ),
          this.lastfm.getArtistInfo(song.composer.split(",")[0].trim()),
          this.musicbrainz.searchRecording(
            `${song.title} AND artist:${song.composer.split(",")[0].trim()}`
          ),
          this.spotify.searchTrack(
            `${song.title} ${song.composer.split(",")[0].trim()}`
          ),
        ]);

      // Combine data from different sources
      const enrichedSong = {
        ...song,
        // Enhanced description from Last.fm
        description: lastfmTrack?.wiki?.summary || song.description,
        // Artist bio from Last.fm
        artistBio: lastfmArtist?.bio?.summary || null,
        // Tags from Last.fm
        tags: lastfmTrack?.toptags?.tag?.map((tag) => tag.name) || [],
        // MusicBrainz ID for detailed metadata
        musicbrainzId: musicbrainzRecordings[0]?.id || null,
        // Spotify preview URL
        previewUrl: spotifyTracks[0]?.preview_url || song.audioUrl,
        // Album artwork from Spotify
        albumArt: spotifyTracks[0]?.album?.images?.[0]?.url || song.imageUrl,
        // Additional metadata
        duration: spotifyTracks[0]?.duration_ms || null,
        popularity: spotifyTracks[0]?.popularity || null,
        // Last.fm listener stats
        listeners: lastfmTrack?.listeners || null,
        playcount: lastfmTrack?.playcount || null,
      };

      return enrichedSong;
    } catch (error) {
      console.error("Error enriching song data:", error);
      return song; // Return original song if enrichment fails
    }
  }

  async getAllEnrichedSongs(staticSongs) {
    const enrichedSongs = await Promise.all(
      staticSongs.map((song) => this.enrichSongData(song))
    );
    return enrichedSongs;
  }

  async searchSongs(query) {
    try {
      const [lastfmResults, spotifyResults] = await Promise.all([
        this.lastfm.searchTrack("", query),
        this.spotify.searchTrack(query),
      ]);

      // Combine and format results
      const combinedResults = [];

      if (lastfmResults) {
        combinedResults.push({
          source: "lastfm",
          title: lastfmResults.name,
          artist: lastfmResults.artist,
          listeners: lastfmResults.listeners,
        });
      }

      spotifyResults.forEach((track) => {
        combinedResults.push({
          source: "spotify",
          title: track.name,
          artist: track.artists[0]?.name,
          previewUrl: track.preview_url,
          albumArt: track.album?.images?.[0]?.url,
          duration: track.duration_ms,
        });
      });

      return combinedResults;
    } catch (error) {
      console.error("Search error:", error);
      return [];
    }
  }
}
