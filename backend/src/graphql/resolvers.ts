import { PrismaClient } from '@prisma/client';

type Context = {
  prisma: PrismaClient;
};

type CredentialIdArgs = { id: string };
type CreateCredentialArgs = { name: string; issuer: string };
type UpdateCredentialArgs = { id: string; name?: string; issuer?: string };

const parseId = (rawId: string): number => {
  const parsed = Number(rawId);
  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid credential id: ${rawId}`);
  }
  return parsed;
};

export const resolvers = {
  Query: {
    credentials: (_parent: unknown, _args: unknown, context: Context) =>
      context.prisma.credential.findMany(),
    credential: (_parent: unknown, args: CredentialIdArgs, context: Context) =>
      context.prisma.credential.findUnique({ where: { id: parseId(args.id) } }),
  },
  Mutation: {
    createCredential: (_parent: unknown, args: CreateCredentialArgs, context: Context) =>
      context.prisma.credential.create({
        data: {
          name: args.name,
          issuer: args.issuer,
          issuedAt: new Date(),
          hash: 'created-hash',
          payloadEnc: 'cGF5bG9hZA==',
          iv: 'iv123',
          alg: 'AES-GCM',
        },
      }),

    updateCredential: (_parent: unknown, args: UpdateCredentialArgs, context: Context) => {
      const data: { name?: string; issuer?: string } = {};
      if (typeof args.name === 'string') {
        data.name = args.name;
      }
      if (typeof args.issuer === 'string') {
        data.issuer = args.issuer;
      }

      return context.prisma.credential.update({
        where: { id: parseId(args.id) },
        data,
      });
    },

    deleteCredential: (_parent: unknown, args: CredentialIdArgs, context: Context) =>
      context.prisma.credential.delete({ where: { id: parseId(args.id) } }),
  },
};
