import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Music } from "lucide-react";

export default function SongCard({ song }) {
  return (
    <Link
      href={`/songs/${song.id}`}
      className="block transition-transform hover:scale-105"
    >
      <Card className="h-full hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg leading-tight mb-1">
                {song.title}
              </CardTitle>
              <CardDescription className="text-sm">
                {song.composer}
              </CardDescription>
            </div>
            <Music className="w-5 h-5 text-muted-foreground ml-2 flex-shrink-0" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-xs">
              {song.year}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {song.decade}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {song.description}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
