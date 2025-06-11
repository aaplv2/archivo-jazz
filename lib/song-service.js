import { LastFmAPI, MusicBrainzAPI, SpotifyAPI } from "./api-clients.js";

export class SongService {
  constructor() {
    this.lastfm = new LastFmAPI();
    this.musicbrainz = new MusicBrainzAPI();
    this.spotify = new SpotifyAPI();
  }

  async enrichSongData(song) {
    try {
      console.log(`Enriching data for: ${song.title} by ${song.composer}`);

      // Extract primary artist name (first composer if multiple)
      const primaryArtist = song.composer.split(",")[0].trim();

      // Get data from multiple sources with proper error handling
      const [lastfmTrack, lastfmArtist, musicbrainzRecordings, spotifyTracks] =
        await Promise.allSettled([
          this.lastfm.getTrackInfo(primaryArtist, song.title),
          this.lastfm.getArtistInfo(primaryArtist),
          this.musicbrainz.searchRecording(
            `${song.title} AND artist:${primaryArtist}`
          ),
          this.spotify.searchTrack(`${song.title} ${primaryArtist}`),
        ]);

      // Safely extract data from settled promises
      const lastfmTrackData =
        lastfmTrack.status === "fulfilled" ? lastfmTrack.value : null;
      const lastfmArtistData =
        lastfmArtist.status === "fulfilled" ? lastfmArtist.value : null;
      const musicbrainzData =
        musicbrainzRecordings.status === "fulfilled"
          ? musicbrainzRecordings.value
          : [];
      const spotifyData =
        spotifyTracks.status === "fulfilled" ? spotifyTracks.value : [];

      // Log API responses for debugging
      console.log("API Responses:", {
        lastfmTrack: lastfmTrackData ? "Success" : "Failed",
        lastfmArtist: lastfmArtistData ? "Success" : "Failed",
        musicbrainz: Array.isArray(musicbrainzData)
          ? `${musicbrainzData.length} results`
          : "Failed",
        spotify: Array.isArray(spotifyData)
          ? `${spotifyData.length} results`
          : "Failed",
      });

      // Safely extract description from Last.fm
      let enhancedDescription = song.description;
      if (lastfmTrackData?.wiki?.summary) {
        // Clean up Last.fm description (remove HTML tags and extra text)
        enhancedDescription = lastfmTrackData.wiki.summary
          .replace(/<[^>]*>/g, "") // Remove HTML tags
          .replace(/\s+/g, " ") // Normalize whitespace
          .trim();

        // Remove "Read more on Last.fm" type endings
        const readMoreIndex = enhancedDescription
          .toLowerCase()
          .indexOf("read more");
        if (readMoreIndex > 0) {
          enhancedDescription = enhancedDescription
            .substring(0, readMoreIndex)
            .trim();
        }
      }

      // Safely extract artist bio
      let artistBio = null;
      if (lastfmArtistData?.bio?.summary) {
        artistBio = lastfmArtistData.bio.summary
          .replace(/<[^>]*>/g, "") // Remove HTML tags
          .replace(/\s+/g, " ") // Normalize whitespace
          .trim();

        // Remove "Read more on Last.fm" type endings
        const readMoreIndex = artistBio.toLowerCase().indexOf("read more");
        if (readMoreIndex > 0) {
          artistBio = artistBio.substring(0, readMoreIndex).trim();
        }
      }

      // Safely extract tags
      let tags = [];
      if (
        lastfmTrackData?.toptags?.tag &&
        Array.isArray(lastfmTrackData.toptags.tag)
      ) {
        tags = lastfmTrackData.toptags.tag
          .slice(0, 5) // Limit to 5 tags
          .map((tag) => tag.name)
          .filter((name) => name && name.length > 0);
      }

      // Safely extract Spotify data
      let previewUrl = song.audioUrl;
      let albumArt = song.imageUrl;
      let duration = null;
      let popularity = null;

      if (Array.isArray(spotifyData) && spotifyData.length > 0) {
        const spotifyTrack = spotifyData[0];
        if (spotifyTrack?.preview_url) {
          previewUrl = spotifyTrack.preview_url;
        }
        if (spotifyTrack?.album?.images?.[0]?.url) {
          albumArt = spotifyTrack.album.images[0].url;
        }
        if (spotifyTrack?.duration_ms) {
          duration = spotifyTrack.duration_ms;
        }
        if (typeof spotifyTrack?.popularity === "number") {
          popularity = spotifyTrack.popularity;
        }
      }

      // Safely extract MusicBrainz ID
      let musicbrainzId = null;
      if (Array.isArray(musicbrainzData) && musicbrainzData.length > 0) {
        musicbrainzId = musicbrainzData[0]?.id || null;
      }

      // Safely extract Last.fm stats
      let listeners = null;
      let playcount = null;
      if (lastfmTrackData?.listeners) {
        listeners = lastfmTrackData.listeners;
      }
      if (lastfmTrackData?.playcount) {
        playcount = lastfmTrackData.playcount;
      }

      // Combine data from different sources
      const enrichedSong = {
        ...song,
        // Enhanced description from Last.fm
        description: enhancedDescription,
        // Artist bio from Last.fm
        artistBio: artistBio,
        // Tags from Last.fm
        tags: tags,
        // MusicBrainz ID for detailed metadata
        musicbrainzId: musicbrainzId,
        // Spotify preview URL
        previewUrl: previewUrl,
        // Album artwork from Spotify
        albumArt: albumArt,
        // Additional metadata
        duration: duration,
        popularity: popularity,
        // Last.fm listener stats
        listeners: listeners,
        playcount: playcount,
      };

      console.log(`Successfully enriched: ${song.title}`);
      return enrichedSong;
    } catch (error) {
      console.error(`Error enriching song data for "${song.title}":`, error);
      return song; // Return original song if enrichment fails
    }
  }

