export interface NppesProfile {
  basic?: {
    first_name?: string;
    last_name?: string;
    middle_name?: string;
    credential?: string;
  };
  addresses?: Array<{
    address_purpose?: string;
    address_type?: string;
    address_1?: string;
    address_2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
  }>;
  [key: string]: any;
}

/**
 * Fetch provider profile information from the NPPES NPI Registry.
 * @param npi - Provider NPI number
 * @returns first matching profile or null if none found
 */
export async function fetchProfileByNpi(npi: string): Promise<NppesProfile | null> {
  const url = `https://npiregistry.cms.hhs.gov/api/?version=2.1&number=${encodeURIComponent(npi)}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch NPPES profile: ${res.status} ${res.statusText}`);
  }
  const data = (await res.json()) as { results?: NppesProfile[] };
  if (data.results && data.results.length > 0) {
    return data.results[0];
  }
  return null;
}
