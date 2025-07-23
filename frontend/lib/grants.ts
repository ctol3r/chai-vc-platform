export function proposeAllocations(projects: string[], totalBudget: number): Record<string, number> {
  if (projects.length === 0) {
    return {};
  }
  const share = parseFloat((totalBudget / projects.length).toFixed(2));
  const allocations: Record<string, number> = {};
  for (const p of projects) {
    allocations[p] = share;
  }
  return allocations;
}
