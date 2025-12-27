import { gql } from "@apollo/client";

export const ISSUE_CREDENTIAL = gql`
  mutation IssueCredential($account: String!, $data: String!, $shareStatusOnly: Boolean) {
    issueCredential(account: $account, data: $data, shareStatusOnly: $shareStatusOnly) {
      chainTxId
      chainStatus
      proofToken
    }
  }
`;

export interface IssueCredentialVariables {
  account: string;
  data: string;
  shareStatusOnly?: boolean;
}

export interface IssueCredentialResponse {
  issueCredential: {
    chainTxId?: string | null;
    chainStatus?: string | null;
    proofToken?: string | null;
  };
}
