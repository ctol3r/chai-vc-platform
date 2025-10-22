export async function record(action: string, data: Record<string, unknown>) {
  return `${action}-${Date.now()}`;
}
