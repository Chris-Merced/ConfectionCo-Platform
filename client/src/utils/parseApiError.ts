export async function parseApiError(res: Response): Promise<Error> {
  const text = await res.text().catch(() => "");
  if (!text) return new Error(`Request failed (${res.status})`);
  try {
    const json = JSON.parse(text);
    if (typeof json.message === "string") return new Error(json.message);
    if (typeof json.error === "string") return new Error(json.error);
  } catch {
    // not JSON — use raw text
  }
  return new Error(text);
}
