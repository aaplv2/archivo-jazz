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
};

export default nextConfig;
