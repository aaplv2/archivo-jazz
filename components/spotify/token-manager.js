"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, Trash2, AlertTriangle } from "lucide-react";
import { spotifyService } from "@/lib/services/spotify-services";

export default function TokenManager() {
  const [isRevoking, setIsRevoking] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [message, setMessage] = useState("");

  const handleRevokeToken = async () => {
    setIsRevoking(true);
    setMessage("");

    try {
      const result = await spotifyService.revokeToken();
      setMessage(result.success ? result.message : result.error);

      if (result.success) {
        // Reload the page to reset all state
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (error) {
      setMessage("Failed to revoke token");
    } finally {
      setIsRevoking(false);
    }
  };

  const handleRegenerateToken = async () => {
    setIsRegenerating(true);
    setMessage("");

    try {
      const result = await spotifyService.regenerateToken();
      setMessage(result.success ? result.message : result.error);
    } catch (error) {
      setMessage("Failed to regenerate token");
    } finally {
      setIsRegenerating(false);
    }
  };

  const isTokenStale = spotifyService.isTokenStale();

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center text-sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Token Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isTokenStale && (
          <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400 text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>Token is stale and may cause issues</span>
          </div>
        )}

        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRegenerateToken}
            disabled={isRegenerating}
            className="w-full"
          >
            {isRegenerating ? (
              <>
                <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
                Regenerating...
              </>
            ) : (
              <>
                <RefreshCw className="w-3 h-3 mr-2" />
                Regenerate Token
              </>
            )}
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={handleRevokeToken}
            disabled={isRevoking}
            className="w-full"
          >
            {isRevoking ? (
              <>
                <Trash2 className="w-3 h-3 mr-2" />
                Revoking...
              </>
            ) : (
              <>
                <Trash2 className="w-3 h-3 mr-2" />
                Revoke & Logout
              </>
            )}
          </Button>
        </div>

        {message && (
          <div className="text-xs text-center p-2 bg-gray-100 dark:bg-gray-800 rounded">
            {message}
          </div>
        )}

        <div className="text-xs text-gray-500 dark:text-gray-400">
          <p>
            <strong>Regenerate:</strong> Get a fresh token with new
            authorization
          </p>
          <p>
            <strong>Revoke:</strong> Clear all tokens and logout completely
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
