import { gql } from "@apollo/client";

export const ISSUE_CREDENTIAL_MUTATION = gql`
  mutation IssueCredential($id: ID!, $hash: String!, $shareStatusOnly: Boolean) {
    issueCredential(id: $id, hash: $hash, shareStatusOnly: $shareStatusOnly) {
      id
      name
      chainTxId
      chainStatus
      proofToken
    }
  }
`;

export type IssueCredentialVariables = {
  id: string | number;
  hash: string;
  shareStatusOnly?: boolean;
};

export type IssueCredentialResult = {
  issueCredential: {
    id: number | string;
    name?: string | null;
    chainTxId?: string | null;
    chainStatus?: string | null;
    proofToken?: string | null;
  };
};
