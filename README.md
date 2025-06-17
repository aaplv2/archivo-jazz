# 🎷 Jazz Classics - Timeless Standards from the Golden Age

A modern web application celebrating the greatest jazz standards from the 1920s, 1930s, and 1940s. Experience the golden age of jazz with enhanced music data, Spotify integration, and YouTube fallbacks.

## ✨ Features

### 🎵 Music Experience
- **Curated Collection**: Hand-picked jazz standards from three iconic decades
- **Spotify Integration**: Full song playback with Spotify Premium accounts
- **YouTube Fallback**: Automatic YouTube video embedding when Spotify isn't available
- **Enhanced Metadata**: Rich song information from Last.fm, Spotify, and MusicBrainz APIs
- **Album Artwork**: High-quality album covers and artist images

### 🎨 User Interface
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Dark/Light Theme**: Toggle between themes with system preference detection
- **Jazz-Themed Styling**: Warm color palette inspired by the jazz age
- **Smooth Animations**: Elegant transitions and hover effects

### 🔐 Authentication & Security
- **Spotify OAuth**: Secure authentication with PKCE flow
- **Token Management**: Automatic token refresh and regeneration
- **Region Control**: Respect user's geographic location for content availability
- **CSP Headers**: Content Security Policy for enhanced security

### 🌍 Internationalization
- **Market Support**: Spotify content respects user's country/region
- **Multiple Regions**: Support for various markets including Chile, US, UK, and more

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 18** - UI library with modern hooks
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality UI components
- **Lucide React** - Beautiful icons

### Backend & APIs
- **Next.js API Routes** - Server-side API endpoints
- **Spotify Web API** - Music streaming and metadata
- **Spotify Web Playback SDK** - In-browser music playback
- **Last.fm API** - Music metadata and statistics
- **MusicBrainz API** - Music database information
- **YouTube** - Video content integration

### Development & Deployment
- **TypeScript** - Type-safe JavaScript
- **ESLint** - Code linting and formatting
- **Vercel** - Deployment and hosting platform

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn/pnpm
- Spotify Developer Account
- Last.fm API Account (optional but recommended)

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/aaplv2/archivo-jazz.git
   cd archivo-jazz
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   \`\`\`

3. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`

