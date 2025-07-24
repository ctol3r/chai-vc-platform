export interface Credential {
  id: string;
  userId: string;
  organizationId: string;
  verified: boolean;
  data: Record<string, any>;
}

export interface CredentialReuseRequest {
  credentialId: string;
  targetOrganizationId: string;
}

export class CredentialReuseController {
  /**
   * Generate a one-click link for reusing credentials across organizations.
   * This token can be sent to a rehired user so they can approve reuse in a
   * single click.
   */
  static generateReuseLink(req: CredentialReuseRequest): string {
    const token = Buffer.from(`${req.credentialId}:${req.targetOrganizationId}`).toString('base64');
    return `https://platform.example.com/reuse/${token}`;
  }

  /**
   * Process a credential reuse token and create a reused credential record.
   * In a real implementation this would look up the existing credential and
   * copy it for the new organization. Here we just return a stubbed credential
   * object to illustrate the flow.
   */
  static reuseCredentials(token: string): Credential {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const [credentialId, targetOrganizationId] = decoded.split(':');

    // Placeholder for database lookup and copy of credential.
    return {
      id: `${credentialId}-reused-${targetOrganizationId}`,
      userId: 'placeholder-user',
      organizationId: targetOrganizationId,
      verified: true,
      data: { reusedFrom: credentialId },
    };
  }
}
