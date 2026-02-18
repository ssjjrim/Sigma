import { OpinionApiResponse, OpinionTopic } from "./types";

const OPINION_API = "https://proxy.opinion.trade:8443/api/bsc/api/v2";

export async function fetchOpinionTopics(
  limit = 50,
  pages = 3
): Promise<OpinionTopic[]> {
  const perPage = Math.min(limit, 20);
  const pageCount = Math.min(pages, 5);

  const pagePromises = Array.from({ length: pageCount }, (_, i) =>
    fetchPage(i + 1, perPage)
  );

  const results = await Promise.allSettled(pagePromises);
  const allTopics: OpinionTopic[] = [];

  for (const result of results) {
    if (result.status === "fulfilled") {
      allTopics.push(...result.value);
    }
  }

  // Dedup by topicId
  const seen = new Set<number>();
  return allTopics.filter((t) => {
    if (seen.has(t.topicId)) return false;
    seen.add(t.topicId);
    return true;
  });
}

async function fetchPage(page: number, limit: number): Promise<OpinionTopic[]> {
  const params = new URLSearchParams({
    sortBy: "5",
    chainId: "56",
    limit: String(limit),
    status: "2",
    isShow: "1",
    topicType: "2",
    page: String(page),
    indicatorType: "0",
  });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(`${OPINION_API}/topic?${params}`, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });

    if (!res.ok) throw new Error(`Opinion API: ${res.status}`);

    const data: OpinionApiResponse = await res.json();
    if (data.errno !== 0) return [];

    return data.result?.list || [];
  } finally {
    clearTimeout(timer);
  }
}
