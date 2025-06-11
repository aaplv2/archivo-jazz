import { getSongBySlug } from "@/lib/songs-data";
import { SongService } from "@/lib/song-service";

const songService = new SongService();

export async function GET(request, { params }) {
  try {
    const { slug } = await params;
    const staticSong = getSongBySlug(slug);

    if (!staticSong) {
      return Response.json(
        { success: false, error: "Song not found" },
        { status: 404 }
      );
    }

    const enrichedSong = await songService.enrichSongData(staticSong);

    return Response.json({
      success: true,
      data: enrichedSong,
    });
  } catch (error) {
    console.error("API Error:", error);
    return Response.json(
      { success: false, error: "Failed to fetch song" },
      { status: 500 }
    );
  }
}
