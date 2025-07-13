import { lookupNPI, ProviderDetails } from '../utils/npiLookup';

export interface ProviderLookupResponse {
  provider?: ProviderDetails;
  manualEntryRequired: boolean;
}

// Fetch provider information via NPI. If lookup fails, indicate manual entry.
export async function getProviderInfo(npi: string): Promise<ProviderLookupResponse> {
  const provider = await lookupNPI(npi);
  if (provider) {
    return { provider, manualEntryRequired: false };
  }
  return { manualEntryRequired: true };
}
