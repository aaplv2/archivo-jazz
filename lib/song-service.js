import { LastFmAPI, MusicBrainzAPI, SpotifyAPI } from "./api-clients.js";
import { apiCache } from "./cache.js";

export class SongService {
  constructor() {
    this.lastfm = new LastFmAPI();
    this.musicbrainz = new MusicBrainzAPI();
    this.spotify = new SpotifyAPI();
  }

  async enrichSongData(song) {
    // Check cache first
    const cacheKey = `song-${song.id}`;
    const cachedSong = apiCache.get(cacheKey);
    if (cachedSong) {
      console.log(`Using cached data for: ${song.title}`);
      return cachedSong;
    }

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

      // Safely extract description from Last.fm
      let enhancedDescription = song.description;
      if (lastfmTrackData?.wiki?.summary) {
        enhancedDescription = lastfmTrackData.wiki.summary
          .replace(/<[^>]*>/g, "")
          .replace(/\s+/g, " ")
          .trim();

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
          .replace(/<[^>]*>/g, "")
          .replace(/\s+/g, " ")
          .trim();

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
          .slice(0, 5)
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
        description: enhancedDescription,
        artistBio: artistBio,
        tags: tags,
        musicbrainzId: musicbrainzId,
        previewUrl: previewUrl,
        albumArt: albumArt,
        duration: duration,
        popularity: popularity,
        listeners: listeners,
        playcount: playcount,
        // Add cache timestamp
        lastEnriched: Date.now(),
      };

      // Cache the enriched song
      apiCache.set(cacheKey, enrichedSong);

      console.log(`Successfully enriched: ${song.title}`);
      return enrichedSong;
    } catch (error) {
      console.error(`Error enriching song data for "${song.title}":`, error);
      // Cache the original song to avoid repeated failures
      apiCache.set(cacheKey, song);
      return song;
    }
  }

  async getAllEnrichedSongs(staticSongs) {
    console.log(`Starting to enrich ${staticSongs.length} songs...`);

    // Check if we have all songs cached
    const allCached = staticSongs.every((song) =>
      apiCache.has(`song-${song.id}`)
    );

    if (allCached) {
      console.log("All songs found in cache, returning cached data");
      return staticSongs.map((song) => apiCache.get(`song-${song.id}`));
    }

    // Only enrich songs that aren't cached
    const enrichedSongs = [];
    for (let i = 0; i < staticSongs.length; i++) {
      const song = staticSongs[i];
      const cacheKey = `song-${song.id}`;

      if (apiCache.has(cacheKey)) {
        enrichedSongs.push(apiCache.get(cacheKey));
        console.log(`Using cached data for: ${song.title}`);
      } else {
        try {
          const enrichedSong = await this.enrichSongData(song);
          enrichedSongs.push(enrichedSong);

          // Add a small delay between requests to avoid rate limiting
          if (i < staticSongs.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 300)); // 300ms delay
          }
        } catch (error) {
          console.error(`Failed to enrich song ${song.title}:`, error);
          enrichedSongs.push(song);
        }
      }
    }

    console.log(
      `Finished enriching songs. ${enrichedSongs.length} songs processed.`
    );
    return enrichedSongs;
  }

  async searchSongs(query) {
    const cacheKey = `search-${query}`;
    const cachedResults = apiCache.get(cacheKey);
    if (cachedResults) {
      console.log(`Using cached search results for: ${query}`);
      return cachedResults;
    }

    try {
      console.log(`Searching for: ${query}`);

      const [lastfmResult, spotifyResult] = await Promise.allSettled([
        this.lastfm.searchTrack("", query),
        this.spotify.searchTrack(query),
      ]);

      const combinedResults = [];

      if (lastfmResult.status === "fulfilled" && lastfmResult.value) {
        const track = lastfmResult.value;
        combinedResults.push({
          source: "lastfm",
          title: track.name || "Unknown",
          artist: track.artist || "Unknown Artist",
          listeners: track.listeners || null,
        });
      }

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

      // Cache the search results
      apiCache.set(cacheKey, combinedResults);

      console.log(`Search completed. Found ${combinedResults.length} results.`);
      return combinedResults;
    } catch (error) {
      console.error("Search error:", error);
      return [];
    }
  }
}
