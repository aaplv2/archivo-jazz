import { NextResponse } from "next/server";

// YouTube API key would normally be stored in environment variables
// For this example, we'll use a simple search approach without the actual API
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json(
        { success: false, error: "Query parameter required" },
        { status: 400 }
      );
    }

    // In a real implementation, you would use the YouTube API
    // For now, we'll use a simple approach to extract video IDs from search results
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
      query
    )}`;

    const response = await fetch(searchUrl);
    const html = await response.text();

    // Extract video ID from the HTML response
    // This is a simple approach and might break if YouTube changes their HTML structure
    const videoIdMatch = html.match(/\/watch\?v=([a-zA-Z0-9_-]{11})/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;

    if (!videoId) {
      return NextResponse.json(
        { success: false, error: "No videos found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      videoId,
      query,
    });
  } catch (error) {
    console.error("YouTube search error:", error);
    return NextResponse.json(
      { success: false, error: "Search failed" },
      { status: 500 }
    );
  }
}
