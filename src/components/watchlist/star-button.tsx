"use client";

import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWatchlist } from "@/lib/hooks/use-watchlist";
import { cn } from "@/lib/utils";

export function StarButton({
  marketId,
  size = "sm",
}: {
  marketId: string;
  size?: "sm" | "icon";
}) {
  const { toggle, isWatched } = useWatchlist();
  const watched = isWatched(marketId);

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "h-7 w-7 shrink-0",
        watched && "text-amber-400 hover:text-amber-300"
      )}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(marketId);
      }}
      title={watched ? "Remove from watchlist" : "Add to watchlist"}
    >
      <Star
        className={cn(
          "h-3.5 w-3.5 transition-all",
          watched && "fill-amber-400"
        )}
      />
    </Button>
  );
}