4. **Configure your environment variables** (see [Environment Variables](#environment-variables))

5. **Run the development server**
   \`\`\`bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   \`\`\`

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

\`\`\`env
# Spotify API (Required for full functionality)
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

# Last.fm API (Optional - enhances metadata)
NEXT_PUBLIC_LASTFM_API_KEY=your_lastfm_api_key

# MusicBrainz (Optional - for additional metadata)
MUSICBRAINZ_CONTACT_EMAIL=your-email@example.com
\`\`\`

### Getting API Keys

#### Spotify API
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Add redirect URIs:
   - `http://localhost:3000/spotify-callback` (development)
   - `https://https://archivo-jazz.vercel.app/spotify-callback` (production)
4. Copy Client ID and Client Secret

#### Last.fm API
1. Visit [Last.fm API](https://www.last.fm/api/account/create)
2. Create an API account
3. Get your API key

## 📁 Project Structure

\`\`\`
archivo-jazz/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── songs/               # Song data endpoints
│   │   ├── spotify/             # Spotify authentication
│   │   ├── search/              # Search functionality
│   │   └── youtube/             # YouTube integration
│   ├── songs/[slug]/            # Dynamic song pages
│   ├── spotify-callback/        # OAuth callback
│   ├── globals.css              # Global styles
│   ├── layout.js                # Root layout
│   └── page.js                  # Home page
├── components/                   # React components
│   ├── spotify/                 # Spotify-related components
│   ├── ui/                      # shadcn/ui components
│   ├── song-card.js            # Song display components
│   ├── theme-toggle.js         # Theme switching
│   └── ...
├── hooks/                       # Custom React hooks
│   ├── use-songs.js            # Song data management
│   └── use-spotify-lifecycle.js # Spotify connection lifecycle
├── lib/                         # Utility libraries
│   ├── services/               # Service classes
│   │   ├── spotify-service.js  # Spotify API integration
│   │   └── spotify-player-service.js # Playback management
│   ├── utils/                  # Utility functions
│   ├── api-clients.js          # External API clients
│   ├── cache.js                # Caching layer
│   └── songs-data.js           # Static song data
├── public/                      # Static assets
└── ...config files
\`\`\`

## 🎵 Song Data Structure

Each song in the collection includes:

\`\`\`javascript
{
  id: "unique-slug",
  title: "Song Title",
  composer: "Composer Name(s)",
  year: 1925,
  decade: "1920s",
  album: "Album Name",
  description: "Historical context and information",
  // Enhanced data from APIs
  albumArt: "https://...",
  previewUrl: "https://...",
  spotifyId: "spotify_track_id",
  tags: ["jazz", "swing", "bebop"],
  listeners: "123456",
  playcount: "789012",
  duration: 180000, // milliseconds
  artistBio: "Artist biography..."
}
\`\`\`

## 🔌 API Integration

### Spotify Integration
- **Authentication**: OAuth 2.0 with PKCE flow
- **Playback**: Web Playback SDK for in-browser streaming
- **Search**: Track and artist search with market filtering
- **Premium Required**: Full playback requires Spotify Premium

### Last.fm Integration
- **Track Info**: Detailed track metadata and statistics
- **Artist Info**: Artist biographies and related information
- **Tags**: Music genre and style tags
- **Play Counts**: Listener statistics and play counts

### MusicBrainz Integration
- **Recording Data**: Comprehensive music database information
- **Release Information**: Album and release details
- **Artist Credits**: Detailed artist and composer information

## 🎨 Theming

The application supports both light and dark themes with:
- **System Preference Detection**: Automatically matches user's system theme
- **Manual Toggle**: Theme switcher in the header
- **Persistent Storage**: Theme preference saved in localStorage
- **Jazz-Inspired Colors**: Warm amber and gold color palette

### Custom CSS Classes
\`\`\`css
/* Jazz-themed backgrounds */
.jazz-bg-light { /* Light theme gradient */ }
.jazz-bg-dark { /* Dark theme gradient */ }

/* Card styling */
.jazz-card-light { /* Light theme cards */ }
.jazz-card-dark { /* Dark theme cards */ }
\`\`\`

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Manual Deployment
\`\`\`bash
npm run build
npm start
\`\`\`

### Environment Setup for Production
- Update Spotify redirect URIs to include production domain
- Set all environment variables in your hosting platform
- Ensure CSP headers allow your domain

## 🔧 Development

### Available Scripts
\`\`\`bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
\`\`\`

### Code Style
- **ESLint**: Configured with Next.js recommended rules
- **Prettier**: Code formatting (configure as needed)
- **TypeScript**: Gradual adoption supported

### Adding New Songs
1. Edit `lib/songs-data.js`
2. Add song object with required fields
3. Ensure unique `id` (slug format)
4. Test locally before deploying

## 🐛 Troubleshooting

### Common Issues

#### Spotify Authentication
- **Issue**: "Invalid redirect URI"
- **Solution**: Ensure redirect URI in Spotify app matches exactly (including protocol)

#### Token Issues
- **Issue**: Playback fails or location changes
- **Solution**: Use the token regeneration feature in debug panel

#### API Rate Limits
- **Issue**: External API calls failing
- **Solution**: Implement caching (already included) and respect rate limits

#### YouTube Videos Not Loading
- **Issue**: Videos don't appear
- **Solution**: Check CSP headers and YouTube API availability

### Debug Tools
- Development mode includes debug panel with:
  - Configuration checker
  - Token management tools
  - PKCE testing
  - Storage inspection

### Contribution Guidelines
- Follow existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all APIs work correctly

## 🙏 Acknowledgments

- **Jazz Musicians**: The incredible artists who created these timeless standards
- **API Providers**: Spotify, Last.fm, and MusicBrainz for their excellent APIs
- **shadcn/ui**: For the beautiful UI components
- **Vercel**: For the amazing deployment platform
- **Next.js Team**: For the fantastic React framework

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/aaplv2/archivo-jazz/issues)
- **Discussions**: [GitHub Discussions](https://github.com/aaplv2/archivo-jazz/discussions)
- **Email**: [aaplv2@gmail.com](mailto:aaplv2@gmail.com)

---

