export function completionColor(done: number, total: number): string {
  if (total === 0) return 'hsl(0,0%,80%)'
  const percent = (done / total) * 100
  return `hsl(${percent * 1.2},70%,45%)`
}
