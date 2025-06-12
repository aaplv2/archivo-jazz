/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.scdn.co",
        port: "",
        pathname: "/image/**",
      },
      {
        protocol: "https",
        hostname: "lastfm.freetls.fastly.net",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lastfm-img2.akamaized.net",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "coverartarchive.org",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "musicbrainz.org",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.discogs.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.discogs.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  // Add CSP headers for production with proper Spotify SDK support
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://sdk.scdn.co",
              "connect-src 'self' https://api.spotify.com https://accounts.spotify.com https://ws.audioscrobbler.com https://musicbrainz.org wss://dealer.spotify.com",
              "img-src 'self' data: blob: https: http:",
              "media-src 'self' https: blob:",
              "style-src 'self' 'unsafe-inline'",
              "font-src 'self' data:",
              "frame-src 'self' https://accounts.spotify.com https://sdk.scdn.co", // Added sdk.scdn.co
              "worker-src 'self' blob:",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
