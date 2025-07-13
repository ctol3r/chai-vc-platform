import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type Credential {
    id: ID!
    type: String!
    issuedTo: String!
  }

  input IssueCredentialInput {
    type: String!
    issuedTo: String!
  }

  type Mutation {
    issueCredential(input: IssueCredentialInput!): Credential!
  }

  type Query {
    _empty: String
  }
`;

export const resolvers = {
  Mutation: {
    issueCredential: (_: any, { input }: any) => {
      return {
        id: Date.now().toString(),
        type: input.type,
        issuedTo: input.issuedTo,
      };
    },
  },
};
