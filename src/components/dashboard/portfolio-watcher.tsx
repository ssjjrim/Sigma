"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatPercent } from "@/lib/utils/format";
import { Wallet, X, ExternalLink, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";

interface Position {
  asset: string;
  conditionId: string;
  market: string;
  outcome: string;
  size: number;
  avgPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  slug: string;
}

const STORAGE_KEY = "predictboard-wallet-address";

function getStoredAddress(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(STORAGE_KEY) || "";
}

function saveAddress(addr: string) {
  if (typeof window === "undefined") return;
  if (addr) {
    localStorage.setItem(STORAGE_KEY, addr);
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function PortfolioWatcher() {
  const [address, setAddress] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load saved address on mount
  useEffect(() => {
    const saved = getStoredAddress();
    if (saved) {
      setAddress(saved);
      setInputValue(saved);
    }
  }, []);

  const fetchPositions = useCallback(async (addr: string) => {
    if (!addr) return;
    setLoading(true);
    setError("");

    try {
      // Fetch positions from CLOB API (CORS OK)
      const res = await fetch(
        `https://clob.polymarket.com/data/positions?user=${addr}`
      );

      if (!res.ok) {
        throw new Error(`API returned ${res.status}`);
      }

      const data = await res.json();

      if (!data || typeof data !== "object") {
        setPositions([]);
        setLoading(false);
        return;
      }

      // data is object with conditionId keys, each containing outcomes
      const posArray: Position[] = [];

      for (const [conditionId, conditionData] of Object.entries(data)) {
        const condition = conditionData as Record<string, unknown>;
        // Each condition has outcome arrays
        for (const [outcome, outcomeData] of Object.entries(condition)) {
          const od = outcomeData as { size?: string; avgPrice?: string; currentPrice?: string; market?: string; asset?: string; slug?: string };
          const size = parseFloat(od.size || "0");
          if (size <= 0) continue;

          const avgPrice = parseFloat(od.avgPrice || "0");
          const currentPrice = parseFloat(od.currentPrice || "0");
          const costBasis = size * avgPrice;
          const currentValue = size * currentPrice;
          const pnl = currentValue - costBasis;
          const pnlPercent = costBasis > 0 ? (pnl / costBasis) * 100 : 0;

          posArray.push({
            asset: od.asset || "",
            conditionId,
            market: od.market || conditionId.slice(0, 8),
            outcome,
            size,
            avgPrice,
            currentPrice,
            pnl,
            pnlPercent,
            slug: od.slug || "",
          });
        }
      }

      // Sort by absolute PnL descending
      posArray.sort((a, b) => Math.abs(b.pnl) - Math.abs(a.pnl));
      setPositions(posArray.slice(0, 10));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch positions");
      setPositions([]);
    }

    setLoading(false);
  }, []);

  // Auto-fetch when address is set
  useEffect(() => {
    if (address) {
      fetchPositions(address);
    }
  }, [address, fetchPositions]);

  const handleConnect = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    saveAddress(trimmed);
    setAddress(trimmed);
  };

  const handleDisconnect = () => {
    saveAddress("");
    setAddress("");
    setPositions([]);
    setError("");
  };

  const totalPnl = positions.reduce((sum, p) => sum + p.pnl, 0);
  const totalValue = positions.reduce((sum, p) => sum + p.size * p.currentPrice, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 pb-3">
        <Wallet className="h-4 w-4 text-violet-500" />
        <CardTitle className="text-base">Portfolio Watcher</CardTitle>
        {address && (
          <Badge variant="outline" className="ml-auto text-[10px] font-mono">
            {address.slice(0, 6)}...{address.slice(-4)}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        {!address ? (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Enter your Polymarket wallet address to track your positions.
            </p>
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="0x..."
                className="font-mono text-xs"
                onKeyDown={(e) => e.key === "Enter" && handleConnect()}
              />
              <Button size="sm" onClick={handleConnect} disabled={!inputValue.trim()}>
                Watch
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {loading && (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-8 animate-pulse rounded bg-muted/30" />
                ))}
              </div>
            )}

            {error && (
              <div className="flex items-center justify-between rounded-md border border-red-500/30 bg-red-500/5 px-3 py-2">
                <p className="text-xs text-red-400">{error}</p>
                <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={handleDisconnect}>
                  Disconnect
                </Button>
              </div>
            )}

            {!loading && !error && positions.length === 0 && (
              <div className="flex items-center justify-between py-2">
                <p className="text-xs text-muted-foreground">No open positions found</p>
                <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={handleDisconnect}>
                  <X className="h-3 w-3 mr-1" /> Disconnect
                </Button>
              </div>
            )}

            {!loading && positions.length > 0 && (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-[10px] text-muted-foreground">Portfolio Value</p>
                      <p className="text-sm font-bold tabular-nums">{formatCurrency(totalValue)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Total P&L</p>
                      <p className={`text-sm font-bold tabular-nums ${totalPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {totalPnl >= 0 ? "+" : ""}{formatCurrency(totalPnl)}
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px]" onClick={handleDisconnect}>
                    <X className="h-3 w-3 mr-1" /> Disconnect
                  </Button>
                </div>

                <div className="space-y-1">
                  {positions.map((pos, i) => (
                    <div
                      key={`${pos.conditionId}-${pos.outcome}-${i}`}
                      className={`flex items-center justify-between py-2 px-1 ${
                        i < positions.length - 1 ? "border-b border-border/30" : ""
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium line-clamp-1" title={pos.market}>
                          {pos.market}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="outline" className="text-[9px] px-1 py-0">
                            {pos.outcome}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            {pos.size.toFixed(0)} shares @ {formatPercent(pos.avgPrice)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-2 text-right shrink-0">
                        <div className="flex items-center justify-end gap-1">
                          {pos.pnl >= 0 ? (
                            <TrendingUp className="h-3 w-3 text-emerald-400" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-red-400" />
                          )}
                          <span className={`text-xs font-bold tabular-nums ${pos.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                            {pos.pnl >= 0 ? "+" : ""}{formatCurrency(pos.pnl)}
                          </span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          {formatPercent(pos.currentPrice)} now
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
