import { Mutation } from "../src/graphql/resolvers/trustRegistry";

// shallow mock for api and signer helpers if your resolver imports them directly:
jest.mock("../src/blockchain/api", () => ({
  getPolkadotApi: async () => ({
    tx: { credentialPallet: {
      authorizeIssuer: () => ({ signAndSend: (_s:any, cb:any)=>cb({ status:{ isInBlock:true } }) }),
      deauthorizeIssuer: () => ({ signAndSend: (_s:any, cb:any)=>cb({ status:{ isInBlock:true } }) }),
    } }
  }),
  getSigner: async () => ({})
}));

describe("trust registry resolvers", () => {
  const mockAdminContext = { user: { roles: ["admin"] } };

  it("authorizeIssuer returns true", async () => {
    const ok = await Mutation.authorizeIssuer({}, { account: "5F..." }, mockAdminContext);
    expect(ok).toBe(true);
  });
  it("deauthorizeIssuer returns true", async () => {
    const ok = await Mutation.deauthorizeIssuer({}, { account: "5F..." }, mockAdminContext);
    expect(ok).toBe(true);
  });
});
