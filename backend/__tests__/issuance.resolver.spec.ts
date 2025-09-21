import { resolvers } from "../src/graphql/resolvers";

type ChainTxResult = { txHash: string; status: "IN_BLOCK" | "FINALIZED" };

var issueMock: jest.Mock<Promise<ChainTxResult>, any>;
var revokeMock: jest.Mock<Promise<ChainTxResult>, any>;

jest.mock("../src/blockchain/polkadot_service", () => {
  issueMock = jest.fn();
  revokeMock = jest.fn();
  return {
    PolkadotService: jest.fn().mockImplementation(() => ({
      authorizeIssuer: jest.fn(),
      deauthorizeIssuer: jest.fn(),
      issueCredential: issueMock,
      revokeCredential: revokeMock,
    })),
  };
});

const buildContext = (roles: string[] = ["issuer"]) => {
  const update = jest.fn();
  return {
    prisma: {
      credential: {
        update,
      },
    },
    user: { roles },
  } as any;
};

const requireMocks = () => {
  if (!issueMock || !revokeMock) {
    throw new Error("Mocks not initialised");
  }
  return { issueMock: issueMock as jest.Mock<Promise<ChainTxResult>, any>, revokeMock: revokeMock as jest.Mock<Promise<ChainTxResult>, any> };
};

describe("issuance resolvers", () => {
  beforeEach(() => {
    const { issueMock: issue, revokeMock: revoke } = requireMocks();
    issue.mockReset();
    revoke.mockReset();
  });

  it("issues credential and stores chain metadata", async () => {
    const { issueMock: issue } = requireMocks();
    issue.mockResolvedValue({ txHash: "0xabc", status: "FINALIZED" });
    const context = buildContext();
    context.prisma.credential.update.mockResolvedValue({ id: 1, chainTxId: "0xabc", chainStatus: "FINALIZED" });

    const result = await resolvers.Mutation.issueCredential(
      {},
      { id: 1, hash: "0xdead" },
      context
    );

    expect(issue).toHaveBeenCalledWith("0xdead");
    expect(context.prisma.credential.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { chainTxId: "0xabc", chainStatus: "FINALIZED" },
    });
    expect(result).toEqual({ id: 1, chainTxId: "0xabc", chainStatus: "FINALIZED" });
  });

  it("revokes credential and updates chain status", async () => {
    const { revokeMock: revoke } = requireMocks();
    revoke.mockResolvedValue({ txHash: "0xbeef", status: "IN_BLOCK" });
    const context = buildContext();
    context.prisma.credential.update.mockResolvedValue({ id: 2, chainTxId: "0xbeef", chainStatus: "IN_BLOCK" });

    const result = await resolvers.Mutation.revokeCredential(
      {},
      { id: "2", hash: "0xfeed", reason: "Expired" },
      context
    );

    expect(revoke).toHaveBeenCalledWith("0xfeed", "Expired");
    expect(context.prisma.credential.update).toHaveBeenCalledWith({
      where: { id: 2 },
      data: { chainTxId: "0xbeef", chainStatus: "IN_BLOCK" },
    });
    expect(result).toEqual({ id: 2, chainTxId: "0xbeef", chainStatus: "IN_BLOCK" });
  });

  it("rejects issuance without issuer role", async () => {
    const context = buildContext(["admin"]);
    await expect(
      resolvers.Mutation.issueCredential({}, { id: 1, hash: "0xhash" }, context)
    ).rejects.toThrow("issuer role required");
  });
});
