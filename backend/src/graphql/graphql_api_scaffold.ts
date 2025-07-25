import { ApolloServer } from 'apollo-server';
import { PrismaClient } from '@prisma/client';
import { typeDefs } from './typeDefs';
import { resolvers } from './resolvers';

const prisma = new PrismaClient();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: () => ({ prisma }),
});

server.listen().then(({ url }) => {
  /* eslint-disable no-console */
  console.log(`Server ready at ${url}`);
});
