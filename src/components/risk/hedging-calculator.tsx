"use client";

import { useState } from "react";
import { UnifiedMarket } from "@/types/market";
import { HedgeResult } from "@/types/analytics";
import {
  calculateEqualWeightHedge,
  calculateProbWeightedHedge,
} from "@/lib/analytics/hedging";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatPercent } from "@/lib/utils/format";
import { Calculator, Scale } from "lucide-react";

export function HedgingCalculator({
  markets,
}: {
  markets: UnifiedMarket[];
}) {
  const [budget, setBudget] = useState(100);
  const [method, setMethod] = useState<"equal" | "probability">("equal");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const selected = markets.filter((m) => selectedIds.has(m.id));
  const result: HedgeResult =
    method === "equal"
      ? calculateEqualWeightHedge(selected, budget)
      : calculateProbWeightedHedge(selected, budget);

  function toggleMarket(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 pb-3">
        <Calculator className="h-4 w-4" />
        <CardTitle className="text-base">Hedging Calculator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Budget ($)</Label>
            <Input
              type="number"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-28"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Method</Label>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant={method === "equal" ? "default" : "outline"}
                onClick={() => setMethod("equal")}
              >
                <Scale className="mr-1 h-3 w-3" /> Equal
              </Button>
              <Button
                size="sm"
                variant={method === "probability" ? "default" : "outline"}
                onClick={() => setMethod("probability")}
              >
                Prob-Weighted
              </Button>
            </div>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Select markets ({selected.length} selected)
          </p>
          <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
            {markets.slice(0, 20).map((m) => (
              <Button
                key={m.id}
                size="sm"
                variant={selectedIds.has(m.id) ? "default" : "outline"}
                className="text-xs h-7"
                onClick={() => toggleMarket(m.id)}
              >
                {m.question.slice(0, 40)}... {formatPercent(m.yesPrice, 0)}
              </Button>
            ))}
          </div>
        </div>

        {selected.length > 0 && (
          <div className="rounded-lg border p-4 space-y-3">
            <p className="text-sm font-medium">Hedge Result</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <p className="text-xs text-muted-foreground">Total Cost</p>
                <p className="text-lg font-bold">{formatCurrency(result.totalCost)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">If Yes</p>
                <p className={`text-lg font-bold ${result.profitIfYes >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                  {result.profitIfYes >= 0 ? "+" : ""}{formatCurrency(result.profitIfYes)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">If No</p>
                <p className={`text-lg font-bold ${result.profitIfNo >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                  {result.profitIfNo >= 0 ? "+" : ""}{formatCurrency(result.profitIfNo)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Max Loss</p>
                <p className="text-lg font-bold text-red-500">
                  {formatCurrency(result.maxLoss)}
                </p>
              </div>
            </div>
            <div className="space-y-1">
              {result.positions.map((p, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="line-clamp-1 flex-1">{p.market.question}</span>
                  <Badge variant="outline" className="ml-2">
                    {formatPercent(p.weight)} &middot; {formatCurrency(p.amount)}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
