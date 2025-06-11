"use client";

import Image from "next/image";
import { useState } from "react";
import { Disc } from "lucide-react";

export default function SafeImage({
  src,
  alt,
  width,
  height,
  className,
  fallback,
}) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // If there's an error or no src, show fallback
  if (imageError || !src || src === "/placeholder.svg?height=300&width=300") {
    return (
      <div
        className={`${className} bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-lg flex items-center justify-center`}
      >
        {fallback || (
          <div className="text-center">
            <Disc className="w-16 h-16 text-amber-600 dark:text-amber-400 mx-auto mb-2" />
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Album Artwork
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`${className} relative overflow-hidden rounded-lg`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center">
          <div className="animate-pulse">
            <Disc className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
        </div>
      )}
      <Image
        src={src || "/placeholder.svg"}
        alt={alt}
        width={width}
        height={height}
        className={`w-full h-full object-cover ${
          isLoading ? "opacity-0" : "opacity-100"
        } transition-opacity duration-300`}
        onError={() => {
          setImageError(true);
          setIsLoading(false);
        }}
        onLoad={() => setIsLoading(false)}
        unoptimized={src.includes("blob.v0.dev")} // Don't optimize blob URLs
      />
    </div>
  );
}
