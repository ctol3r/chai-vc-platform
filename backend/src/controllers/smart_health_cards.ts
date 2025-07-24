import jwt from 'jsonwebtoken';

const SECRET = process.env.SHC_SECRET || 'change_me';

export interface FhirBundle {
  iss: string;
  nbf?: number;
  vc: any;
}

export async function issueHealthCard(bundle: FhirBundle): Promise<string> {
  if (!bundle || !bundle.vc) {
    throw new Error('Invalid FHIR bundle');
  }
  const token = jwt.sign(bundle, SECRET, { algorithm: 'HS256' });
  return `shc:${token}`;
}

export async function verifyHealthCard(card: string): Promise<boolean> {
  if (!card) throw new Error('No card provided');
  const token = card.startsWith('shc:') ? card.slice(4) : card;
  try {
    jwt.verify(token, SECRET);
    return true;
  } catch {
    return false;
  }
}
