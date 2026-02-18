"use client";

import { Orderbook } from "@/types/market";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function OrderbookView({
  orderbook,
  isLoading,
}: {
  orderbook: Orderbook | undefined;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Orderbook</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!orderbook || (orderbook.bids.length === 0 && orderbook.asks.length === 0)) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Orderbook</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No orderbook data available</p>
        </CardContent>
      </Card>
    );
  }

  const maxSize = Math.max(
    ...orderbook.bids.map((b) => b.size),
    ...orderbook.asks.map((a) => a.size),
    1
  );

  const displayBids = orderbook.bids.slice(0, 10);
  const displayAsks = orderbook.asks.slice(0, 10);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          Orderbook{" "}
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            Spread: {(orderbook.spread * 100).toFixed(1)}¢ | Mid:{" "}
            {(orderbook.midPrice * 100).toFixed(1)}¢
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="mb-2 text-xs font-medium text-emerald-500">Bids (Buy)</p>
            <div className="space-y-0.5">
              {displayBids.map((b, i) => (
                <div key={i} className="relative flex justify-between text-xs py-0.5 px-1">
                  <div
                    className="absolute inset-y-0 left-0 bg-emerald-500/10 rounded-sm"
                    style={{ width: `${(b.size / maxSize) * 100}%` }}
                  />
                  <span className="relative font-mono text-emerald-500">
                    {(b.price * 100).toFixed(1)}¢
                  </span>
                  <span className="relative text-muted-foreground">
                    {b.size.toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-red-500">Asks (Sell)</p>
            <div className="space-y-0.5">
              {displayAsks.map((a, i) => (
                <div key={i} className="relative flex justify-between text-xs py-0.5 px-1">
                  <div
                    className="absolute inset-y-0 right-0 bg-red-500/10 rounded-sm"
                    style={{ width: `${(a.size / maxSize) * 100}%` }}
                  />
                  <span className="relative font-mono text-red-500">
                    {(a.price * 100).toFixed(1)}¢
                  </span>
                  <span className="relative text-muted-foreground">
                    {a.size.toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
