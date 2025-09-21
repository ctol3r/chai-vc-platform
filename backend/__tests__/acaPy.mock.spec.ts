const polkadotServiceMock = {
  authorizeIssuer: jest.fn(),
  deauthorizeIssuer: jest.fn(),
  issueCredential: jest.fn(),
  revokeCredential: jest.fn(),
};

jest.mock("../src/blockchain/polkadot_service", () => ({
  PolkadotService: jest.fn(() => polkadotServiceMock),
}));

import { issueStatusProof, verifyStatusProof } from "../src/blockchain/acaPy";
const { resolvers } = require("../src/graphql/resolvers");

describe("ACA-Py wrapper mocks", () => {
  it("returns mock proof when ACA-Py is unreachable", async () => {
    const proof = await issueStatusProof("0xhash");
    expect(proof.proofToken).toMatch(/^MOCK-PROOF-/);
    expect(proof.presentation).toBeDefined();
  });

  it("verifies mock presentation", async () => {
    const result = await verifyStatusProof('MOCK-PROOF-12345678');
    expect(result.ok).toBe(true);
  });
});

describe("Issuance + ACA-Py integration", () => {
  const context = {
    prisma: {
      credential: {
        update: jest.fn().mockResolvedValue({ id: 1, chainTxId: "0xabc", chainStatus: "FINALIZED" }),
      },
    },
    user: { roles: ["issuer"] },
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    context.prisma.credential.update.mockClear();
    polkadotServiceMock.issueCredential.mockResolvedValue({
      txHash: "0xabc",
      status: "FINALIZED",
    });
    polkadotServiceMock.revokeCredential.mockResolvedValue({
      txHash: "0xbeef",
      status: "IN_BLOCK",
    });
  });

  it("issueCredential returns proof token when requested", async () => {
    const result = await resolvers.Mutation.issueCredential(
      {},
      { id: 1, hash: "0xhash", shareStatusOnly: true },
      context
    );

    expect(result.proofToken).toBeDefined();
    expect(context.prisma.credential.update).toHaveBeenCalled();
    expect(polkadotServiceMock.issueCredential).toHaveBeenCalledWith("0xhash");
  });

  it("verifyProof mutation returns verification result", async () => {
    const verifySpy = jest.spyOn(require("../src/blockchain/acaPy"), "verifyStatusProof").mockResolvedValue({
      ok: true,
    });

    const result = await resolvers.Mutation.verifyProof({}, { presentationToken: 'MOCK-PROOF-12345678' });
    expect(verifySpy).toHaveBeenCalled();
    expect(result.valid).toBe(true);
  });

  it("revokeCredential updates chain metadata", async () => {
    const result = await resolvers.Mutation.revokeCredential(
      {},
      { id: "2", hash: "0xfeed", reason: "Expired" },
      context
    );

    expect(polkadotServiceMock.revokeCredential).toHaveBeenCalledWith("0xfeed", "Expired");
    expect(context.prisma.credential.update).toHaveBeenCalled();
    expect(result).toEqual({ id: 1, chainTxId: "0xabc", chainStatus: "FINALIZED" });
  });
});
