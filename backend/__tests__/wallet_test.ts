import { createSelectiveDisclosurePresentation } from "../src/wallet/selective_disclosure";

describe("selective disclosure", () => {
  it("keeps only requested attributes", () => {
    const credential = { id: "123", name: "Alice", age: 30, role: "nurse" };
    const presentation = createSelectiveDisclosurePresentation(credential, ["name", "role"]);
    expect(presentation.verifiableCredential).toEqual({ id: "123", name: "Alice", role: "nurse" });
  });
});
