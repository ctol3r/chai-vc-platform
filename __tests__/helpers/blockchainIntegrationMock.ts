export async function checkCredentialStatus(id: string): Promise<'valid'|'revoked'|'unknown'> {
  return 'valid';
}
export async function anchorProof(payload: any): Promise<string> {
  return '0xdeadbeef00000000000000000000000000000000000000000000000000000000';
}
export default { checkCredentialStatus, anchorProof };
