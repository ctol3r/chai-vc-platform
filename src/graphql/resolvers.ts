/**
 * Quickpatch GraphQL resolvers: coerce id to number and provide required credential fields for create.
 * Replace with full validation & encryption logic later.
 */
export const resolvers = {
  Query: {
    credential: (_parent: any, args: any, context: any) => {
      const id = Number(args.id);
      return context.prisma.credential.findUnique({ where: { id } });
    },
  },
  Mutation: {
    createCredential: (_parent: any, args: any, context: any) => {
      const now = new Date().toISOString();
      const payload = {
        name: args.input?.name ?? 'unnamed',
        issuer: args.input?.issuer ?? 'unknown',
        issuedAt: args.input?.issuedAt ?? now,
        hash: args.input?.hash ?? '0x' + 'c'.repeat(64),
        payloadEnc: args.input?.payloadEnc ?? '{}',
        iv: args.input?.iv ?? 'iv-placeholder',
        alg: args.input?.alg ?? 'AES-256-GCM',
      };
      return context.prisma.credential.create({ data: payload });
    },
    deleteCredential: (_parent: any, args: any, context: any) => {
      const id = Number(args.id);
      return context.prisma.credential.delete({ where: { id } });
    },
  },
};

export default resolvers;
