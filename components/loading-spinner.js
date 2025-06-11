import { Music } from "lucide-react";

export default function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin mb-4">
        <Music className="w-8 h-8 text-amber-600 dark:text-amber-400" />
      </div>
      <p className="text-gray-600 dark:text-gray-400">{message}</p>
    </div>
  );
}
