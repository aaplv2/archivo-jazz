/**
 * Format milliseconds to MM:SS format
 * @param {number} ms - Time in milliseconds
 * @returns {string} Formatted time string
 */
export function formatTime(ms) {
  if (!ms || isNaN(ms)) return "0:00";
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor(ms / 1000 / 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * Extract Spotify ID from URL
 * @param {string} url - Spotify URL
 * @returns {string|null} Spotify track ID or null
 */
export function extractSpotifyId(url) {
  if (!url) return null;
  const previewMatch = url.match(/track\/([a-zA-Z0-9]+)/);
  return previewMatch?.[1] || null;
}

/**
 * Calculate progress percentage
 * @param {number} current - Current position
 * @param {number} total - Total duration
 * @returns {number} Progress percentage (0-100)
 */
export function calculateProgress(current, total) {
  if (!current || !total) return 0;
  return (current / total) * 100;
}
