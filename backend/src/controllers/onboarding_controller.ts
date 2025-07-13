import { lookupNpi } from '../services/npi_lookup';

export async function getProviderInfo(npi: string) {
  return await lookupNpi(npi);
}
