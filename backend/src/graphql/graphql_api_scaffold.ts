// Basic GraphQL schema for chai-vc-platform API
export const typeDefs = /* GraphQL */ `
  type User {
    id: ID!
    name: String!
    email: String!
    credentials: [Credential!]
    jobs: [Job!]
  }

  type Credential {
    id: ID!
    name: String!
    issuer: String!
    issuedAt: String
    expiresAt: String
    user: User
  }

  type Job {
    id: ID!
    title: String!
    description: String
    postedBy: User
    applicants: [User!]
  }

  type Query {
    users: [User!]
    user(id: ID!): User
    credentials: [Credential!]
    credential(id: ID!): Credential
    jobs: [Job!]
    job(id: ID!): Job
  }

  type Mutation {
    createUser(name: String!, email: String!): User
    issueCredential(
      userId: ID!
      name: String!
      issuer: String!
      issuedAt: String
      expiresAt: String
    ): Credential
    postJob(title: String!, description: String, postedBy: ID!): Job
    applyForJob(jobId: ID!, userId: ID!): Job
  }
`;
