"use client";

import { useState } from "react";
import { Bell, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAlerts } from "@/lib/hooks/use-alerts";
import { formatPercent } from "@/lib/utils/format";
import Link from "next/link";

export function AlertBell() {
  const { alerts, triggeredCount, activeCount, remove, clear } = useAlerts();
  const [open, setOpen] = useState(false);

  const totalCount = activeCount + triggeredCount;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative h-8 w-8"
        onClick={() => setOpen(!open)}
      >
        <Bell className="h-4 w-4" />
        {totalCount > 0 && (
          <span
            className={`absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white ${
              triggeredCount > 0 ? "bg-amber-500 animate-pulse" : "bg-primary"
            }`}
          >
            {totalCount}
          </span>
        )}
      </Button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border border-border/50 bg-background/95 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-border/30 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">Price Alerts</span>
                {triggeredCount > 0 && (
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-400 text-[10px]">
                    {triggeredCount} triggered
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setOpen(false)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {alerts.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <Bell className="mx-auto mb-2 h-8 w-8 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">No alerts set</p>
                  <p className="mt-1 text-xs text-muted-foreground/70">
                    Add alerts from any market detail page
                  </p>
                </div>
              ) : (
                alerts
                  .sort((a, b) => {
                    if (a.triggered && !b.triggered) return -1;
                    if (!a.triggered && b.triggered) return 1;
                    return b.createdAt - a.createdAt;
                  })
                  .map((alert) => (
                    <div
                      key={alert.id}
                      className={`flex items-start gap-3 border-b border-border/20 px-4 py-3 ${
                        alert.triggered ? "bg-amber-500/5" : ""
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/markets/${alert.platform}/${alert.platformId}`}
                          onClick={() => setOpen(false)}
                          className="line-clamp-1 text-xs font-medium hover:text-primary transition-colors"
                        >
                          {alert.marketQuestion}
                        </Link>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {alert.condition === "above" ? "Above" : "Below"}{" "}
                          {formatPercent(alert.threshold)}
                          {alert.triggered && alert.currentPrice != null && (
                            <span className="ml-1 text-amber-400">
                              (now {formatPercent(alert.currentPrice)})
                            </span>
                          )}
                        </p>
                        {alert.triggered && (
                          <Badge
                            variant="outline"
                            className="mt-1 bg-amber-500/10 text-amber-400 text-[10px] px-1.5"
                          >
                            Triggered
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0 text-muted-foreground hover:text-red-400"
                        onClick={() => remove(alert.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))
              )}
            </div>

            {triggeredCount > 0 && (
              <div className="border-t border-border/30 px-4 py-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs text-muted-foreground"
                  onClick={clear}
                >
                  Clear triggered alerts
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
