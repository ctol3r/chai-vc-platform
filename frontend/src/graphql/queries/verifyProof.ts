import { gql } from "@apollo/client";

export const VERIFY_PROOF = gql`
  query VerifyProof($presentationToken: String!) {
    verifyProof(presentationToken: $presentationToken) {
      valid
      reason
    }
  }
`;

export interface VerifyProofVariables {
  presentationToken: string;
}

export interface VerifyProofResponse {
  verifyProof: {
    valid: boolean;
    reason?: string | null;
  };
}
