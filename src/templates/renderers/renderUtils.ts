// A4 page is 595.28pt wide, rendered at 794px — multiply pt values by this to get px.
export const PT_TO_PX = 794 / 595.28

export function p(pt: number): number {
  return pt * PT_TO_PX
}

export function chunkArray<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}
