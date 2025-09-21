import { assertAdmin, assertIssuer, assertRole } from "../src/auth/roles";

describe("auth role helpers", () => {
  const ctx = (roles?: string[]) => ({ user: { roles } });

  it("allows required role", () => {
    expect(() => assertRole(ctx(["issuer"]), "issuer")).not.toThrow();
  });

  it("throws when role missing", () => {
    expect(() => assertRole(ctx(["issuer"]), "admin")).toThrow("Unauthorized");
  });

  it("assertIssuer succeeds with issuer role", () => {
    expect(() => assertIssuer(ctx(["issuer"])) ).not.toThrow();
  });

  it("assertAdmin rejects non-admin", () => {
    expect(() => assertAdmin(ctx(["issuer"])) ).toThrow("admin role required");
  });
});
