"use client";

import { useState } from "react";
import { UnifiedMarket } from "@/types/market";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/format";
import { Calculator, ExternalLink, TrendingUp } from "lucide-react";

const BUILDER_CODE = "PREDICTBOARD";

export function TradeSimulator({ market }: { market: UnifiedMarket }) {
  const [amount, setAmount] = useState("100");
  const [side, setSide] = useState<"yes" | "no">("yes");

  const investment = parseFloat(amount) || 0;
  const price = side === "yes" ? market.yesPrice : market.noPrice;
  const shares = price > 0 ? investment / price : 0;
  const payout = shares; // Each share pays $1 if correct
  const profit = payout - investment;
  const roi = investment > 0 ? (profit / investment) * 100 : 0;

  const tradeUrl =
    market.platform === "polymarket"
      ? `${market.url}?bc=${BUILDER_CODE}`
      : market.url;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 pb-3">
        <Calculator className="h-4 w-4 text-emerald-500" />
        <CardTitle className="text-base">Simulate Trade</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={side === "yes" ? "default" : "outline"}
            onClick={() => setSide("yes")}
            className={side === "yes" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
          >
            Yes
          </Button>
          <Button
            size="sm"
            variant={side === "no" ? "default" : "outline"}
            onClick={() => setSide("no")}
            className={side === "no" ? "bg-red-600 hover:bg-red-700" : ""}
          >
            No
          </Button>
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pl-7 h-9"
              placeholder="Amount"
              min="1"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-md border border-border/50 p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Cost per Share</p>
            <p className="text-lg font-bold tabular-nums">
              {formatCurrency(price)}
            </p>
          </div>
          <div className="rounded-md border border-border/50 p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Shares</p>
            <p className="text-lg font-bold tabular-nums">
              {shares.toFixed(1)}
            </p>
          </div>
          <div className="rounded-md border border-border/50 p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">If Correct</p>
            <p className="text-lg font-bold tabular-nums text-emerald-400">
              {formatCurrency(payout)}
            </p>
          </div>
          <div className="rounded-md border border-border/50 p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Net Profit</p>
            <div className="flex items-center gap-1.5">
              <p className={`text-lg font-bold tabular-nums ${profit > 0 ? "text-emerald-400" : "text-red-400"}`}>
                {profit >= 0 ? "+" : ""}{formatCurrency(profit)}
              </p>
              <Badge
                variant="outline"
                className={`text-[10px] px-1.5 py-0 ${
                  roi > 0
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-red-500/10 text-red-400 border-red-500/20"
                }`}
              >
                {roi >= 0 ? "+" : ""}{roi.toFixed(0)}%
              </Badge>
            </div>
          </div>
        </div>

        <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
          <a href={tradeUrl} target="_blank" rel="noopener noreferrer">
            <TrendingUp className="mr-2 h-4 w-4" />
            Trade on {market.platform === "polymarket" ? "Polymarket" : market.platform === "kalshi" ? "Kalshi" : market.platform === "manifold" ? "Manifold" : "Opinion"}
            <ExternalLink className="ml-2 h-3 w-3" />
          </a>
        </Button>

        <p className="text-[10px] text-muted-foreground text-center">
          Not financial advice. Each share pays $1 if the outcome is correct.
        </p>
      </CardContent>
    </Card>
  );
}
