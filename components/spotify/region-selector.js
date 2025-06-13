"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe } from "lucide-react";
import { spotifyService } from "@/lib/services/spotify-services";

// Common Spotify markets
const COMMON_MARKETS = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "ES", name: "Spain" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "IT", name: "Italy" },
  { code: "JP", name: "Japan" },
  { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" },
  { code: "AU", name: "Australia" },
  { code: "CA", name: "Canada" },
  { code: "CL", name: "Chile" },
  { code: "AR", name: "Argentina" },
];

export default function RegionSelector() {
  const [currentMarket, setCurrentMarket] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Get the current market from the service
    const market = spotifyService.getUserMarket();
    setCurrentMarket(market);
  }, []);

  const handleMarketChange = (value) => {
    spotifyService.setUserMarket(value);
    setCurrentMarket(value);
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 text-xs"
      >
        <Globe className="w-3 h-3 mr-1" />
        <span>Region: {currentMarket}</span>
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 p-4 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 w-64">
          <h4 className="text-sm font-medium mb-2">Select Your Region</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            This helps Spotify provide content available in your region
          </p>

          <Select value={currentMarket} onValueChange={handleMarketChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select region" />
            </SelectTrigger>
            <SelectContent>
              {COMMON_MARKETS.map((market) => (
                <SelectItem key={market.code} value={market.code}>
                  {market.name} ({market.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="mt-3 text-right">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
