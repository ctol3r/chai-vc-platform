export class VitalClient {
  constructor(private base = "http://localhost:4000") {}

  async health() {
    const res = await fetch(`${this.base}/api/health`);
    if (!res.ok) throw new Error(`health failed`);
    return res.json();
  }

  async npiLookup(npi: string) {
    const res = await fetch(`${this.base}/api/npi/lookup?npi=${npi}`);
    if (!res.ok) throw new Error(`npi lookup failed`);
    return res.json();
  }
}