  async getAllEnrichedSongs(staticSongs) {
    console.log(`Starting to enrich ${staticSongs.length} songs...`);

    // Process songs with a small delay to avoid rate limiting
    const enrichedSongs = [];
    for (let i = 0; i < staticSongs.length; i++) {
      const song = staticSongs[i];
      try {
        const enrichedSong = await this.enrichSongData(song);
        enrichedSongs.push(enrichedSong);

        // Add a small delay between requests to avoid rate limiting
        if (i < staticSongs.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 200)); // 200ms delay
        }
      } catch (error) {
        console.error(`Failed to enrich song ${song.title}:`, error);
        enrichedSongs.push(song); // Add original song if enrichment fails
      }
    }

    console.log(
      `Finished enriching songs. ${enrichedSongs.length} songs processed.`
    );
    return enrichedSongs;
  }

  async searchSongs(query) {
    try {
      console.log(`Searching for: ${query}`);

      const [lastfmResult, spotifyResult] = await Promise.allSettled([
        this.lastfm.searchTrack("", query),
        this.spotify.searchTrack(query),
      ]);

      // Combine and format results
      const combinedResults = [];

      // Add Last.fm results
      if (lastfmResult.status === "fulfilled" && lastfmResult.value) {
        const track = lastfmResult.value;
        combinedResults.push({
          source: "lastfm",
          title: track.name || "Unknown",
          artist: track.artist || "Unknown Artist",
          listeners: track.listeners || null,
        });
      }

      // Add Spotify results
      if (
        spotifyResult.status === "fulfilled" &&
        Array.isArray(spotifyResult.value)
      ) {
        spotifyResult.value.forEach((track) => {
          if (track && track.name) {
            combinedResults.push({
              source: "spotify",
              title: track.name,
              artist: track.artists?.[0]?.name || "Unknown Artist",
              previewUrl: track.preview_url || null,
              albumArt: track.album?.images?.[0]?.url || null,
              duration: track.duration_ms || null,
            });
          }
        });
      }

      console.log(`Search completed. Found ${combinedResults.length} results.`);
      return combinedResults;
    } catch (error) {
      console.error("Search error:", error);
      return [];
    }
  }
}
