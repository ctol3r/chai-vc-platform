import { ApolloServer, gql } from 'apollo-server-express';
import express from 'express';

const typeDefs = gql`
  type Clinician {
    id: ID!
    name: String!
    specialty: String!
  }

  type Query {
    cliniciansBySpecialty(specialty: String!): [Clinician!]!
  }
`;

const clinicians = [
  { id: '1', name: 'Dr. Smith', specialty: 'Cardiology' },
  { id: '2', name: 'Dr. Adams', specialty: 'Neurology' },
  { id: '3', name: 'Dr. Brown', specialty: 'Cardiology' },
];

const resolvers = {
  Query: {
    cliniciansBySpecialty: (_: unknown, { specialty }: { specialty: string }) =>
      clinicians.filter(
        (c) => c.specialty.toLowerCase() === specialty.toLowerCase()
      ),
  },
};

export function startGraphQLServer(port = 4000) {
  const app = express();
  const server = new ApolloServer({ typeDefs, resolvers });
  server.start().then(() => {
    server.applyMiddleware({ app });
    app.listen({ port }, () => {
      console.log(`GraphQL ready at http://localhost:${port}${server.graphqlPath}`);
    });
  });
}
