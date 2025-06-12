import SpotifyLoginButton from "../spotify-login-button";

export default function LoginPrompt() {
  return (
    <div className="text-center py-4">
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Connect your Spotify Premium account to play full songs
      </p>
      <div className="flex justify-center">
        <SpotifyLoginButton />
      </div>
    </div>
  );
}
