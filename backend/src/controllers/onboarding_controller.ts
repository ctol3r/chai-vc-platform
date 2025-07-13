import { generateDID, resolveDID, DIDDocument } from '../blockchain/did_service';

export interface ClinicianProfile {
  name: string;
  did: string;
  document: DIDDocument;
}

export function onboardClinician(name: string): ClinicianProfile {
  const { did, document } = generateDID();
  // In a full implementation the clinician record would be persisted here.
  return { name, did, document };
}

export function resolveClinician(did: string): DIDDocument {
  return resolveDID(did);
}
