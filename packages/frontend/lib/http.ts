export async function getJSON<T = any>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, cache: "no-store" });
  if (!res.ok) throw new Error(`GET ${url} failed: ${res.status}`);
  return res.json();
}
export async function postJSON<T = any>(url: string, body: any, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    body: JSON.stringify(body),
    ...init
  });
  if (!res.ok) throw new Error(`POST ${url} failed: ${res.status}`);
  return res.json();
}
