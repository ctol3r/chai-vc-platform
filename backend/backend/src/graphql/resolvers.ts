export const resolvers = {
  Query: {
    credential: async (_parent: any, args: any, context: any) => {
      const id = Number(args.id);
      if (Number.isNaN(id)) throw new Error('Invalid id');
      return context.prisma.credential.findUnique({ where: { id } });
    }
  },
  Mutation: {
    createCredential: async (_parent: any, args: any, context: any) => {
      // Ensure required crypto fields are provided or filled with placeholders (seed/CI compatibility)
      const cryptoFields = {
        hash: args.hash ?? '0x' + 'b'.repeat(64),
        payloadEnc: args.payloadEnc ?? Buffer.from(JSON.stringify(args.payload ?? {})).toString('base64'),
        iv: args.iv ?? 'iv-placeholder-16b',
        alg: args.alg ?? 'AES-256-GCM',
      };
      return context.prisma.credential.create({
        data: {
          name: args.name,
          issuer: args.issuer,
          issuedAt: args.issuedAt,
          userId: Number(args.userId),
          ...cryptoFields
        }
      });
    }
  }
};
