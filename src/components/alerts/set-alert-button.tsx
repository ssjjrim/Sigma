"use client";

import { useState } from "react";
import { Bell, BellPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UnifiedMarket } from "@/types/market";
import { useAlerts } from "@/lib/hooks/use-alerts";
import { formatPercent } from "@/lib/utils/format";

export function SetAlertButton({ market }: { market: UnifiedMarket }) {
  const [open, setOpen] = useState(false);
  const [condition, setCondition] = useState<"above" | "below">("above");
  const [threshold, setThreshold] = useState(
    Math.round(market.yesPrice * 100).toString()
  );
  const { add, requestPermission, alerts } = useAlerts();

  const existingAlerts = alerts.filter((a) => a.marketId === market.id && !a.triggered);

  const handleAdd = () => {
    const thresholdNum = parseFloat(threshold) / 100;
    if (isNaN(thresholdNum) || thresholdNum <= 0 || thresholdNum >= 1) return;

    add({
      marketId: market.id,
      marketQuestion: market.question,
      platform: market.platform,
      platformId: market.platformId,
      condition,
      threshold: thresholdNum,
    });
    setOpen(false);
    // Request notification permission in background (non-blocking)
    requestPermission().catch(() => {});
  };

  return (
    <div className="relative">
      <Button
        size="sm"
        variant="outline"
        onClick={() => setOpen(!open)}
      >
        {existingAlerts.length > 0 ? (
          <Bell className="mr-1 h-3 w-3 text-amber-400" />
        ) : (
          <BellPlus className="mr-1 h-3 w-3" />
        )}
        Alert{existingAlerts.length > 0 ? ` (${existingAlerts.length})` : ""}
      </Button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-lg border border-border/50 bg-background/95 p-4 shadow-xl backdrop-blur-xl">
            <p className="mb-3 text-sm font-semibold">Set Price Alert</p>
            <p className="mb-2 line-clamp-2 text-xs text-muted-foreground">
              {market.question}
            </p>
            <p className="mb-3 text-xs text-muted-foreground">
              Current: <span className="text-foreground font-medium">{formatPercent(market.yesPrice)}</span>
            </p>

            <div className="flex gap-2 mb-3">
              <Button
                size="sm"
                variant={condition === "above" ? "default" : "outline"}
                className="flex-1 text-xs h-8"
                onClick={() => setCondition("above")}
              >
                Above
              </Button>
              <Button
                size="sm"
                variant={condition === "below" ? "default" : "outline"}
                className="flex-1 text-xs h-8"
                onClick={() => setCondition("below")}
              >
                Below
              </Button>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <Input
                type="number"
                min="1"
                max="99"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                className="h-8 text-sm"
              />
              <span className="text-sm text-muted-foreground shrink-0">%</span>
            </div>

            <Button
              size="sm"
              className="w-full"
              onClick={handleAdd}
            >
              <BellPlus className="mr-1.5 h-3 w-3" />
              Add Alert
            </Button>

            {existingAlerts.length > 0 && (
              <div className="mt-3 border-t border-border/30 pt-2">
                <p className="text-[10px] text-muted-foreground mb-1">Active alerts:</p>
                {existingAlerts.map((a) => (
                  <p key={a.id} className="text-[11px] text-muted-foreground">
                    {a.condition === "above" ? "Above" : "Below"} {formatPercent(a.threshold)}
                  </p>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
