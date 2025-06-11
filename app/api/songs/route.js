import { getAllSongs } from "@/lib/songs-data";
import { SongService } from "@/lib/song-service";

const songService = new SongService();

export async function GET() {
  try {
    const staticSongs = getAllSongs();
    const enrichedSongs = await songService.getAllEnrichedSongs(staticSongs);

    return Response.json({
      success: true,
      data: enrichedSongs,
      count: enrichedSongs.length,
    });
  } catch (error) {
    console.error("API Error:", error);
    return Response.json(
      { success: false, error: "Failed to fetch songs" },
      { status: 500 }
    );
  }
}
