import { gql } from "@apollo/client";

export const ISSUE_CREDENTIAL = gql`
  mutation IssueCredential($input: IssueCredentialInput!) {
    issueCredential(input: $input) {
      id
      chainTxId
      chainStatus
      proofToken
    }
  }
`;

export interface IssueCredentialVariables {
  input: {
    subjectAccount: string;
    payload: string;
    shareStatusOnly?: boolean;
  };
}

export interface IssueCredentialResponse {
  issueCredential: {
    id?: string | null;
    chainTxId?: string | null;
    chainStatus?: string | null;
    proofToken?: string | null;
  };
}
