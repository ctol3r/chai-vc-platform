export interface Credential {
  id: string;
  [key: string]: unknown;
}

export interface Presentation {
  verifiableCredential: Partial<Credential>;
}

/**
 * Create a presentation that discloses only selected attributes from the
 * credential.
 */
export function createSelectiveDisclosurePresentation(
  credential: Credential,
  attributesToReveal: string[],
): Presentation {
  const disclosed: Partial<Credential> = { id: credential.id };
  for (const key of attributesToReveal) {
    if (key in credential) {
      disclosed[key] = credential[key];
    }
  }
  return { verifiableCredential: disclosed };
}
