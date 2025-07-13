export interface ProviderDetails {
  firstName: string;
  lastName: string;
  enumerationType: string;
}

export async function lookupNPI(npi: string): Promise<ProviderDetails | null> {
  const url = `https://npiregistry.cms.hhs.gov/api/?number=${npi}&version=2.1`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      return null;
    }
    const data = await res.json();
    if (!data.results || data.results.length === 0) {
      return null;
    }
    const provider = data.results[0].basic;
    return {
      firstName: provider.first_name,
      lastName: provider.last_name,
      enumerationType: provider.enumeration_type,
    };
  } catch (err) {
    return null;
  }
}
