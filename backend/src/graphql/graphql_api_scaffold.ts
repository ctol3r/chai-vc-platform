import { JobSwapController, JobSwap } from '../controllers/job_swap_controller';

const jobSwapController = new JobSwapController();

export const resolvers = {
  Query: {
    jobSwaps: (): JobSwap[] => (jobSwapController as any).swaps,
  },
  Mutation: {
    createJobSwap: (_: any, { requesterId, recipientId, stake }: any): JobSwap => {
      return jobSwapController.createSwap(requesterId, recipientId, stake);
    },
    approveJobSwap: (_: any, { id }: any): JobSwap | undefined => {
      return jobSwapController.approveSwap(id);
    },
    finalizeJobSwap: (_: any, { id }: any): JobSwap | undefined => {
      return jobSwapController.finalizeSwap(id);
    }
  }
};

export const typeDefs = `
  type JobSwap {
    id: ID!
    requesterId: String!
    recipientId: String!
    stake: Int!
    status: String!
  }

  type Query {
    jobSwaps: [JobSwap!]!
  }

  type Mutation {
    createJobSwap(requesterId: String!, recipientId: String!, stake: Int!): JobSwap!
    approveJobSwap(id: ID!): JobSwap
    finalizeJobSwap(id: ID!): JobSwap
  }
`;
