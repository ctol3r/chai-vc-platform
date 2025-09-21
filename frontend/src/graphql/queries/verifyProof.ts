import { gql } from "@apollo/client";

export const VERIFY_STATUS_PROOF = gql`
  mutation VerifyStatusProof($presentation: String!) {
    verifyStatusProof(presentation: $presentation) {
      valid
      reason
    }
  }
`;

export type VerifyStatusProofVariables = {
  presentation: string;
};

export type VerifyStatusProofResponse = {
  verifyStatusProof: {
    valid: boolean;
    reason?: string | null;
  };
};
