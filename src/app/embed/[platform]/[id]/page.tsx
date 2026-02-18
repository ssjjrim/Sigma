"use client";

import { use } from "react";
import { Platform } from "@/types/market";
import { useMarketById } from "@/lib/hooks/use-markets";
import { formatPercent, formatCurrency } from "@/lib/utils/format";

const platformColors: Record<Platform, string> = {
  polymarket: "#3b82f6",
  kalshi: "#10b981",
  manifold: "#a855f7",
  opinion: "#f97316",
};

export default function EmbedPage({
  params,
}: {
  params: Promise<{ platform: string; id: string }>;
}) {
  const { platform, id } = use(params);
  const marketId = `${platform}-${id}`;
  const market = useMarketById(marketId);

  if (!market) {
    return (
      <div style={{
        fontFamily: "system-ui, -apple-system, sans-serif",
        padding: "16px",
        background: "#0a0a0f",
        color: "#e4e4e7",
        borderRadius: "12px",
        border: "1px solid #27272a",
        maxWidth: "400px",
      }}>
        <p style={{ color: "#71717a", fontSize: "14px" }}>Loading market...</p>
      </div>
    );
  }

  const accentColor = platformColors[market.platform] || "#3b82f6";

  return (
    <div style={{
      fontFamily: "system-ui, -apple-system, sans-serif",
      padding: "0",
      background: "#0a0a0f",
      color: "#e4e4e7",
      borderRadius: "12px",
      border: "1px solid #27272a",
      maxWidth: "400px",
      overflow: "hidden",
    }}>
      <div style={{
        height: "3px",
        background: accentColor,
      }} />
      <div style={{ padding: "16px" }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "8px",
        }}>
          <span style={{
            fontSize: "10px",
            fontWeight: 600,
            color: accentColor,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}>
            {market.platform}
          </span>
          <span style={{
            fontSize: "10px",
            color: "#71717a",
          }}>
            {market.category}
          </span>
        </div>

        <p style={{
          fontSize: "14px",
          fontWeight: 600,
          lineHeight: 1.4,
          margin: "0 0 12px 0",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical" as const,
          overflow: "hidden",
        }}>
          {market.question}
        </p>

        <div style={{
          display: "flex",
          gap: "12px",
          alignItems: "baseline",
        }}>
          <div>
            <span style={{
              fontSize: "24px",
              fontWeight: 700,
              fontVariantNumeric: "tabular-nums",
              color: "#10b981",
            }}>
              {formatPercent(market.yesPrice, 0)}
            </span>
            <span style={{
              fontSize: "10px",
              color: "#71717a",
              marginLeft: "4px",
            }}>
              Yes
            </span>
          </div>
          <div>
            <span style={{
              fontSize: "16px",
              fontWeight: 600,
              fontVariantNumeric: "tabular-nums",
              color: "#ef4444",
            }}>
              {formatPercent(market.noPrice, 0)}
            </span>
            <span style={{
              fontSize: "10px",
              color: "#71717a",
              marginLeft: "4px",
            }}>
              No
            </span>
          </div>
          {market.volume24h > 0 && (
            <span style={{
              fontSize: "11px",
              color: "#71717a",
              marginLeft: "auto",
            }}>
              Vol: {formatCurrency(market.volume24h)}
            </span>
          )}
        </div>

        <div style={{
          marginTop: "12px",
          paddingTop: "8px",
          borderTop: "1px solid #27272a",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <span style={{ fontSize: "10px", color: "#52525b" }}>
            via Sigmar
          </span>
          <a
            href={`${typeof window !== "undefined" ? window.location.origin : ""}/markets/${market.platform}/${market.platformId}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: "10px",
              color: accentColor,
              textDecoration: "none",
            }}
          >
            View details →
          </a>
        </div>
      </div>
    </div>
  );
}
