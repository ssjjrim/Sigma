export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

function normalizeQuestion(q: string): string {
  return q
    .toLowerCase()
    // Remove everything after → (arrow used in multi-outcome event titles)
    .replace(/→.*$/, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractKeywords(q: string): Set<string> {
  const stopWords = new Set([
    "will", "the", "be", "a", "an", "in", "on", "of", "to", "for",
    "by", "at", "or", "and", "is", "it", "this", "that", "with",
    "from", "as", "its", "has", "have", "after", "before", "next",
    "what", "who", "how", "when", "where", "which",
  ]);
  const normalized = normalizeQuestion(q);
  return new Set(
    normalized.split(" ").filter((w) => w.length > 2 && !stopWords.has(w))
  );
}

/**
 * Token overlap similarity (Jaccard-like).
 * Returns a score 0-1 based on shared keywords.
 */
function tokenSimilarity(a: string, b: string): number {
  const wordsA = extractKeywords(a);
  const wordsB = extractKeywords(b);
  if (wordsA.size === 0 || wordsB.size === 0) return 0;

  let overlap = 0;
  for (const w of wordsA) {
    if (wordsB.has(w)) overlap++;
  }
  const union = new Set([...wordsA, ...wordsB]).size;
  return union > 0 ? overlap / union : 0;
}

export function stringSimilarity(a: string, b: string): number {
  const cleanA = normalizeQuestion(a);
  const cleanB = normalizeQuestion(b);
  const maxLen = Math.max(cleanA.length, cleanB.length);
  if (maxLen === 0) return 1;

  // Levenshtein-based similarity
  const levSim = 1 - levenshteinDistance(cleanA, cleanB) / maxLen;

  // Token overlap similarity
  const tokSim = tokenSimilarity(a, b);

  // Use the higher score - token matching catches semantically similar questions
  // that differ in phrasing/structure
  return Math.max(levSim, tokSim);
}

export function findBestMatch(
  query: string,
  candidates: string[]
): { index: number; similarity: number } | null {
  if (candidates.length === 0) return null;

  let bestIndex = 0;
  let bestSim = 0;

  for (let i = 0; i < candidates.length; i++) {
    const sim = stringSimilarity(query, candidates[i]);
    if (sim > bestSim) {
      bestSim = sim;
      bestIndex = i;
    }
  }

  return { index: bestIndex, similarity: bestSim };
}
