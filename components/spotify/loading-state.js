import { Loader2 } from "lucide-react";

export default function LoadingState({ message }) {
  return (
    <div className="text-center py-4">
      <Loader2 className="w-8 h-8 text-[#1DB954] mx-auto mb-2 animate-spin" />
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {message || "Loading..."}
      </p>
    </div>
  );
}
