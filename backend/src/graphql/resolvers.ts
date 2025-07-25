import { PrismaClient } from '@prisma/client';
import { IResolvers } from 'apollo-server-express';

type Context = {
  prisma: PrismaClient;
};

export const resolvers: IResolvers<any, Context> = {
  Query: {
    users: (_parent, _args, context) => context.prisma.user.findMany(),
    user: (_parent, args, context) =>
      context.prisma.user.findUnique({ where: { id: Number(args.id) } }),

    credentials: (_parent, _args, context) => context.prisma.credential.findMany(),
    credential: (_parent, args, context) =>
      context.prisma.credential.findUnique({ where: { id: Number(args.id) } }),

    organizations: (_parent, _args, context) => context.prisma.organization.findMany(),
    organization: (_parent, args, context) =>
      context.prisma.organization.findUnique({ where: { id: Number(args.id) } }),

    jobs: (_parent, _args, context) => context.prisma.job.findMany(),
    job: (_parent, args, context) =>
      context.prisma.job.findUnique({ where: { id: Number(args.id) } }),
  },
  Mutation: {
    createUser: (_parent, args, context) =>
      context.prisma.user.create({
        data: {
          email: args.email,
          name: args.name,
          organizationId: args.organizationId ?? undefined,
        },
      }),

    updateUser: (_parent, args, context) =>
      context.prisma.user.update({
        where: { id: Number(args.id) },
        data: {
          email: args.email ?? undefined,
          name: args.name ?? undefined,
          organizationId: args.organizationId ?? undefined,
        },
      }),

    deleteUser: (_parent, args, context) =>
      context.prisma.user.delete({ where: { id: Number(args.id) } }),

    createCredential: (_parent, args, context) =>
      context.prisma.credential.create({
        data: {
          userId: args.userId,
          type: args.type,
          value: args.value,
        },
      }),

    updateCredential: (_parent, args, context) =>
      context.prisma.credential.update({
        where: { id: Number(args.id) },
        data: {
          type: args.type ?? undefined,
          value: args.value ?? undefined,
        },
      }),

    deleteCredential: (_parent, args, context) =>
      context.prisma.credential.delete({ where: { id: Number(args.id) } }),

    createOrganization: (_parent, args, context) =>
      context.prisma.organization.create({
        data: {
          name: args.name,
        },
      }),

    updateOrganization: (_parent, args, context) =>
      context.prisma.organization.update({
        where: { id: Number(args.id) },
        data: {
          name: args.name ?? undefined,
        },
      }),

    deleteOrganization: (_parent, args, context) =>
      context.prisma.organization.delete({ where: { id: Number(args.id) } }),

    createJob: (_parent, args, context) =>
      context.prisma.job.create({
        data: {
          title: args.title,
          description: args.description ?? undefined,
          organizationId: args.organizationId,
          userId: args.userId ?? undefined,
        },
      }),

    updateJob: (_parent, args, context) =>
      context.prisma.job.update({
        where: { id: Number(args.id) },
        data: {
          title: args.title ?? undefined,
          description: args.description ?? undefined,
          organizationId: args.organizationId ?? undefined,
          userId: args.userId ?? undefined,
        },
      }),

    deleteJob: (_parent, args, context) =>
      context.prisma.job.delete({ where: { id: Number(args.id) } }),
  },
  User: {
    organization: (parent, _args, context) =>
      parent.organizationId
        ? context.prisma.organization.findUnique({ where: { id: parent.organizationId } })
        : null,
    credentials: (parent, _args, context) =>
      context.prisma.credential.findMany({ where: { userId: parent.id } }),
    jobs: (parent, _args, context) =>
      context.prisma.job.findMany({ where: { userId: parent.id } }),
  },
  Credential: {
    user: (parent, _args, context) =>
      context.prisma.user.findUnique({ where: { id: parent.userId } }),
  },
  Organization: {
    users: (parent, _args, context) =>
      context.prisma.user.findMany({ where: { organizationId: parent.id } }),
    jobs: (parent, _args, context) =>
      context.prisma.job.findMany({ where: { organizationId: parent.id } }),
  },
  Job: {
    organization: (parent, _args, context) =>
      context.prisma.organization.findUnique({ where: { id: parent.organizationId } }),
    user: (parent, _args, context) =>
      parent.userId ? context.prisma.user.findUnique({ where: { id: parent.userId } }) : null,
  },
};
