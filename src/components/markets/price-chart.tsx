"use client";

import { useEffect, useRef } from "react";
import { PricePoint } from "@/types/market";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { createChart, ColorType, IChartApi, AreaSeries, UTCTimestamp } from "lightweight-charts";
import { useTheme } from "next-themes";

export function PriceChart({
  data,
  isLoading,
  title = "Price History",
}: {
  data: PricePoint[];
  isLoading: boolean;
  title?: string;
}) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!chartContainerRef.current || data.length === 0) return;

    const isDark = theme === "dark";

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: isDark ? "#a1a1aa" : "#71717a",
      },
      grid: {
        vertLines: { color: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.06)" },
        horzLines: { color: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.06)" },
      },
      width: chartContainerRef.current.clientWidth,
      height: 300,
      rightPriceScale: {
        borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
      },
      timeScale: {
        borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
        timeVisible: true,
      },
      crosshair: {
        vertLine: { labelBackgroundColor: isDark ? "#27272a" : "#f4f4f5" },
        horzLine: { labelBackgroundColor: isDark ? "#27272a" : "#f4f4f5" },
      },
    });

    chartRef.current = chart;

    const areaSeries = chart.addSeries(AreaSeries, {
      lineColor: "#3b82f6",
      topColor: "rgba(59, 130, 246, 0.3)",
      bottomColor: "rgba(59, 130, 246, 0.02)",
      lineWidth: 2,
    });

    const chartData = data
      .map((p) => ({
        time: p.timestamp as UTCTimestamp,
        value: p.price * 100,
      }))
      .sort((a, b) => (a.time as number) - (b.time as number));

    areaSeries.setData(chartData);
    chart.timeScale().fitContent();

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [data, theme]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : data.length === 0 ? (
          <div className="relative flex h-[300px] items-center justify-center overflow-hidden rounded-md border border-dashed border-border/50">
            {/* Placeholder grid lines */}
            <div className="absolute inset-0 opacity-[0.03]">
              {[...Array(6)].map((_, i) => (
                <div key={`h${i}`} className="absolute w-full border-t border-foreground" style={{ top: `${(i + 1) * 14.3}%` }} />
              ))}
              {[...Array(8)].map((_, i) => (
                <div key={`v${i}`} className="absolute h-full border-l border-foreground" style={{ left: `${(i + 1) * 11.1}%` }} />
              ))}
            </div>
            <div className="z-10 flex flex-col items-center gap-1.5">
              <svg className="h-8 w-8 text-muted-foreground/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 17l6-6 4 4 8-8" />
                <path d="M17 7h4v4" />
              </svg>
              <p className="text-sm text-muted-foreground/60">No price history available</p>
              <p className="text-xs text-muted-foreground/40">Price charts require Polymarket CLOB data</p>
            </div>
          </div>
        ) : (
          <div ref={chartContainerRef} />
        )}
      </CardContent>
    </Card>
  );
}
