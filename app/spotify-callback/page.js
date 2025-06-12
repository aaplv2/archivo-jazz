"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { spotifyService } from "@/lib/services/spotify-services";
import { CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SpotifyCallback() {
  const router = useRouter();
  const [status, setStatus] = useState("Processing authentication...");
  const [result, setResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    // Add debug information
    const currentUrl = window.location.href;
    const search = window.location.search;
    const code = new URLSearchParams(search).get("code");
    const error = new URLSearchParams(search).get("error");

    setDebugInfo({
      url: currentUrl,
      search: search,
      code: code ? "Present" : "Missing",
      error: error || "None",
      origin: window.location.origin,
    });

    // Process the callback
    const processAuth = async () => {
      try {
        setIsProcessing(true);
        const authResult = await spotifyService.handleCallback();
        setResult(authResult);

        if (authResult.success) {
          setStatus("Authentication successful! Redirecting...");

          // Redirect back to home page after a short delay
          setTimeout(() => {
            router.push("/");
          }, 2000);
        } else {
          setStatus(`Authentication failed: ${authResult.error}`);
        }
      } catch (error) {
        console.error("Auth processing error:", error);
        setResult({
          success: false,
          error: error.message || "Unknown error occurred",
        });
        setStatus(`Authentication error: ${error.message || "Unknown error"}`);
      } finally {
        setIsProcessing(false);
      }
    };

    processAuth();
  }, [router]);

  const handleRetry = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen jazz-bg-light dark:jazz-bg-dark flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          {isProcessing ? (
            <Loader2 className="w-16 h-16 text-[#1DB954] mx-auto mb-4 animate-spin" />
          ) : result?.success ? (
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          ) : (
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          )}
        </div>

        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          Spotify Authentication
        </h1>

        <p className="text-gray-600 dark:text-gray-400 mb-6">{status}</p>

        {!isProcessing && result?.success === false && (
          <div className="space-y-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-red-700 dark:text-red-400">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Error Details:</span>
              </div>
              <p className="text-red-600 dark:text-red-300 mt-2 text-sm">
                {result.error}
              </p>
            </div>

            <Button onClick={handleRetry} className="w-full">
              Return to Home
            </Button>
          </div>
        )}

        {/* Debug information in development */}
        {process.env.NODE_ENV !== "production" && debugInfo && (
          <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-left">
            <h3 className="font-bold mb-2 text-sm">Debug Information:</h3>
            <div className="text-xs space-y-1 text-gray-600 dark:text-gray-400">
              <p>
                <strong>URL:</strong> {debugInfo.url}
              </p>
              <p>
                <strong>Search:</strong> {debugInfo.search || "None"}
              </p>
              <p>
                <strong>Code:</strong> {debugInfo.code}
              </p>
              <p>
                <strong>Error:</strong> {debugInfo.error}
              </p>
              <p>
                <strong>Origin:</strong> {debugInfo.origin}
              </p>
              <p>
                <strong>Client ID:</strong>{" "}
                {process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID ? "Set" : "Missing"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
