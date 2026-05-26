/** Portal explorer URL for an on-chain atom term id. */
export function portalAtomUrl(termId: string): string {
  return `https://portal.intuition.systems/explore/atom/${termId}?tab=overview`;
}

/** Portal explorer URL for an on-chain triple term id. */
export function portalTripleUrl(termId: string): string {
  return `https://portal.intuition.systems/explore/triple/${termId}?tab=overview`;
}
