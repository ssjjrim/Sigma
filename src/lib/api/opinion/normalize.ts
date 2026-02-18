import { UnifiedMarket } from "@/types/market";
import { OpinionTopic } from "./types";

export function normalizeOpinionTopics(topics: OpinionTopic[]): UnifiedMarket[] {
  const markets: UnifiedMarket[] = [];

  for (const topic of topics) {
    if (topic.childList && topic.childList.length > 0) {
      // Multi-outcome: flatten children into individual binary markets
      for (const child of topic.childList) {
        const market = normalizeChild(child, topic);
        if (market) markets.push(market);
      }
    } else {
      // Binary market with direct yes/no
      const market = normalizeBinary(topic);
      if (market) markets.push(market);
    }
  }

  return markets;
}

function normalizeBinary(t: OpinionTopic): UnifiedMarket | null {
  const yesPrice = parseFloat(t.yesBuyPrice || "0");
  const noPrice = parseFloat(t.noBuyPrice || "0");

  if (yesPrice <= 0 && noPrice <= 0) return null;

  const effectiveYes = yesPrice || (noPrice ? 1 - noPrice : 0.5);
  const effectiveNo = noPrice || (yesPrice ? 1 - yesPrice : 0.5);

  return {
    id: `opinion-${t.topicId}`,
    platform: "opinion",
    platformId: String(t.topicId),
    question: t.title,
    description: t.abstract || t.rules || "",
    category: t.labelName?.[0] || "Other",
    status: "active",
    yesPrice: effectiveYes,
    noPrice: effectiveNo,
    spread: Math.abs(effectiveYes - effectiveNo),
    volume: parseFloat(t.volume) || 0,
    volume24h: parseFloat(t.volume24h) || 0,
    liquidity: 0,
    endDate: t.cutoffTime > 0 ? new Date(t.cutoffTime * 1000).toISOString() : null,
    imageUrl: t.thumbnailUrl || null,
    url: `https://app.opinion.trade/detail?topicId=${t.topicId}`,
    lastUpdated: new Date().toISOString(),
    outcomes: [
      { name: t.yesLabel || "Yes", price: effectiveYes },
      { name: t.noLabel || "No", price: effectiveNo },
    ],
  };
}

function normalizeChild(
  child: OpinionTopic,
  parent: OpinionTopic
): UnifiedMarket | null {
  const yesPrice = parseFloat(child.yesBuyPrice || "0");
  const noPrice = parseFloat(child.noBuyPrice || "0");

  if (yesPrice <= 0 && noPrice <= 0) return null;

  const effectiveYes = yesPrice || (noPrice ? 1 - noPrice : 0.5);
  const effectiveNo = noPrice || (yesPrice ? 1 - yesPrice : 0.5);

  return {
    id: `opinion-${child.topicId}`,
    platform: "opinion",
    platformId: String(child.topicId),
    question: `${parent.title}: ${child.title}`,
    description: parent.abstract || parent.rules || "",
    category: parent.labelName?.[0] || "Other",
    status: "active",
    yesPrice: effectiveYes,
    noPrice: effectiveNo,
    spread: Math.abs(effectiveYes - effectiveNo),
    volume: parseFloat(child.volume) || 0,
    volume24h: parseFloat(child.volume24h) || 0,
    liquidity: 0,
    endDate: parent.cutoffTime > 0 ? new Date(parent.cutoffTime * 1000).toISOString() : null,
    imageUrl: parent.thumbnailUrl || null,
    url: `https://app.opinion.trade/detail?topicId=${parent.topicId}`,
    lastUpdated: new Date().toISOString(),
    outcomes: [
      { name: child.yesLabel || child.title || "Yes", price: effectiveYes },
      { name: child.noLabel || "No", price: effectiveNo },
    ],
  };
}
