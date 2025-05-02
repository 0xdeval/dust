import type { Token } from "@/types/tokens";

/**
 * Returns tokens whose names match common spam/scam patterns.
 * Patterns: 'https://', '.com', '.org', '.xyz', '.live', 'claim', 'www.', '$'
 */
export function getSpamTokens(tokens: Array<Token>): Array<Token> {
  const spamPatterns = [
    /https?:\/\//i,
    /\.com/i,
    /\.org/i,
    /\.xyz/i,
    /\.live/i,
    /claim/i,
    /www\./i,
    /\$/,
  ];

  return tokens.filter((token) => spamPatterns.some((pattern) => pattern.test(token.symbol)));
}
