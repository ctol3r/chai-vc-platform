import { ApolloServer, gql } from 'apollo-server';
import { requireRole, Context, User } from './rbac';

const typeDefs = gql`
  type Credential {
    id: ID!
    data: String!
  }

  type Query {
    hello: String!
    credential(id: ID!): Credential!
  }
`;

const resolvers = {
  Query: {
    hello: (_parent: unknown, _args: unknown, context: Context) => {
      requireRole('USER', context);
      return 'Hello world';
    },
    credential: (_parent: unknown, args: { id: string }, context: Context) => {
      requireRole('ADMIN', context);
      return { id: args.id, data: 'Credential data' };
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }): Context => {
    const user: User = (req as any).user || { id: 'anon', roles: [] };
    return { user };
  },
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
