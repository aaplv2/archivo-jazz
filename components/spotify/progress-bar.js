"use client";

import { Slider } from "@/components/ui/slider";
import { formatTime } from "@/lib/utils/formatters";

export default function ProgressBar({
  currentTime,
  duration,
  onSeek,
  disabled,
}) {
  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="space-y-2">
      <Slider
        value={[progress]}
        onValueChange={onSeek}
        max={100}
        step={1}
        className="w-full"
        disabled={disabled || !duration}
      />
      <div className="flex justify-between text-sm text-muted-foreground dark:text-gray-400">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}
