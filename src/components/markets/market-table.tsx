"use client";

import { useState, useMemo } from "react";
import { UnifiedMarket, Platform } from "@/types/market";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatPercent } from "@/lib/utils/format";
import { ArrowUpDown, ArrowUp, ArrowDown, Search, LayoutGrid, List } from "lucide-react";
import Link from "next/link";
import { StarButton } from "@/components/watchlist/star-button";

type ViewMode = "list" | "grid";

type SortField = "question" | "yesPrice" | "volume24h" | "spread" | "platform";
type SortDir = "asc" | "desc";

const platformColors: Record<Platform, { badge: string; dot: string; short: string }> = {
  polymarket: { badge: "bg-blue-500/10 text-blue-400", dot: "bg-blue-500", short: "Poly" },
  kalshi: { badge: "bg-emerald-500/10 text-emerald-400", dot: "bg-emerald-500", short: "Kalshi" },
  manifold: { badge: "bg-purple-500/10 text-purple-400", dot: "bg-purple-500", short: "Manifold" },
  opinion: { badge: "bg-orange-500/10 text-orange-400", dot: "bg-orange-500", short: "Opinion" },
};

export function MarketTable({
  markets,
  platforms,
  onTogglePlatform,
  search,
  onSearchChange,
  viewMode = "list",
  onViewModeChange,
}: {
  markets: UnifiedMarket[];
  platforms: Platform[];
  onTogglePlatform: (p: Platform) => void;
  search: string;
  onSearchChange: (s: string) => void;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
}) {
  const [sortField, setSortField] = useState<SortField>("volume24h");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(0);
  const perPage = 20;

  const sorted = useMemo(() => {
    const arr = [...markets];
    arr.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "question":
          cmp = a.question.localeCompare(b.question);
          break;
        case "yesPrice":
          cmp = a.yesPrice - b.yesPrice;
          break;
        case "volume24h":
          cmp = a.volume24h - b.volume24h;
          break;
        case "spread":
          cmp = a.spread - b.spread;
          break;
        case "platform":
          cmp = a.platform.localeCompare(b.platform);
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [markets, sortField, sortDir]);

  const paged = sorted.slice(page * perPage, (page + 1) * perPage);
  const totalPages = Math.ceil(sorted.length / perPage);

  // Compute trending threshold (top 5 markets by volume24h)
  const trendingIds = useMemo(() => {
    if (markets.length === 0) return new Set<string>();
    const top = [...markets]
      .filter((m) => m.volume24h > 0)
      .sort((a, b) => b.volume24h - a.volume24h)
      .slice(0, 5);
    return new Set(top.map((m) => m.id));
  }, [markets]);

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  }

  const allPlatforms: Platform[] = ["polymarket", "kalshi", "manifold", "opinion"];

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field)
      return <ArrowUpDown className="h-3 w-3 text-muted-foreground/40" />;
    return sortDir === "asc" ? (
      <ArrowUp className="h-3 w-3 text-foreground" />
    ) : (
      <ArrowDown className="h-3 w-3 text-foreground" />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search markets..."
            value={search}
            onChange={(e) => {
              onSearchChange(e.target.value);
              setPage(0);
            }}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1">
          {allPlatforms.map((p) => (
            <Button
              key={p}
              size="sm"
              variant={platforms.includes(p) ? "secondary" : "ghost"}
              onClick={() => {
                onTogglePlatform(p);
                setPage(0);
              }}
              className="text-xs capitalize h-8"
            >
              {p}
            </Button>
          ))}
        </div>
        {onViewModeChange && (
          <div className="flex gap-0.5 rounded-md border p-0.5">
            <Button
              size="sm"
              variant={viewMode === "list" ? "secondary" : "ghost"}
              onClick={() => onViewModeChange("list")}
              className="h-7 w-7 p-0"
              title="List view"
            >
              <List className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="sm"
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              onClick={() => onViewModeChange("grid")}
              className="h-7 w-7 p-0"
              title="Grid view"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>

      {viewMode === "grid" ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {paged.length === 0 && (
            <p className="col-span-full text-center text-muted-foreground py-8">
              No markets found
            </p>
          )}
          {paged.map((m) => {
            const pc = platformColors[m.platform];
            return (
              <Link
                key={m.id}
                href={`/markets/${m.platform}/${m.platformId}`}
                className="group relative rounded-lg border p-4 transition-colors hover:bg-muted/30 cursor-pointer"
              >
                {trendingIds.has(m.id) && (
                  <Badge className="absolute -top-2 -right-2 bg-orange-500/90 text-white text-[9px] px-1.5 py-0 border-0">
                    Trending
                  </Badge>
                )}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <p
                    className="line-clamp-2 text-sm font-medium group-hover:text-primary transition-colors"
                    title={m.question}
                  >
                    {m.question}
                  </p>
                  <StarButton marketId={m.id} />
                </div>
                <div className="flex items-end justify-between">
                  <div className="space-y-1.5">
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className={`inline-block h-2 w-2 rounded-full ${pc.dot}`} />
                      {pc.short}
                    </span>
                    {m.volume24h > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Vol: {formatCurrency(m.volume24h)}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold tabular-nums">
                      {formatPercent(m.yesPrice, 0)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Yes</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader className="sticky top-14 z-10 bg-background">
              <TableRow>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => toggleSort("question")}
                >
                  <div className="flex items-center gap-1">
                    Market <SortIcon field="question" />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none text-right"
                  onClick={() => toggleSort("platform")}
                >
                  <div className="flex items-center justify-end gap-1">
                    Platform <SortIcon field="platform" />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none text-right"
                  onClick={() => toggleSort("yesPrice")}
                >
                  <div className="flex items-center justify-end gap-1">
                    Yes % <SortIcon field="yesPrice" />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none text-right"
                  onClick={() => toggleSort("spread")}
                >
                  <div className="flex items-center justify-end gap-1">
                    Spread <SortIcon field="spread" />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none text-right"
                  onClick={() => toggleSort("volume24h")}
                >
                  <div className="flex items-center justify-end gap-1">
                    24h Vol <SortIcon field="volume24h" />
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No markets found
                  </TableCell>
                </TableRow>
              )}
              {paged.map((m) => {
                const pc = platformColors[m.platform];
                return (
                  <TableRow key={m.id} className="group [&_td]:py-3">
                    <TableCell className="w-[50%] max-w-0">
                      <Link
                        href={`/markets/${m.platform}/${m.platformId}`}
                        className="line-clamp-2 font-medium text-sm group-hover:text-primary transition-colors"
                        title={m.question}
                      >
                        {m.question}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className={`inline-block h-2 w-2 rounded-full ${pc.dot}`} />
                        {pc.short}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm font-medium">
                      {formatPercent(m.yesPrice, 1)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm text-muted-foreground">
                      {formatPercent(m.spread, 2)}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {formatCurrency(m.volume24h)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {page * perPage + 1}-{Math.min((page + 1) * perPage, sorted.length)} of{" "}
            {sorted.length}
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
