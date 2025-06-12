"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PremiumPrompt() {
  return (
    <div className="text-center py-4">
      <AlertCircle className="w-8 h-8 text-amber-600 dark:text-amber-400 mx-auto mb-2" />
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
        Spotify Premium is required for full song playback
      </p>
      <Button
        variant="outline"
        size="sm"
        className="bg-[#1DB954] text-white hover:bg-[#1aa34a] border-[#1DB954]"
        onClick={() => window.open("https://www.spotify.com/premium", "_blank")}
      >
        Get Spotify Premium
      </Button>
    </div>
  );
}
