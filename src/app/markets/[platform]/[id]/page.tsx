"use client";

import { use } from "react";
import { Platform } from "@/types/market";
import { useMarketById, useMarkets } from "@/lib/hooks/use-markets";
import { usePriceHistory } from "@/lib/hooks/use-price-history";
import { useOrderbook } from "@/lib/hooks/use-orderbook";
import { PriceChart } from "@/components/markets/price-chart";
import { OrderbookView } from "@/components/markets/orderbook-view";
import { RelatedMarkets } from "@/components/markets/related-markets";
import { SetAlertButton } from "@/components/alerts/set-alert-button";
import { StarButton } from "@/components/watchlist/star-button";
import { ArbitrageBadge } from "@/components/markets/arbitrage-badge";
import { TradeSimulator } from "@/components/markets/trade-simulator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPercent, formatCurrency, formatDate } from "@/lib/utils/format";
import { stringSimilarity } from "@/lib/utils/string-similarity";
import { ExternalLink, ArrowLeft, Share2, Check, Copy } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const BUILDER_CODE = "PREDICTBOARD";

export default function MarketDetailPage({
  params,
}: {
  params: Promise<{ platform: string; id: string }>;
}) {
  const { platform, id } = use(params);
  const marketId = `${platform}-${id}`;
  const market = useMarketById(marketId);
  const { data: marketsData } = useMarkets();
  const allMarkets = marketsData?.markets ?? [];

  const tokenId = market?.outcomes[0]?.tokenId;
  const { data: priceHistory, isLoading: priceLoading } = usePriceHistory(
    platform === "polymarket" ? tokenId : undefined
  );

  const { data: orderbook, isLoading: obLoading } = useOrderbook(
    platform as Platform,
    platform === "polymarket"
      ? tokenId
      : platform === "kalshi"
        ? id
        : undefined
  );

  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  if (!market) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  const tradeUrl =
    platform === "polymarket"
      ? `${market.url}?bc=${BUILDER_CODE}`
      : market.url;

  const handleEmbed = async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const embedCode = `<iframe src="${origin}/embed/${market.platform}/${market.platformId}" width="420" height="200" frameborder="0" style="border-radius:12px;overflow:hidden;"></iframe>`;
    await navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const buildShareText = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/markets/${market.platform}/${market.platformId}`;
    const vol = market.volume24h > 0 ? `Vol: ${formatCurrency(market.volume24h)}` : "";

    // Find arbitrage opportunity if exists
    let arbLine = "";
    const crossMatch = allMarkets.find(
      (m) =>
        m.id !== market.id &&
        m.platform !== market.platform &&
        stringSimilarity(market.question, m.question) >= 0.6 &&
        m.yesPrice < market.yesPrice - 0.01
    );
    if (crossMatch) {
      const savings = market.yesPrice - crossMatch.yesPrice;
      arbLine = `Arb: YES at ${formatPercent(crossMatch.yesPrice)} on ${crossMatch.platform} (save ${formatPercent(savings)})`;
    }

    return [
      market.question,
      `Yes: ${formatPercent(market.yesPrice)} | No: ${formatPercent(market.noPrice)}`,
      vol,
      arbLine,
      `Track on Sigmar: ${url}`,
    ]
      .filter(Boolean)
      .join("\n");
  };

  const handleShareStats = async () => {
    await navigator.clipboard.writeText(buildShareText());
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/markets"
            className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" /> Markets
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">{market.question}</h1>
            <StarButton marketId={market.id} />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="capitalize">
              {market.platform}
            </Badge>
            <Badge
              variant="outline"
              className={
                market.status === "active"
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "bg-muted text-muted-foreground"
              }
            >
              {market.status}
            </Badge>
            {market.category && (
              <Badge variant="secondary">{market.category}</Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2 shrink-0 flex-wrap justify-end">
          <SetAlertButton market={market} />
          <Button size="sm" variant="outline" onClick={handleShareStats}>
            {shared ? <Check className="mr-1 h-3 w-3" /> : <Copy className="mr-1 h-3 w-3" />}
            {shared ? "Copied!" : "Copy"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            asChild
          >
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(buildShareText())}`}
              target="_blank"
              rel="noopener noreferrer"
              className="gap-1"
            >
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              Post
            </a>
          </Button>
          <Button
            size="sm"
            variant="outline"
            asChild
          >
            <a
              href={`https://warpcast.com/~/compose?text=${encodeURIComponent(buildShareText())}`}
              target="_blank"
              rel="noopener noreferrer"
              className="gap-1"
            >
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor"><path d="M3.72 2h16.56C21.23 2 22 2.77 22 3.72v16.56c0 .95-.77 1.72-1.72 1.72H3.72C2.77 22 2 21.23 2 20.28V3.72C2 2.77 2.77 2 3.72 2zM7.5 7l1.5 5 1.5-5h5l1.5 5 1.5-5h1.5l-2.25 10h-1.5L14.25 12 12.75 17h-1.5L9 12 7.5 17H6L3.75 7z"/></svg>
              Cast
            </a>
          </Button>
          <Button size="sm" variant="outline" onClick={handleEmbed}>
            {copied ? <Check className="mr-1 h-3 w-3" /> : <Share2 className="mr-1 h-3 w-3" />}
            {copied ? "Copied!" : "Embed"}
          </Button>
          <Button asChild size="sm">
            <a href={tradeUrl} target="_blank" rel="noopener noreferrer">
              Trade <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </Button>
        </div>
      </div>

      <ArbitrageBadge current={market} allMarkets={allMarkets} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden border-border/50 bg-gradient-to-br from-emerald-500/5 to-transparent">
          <div className="absolute left-0 top-0 h-full w-1 bg-emerald-500" />
          <CardContent className="pt-6 pl-5">
            <p className="text-xs text-muted-foreground">Yes Price</p>
            <p className="text-2xl font-bold tabular-nums text-emerald-500">
              {formatPercent(market.yesPrice)}
            </p>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden border-border/50 bg-gradient-to-br from-red-500/5 to-transparent">
          <div className="absolute left-0 top-0 h-full w-1 bg-red-500" />
          <CardContent className="pt-6 pl-5">
            <p className="text-xs text-muted-foreground">No Price</p>
            <p className="text-2xl font-bold tabular-nums text-red-500">
              {formatPercent(market.noPrice)}
            </p>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden border-border/50 bg-gradient-to-br from-blue-500/5 to-transparent">
          <div className="absolute left-0 top-0 h-full w-1 bg-blue-500" />
          <CardContent className="pt-6 pl-5">
            <p className="text-xs text-muted-foreground">Volume (24h)</p>
            <p className="text-2xl font-bold tabular-nums text-blue-400">
              {formatCurrency(market.volume24h)}
            </p>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden border-border/50 bg-gradient-to-br from-amber-500/5 to-transparent">
          <div className="absolute left-0 top-0 h-full w-1 bg-amber-500" />
          <CardContent className="pt-6 pl-5">
            <p className="text-xs text-muted-foreground">End Date</p>
            <p className="text-2xl font-bold tabular-nums text-amber-400">
              {market.endDate ? formatDate(market.endDate) : "N/A"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <PriceChart
          data={priceHistory ?? []}
          isLoading={priceLoading}
          title="Price History"
        />
        <OrderbookView orderbook={orderbook} isLoading={obLoading} />
      </div>

      <TradeSimulator market={market} />

      {market.description && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="max-w-prose text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
              {market.description}
            </p>
          </CardContent>
        </Card>
      )}

      {allMarkets.length > 0 && (
        <RelatedMarkets current={market} allMarkets={allMarkets} />
      )}
    </div>
  );
}
