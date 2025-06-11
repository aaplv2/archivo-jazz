import { SongService } from "@/lib/song-service";

const songService = new SongService();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return Response.json(
        { success: false, error: "Query parameter required" },
        { status: 400 }
      );
    }

    const results = await songService.searchSongs(query);

    return Response.json({
      success: true,
      data: results,
      query: query,
    });
  } catch (error) {
    console.error("Search API Error:", error);
    return Response.json(
      { success: false, error: "Search failed" },
      { status: 500 }
    );
  }
}
