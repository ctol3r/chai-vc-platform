import {
  AuthorizationError,
  assertAdmin,
  assertIssuer,
  assertRole,
} from "../src/middleware/auth";

const futureTimestamp = () => Date.now() + 60_000;

describe("middleware/auth role assertions", () => {
  const baseContext = {
    user: {
      id: "user-123",
      roles: ["issuer", "admin"],
      session: {
        id: "session-abc",
        expiresAt: futureTimestamp(),
        sealed: true,
      },
    },
  };

  it("allows matching role and healthy session", () => {
    expect(() => assertRole({ ...baseContext }, "issuer")).not.toThrow();
  });

  it("matches roles case-insensitively", () => {
    const ctx = {
      user: {
        ...baseContext.user,
        roles: ["IsSuEr"],
      },
    };

    expect(() => assertIssuer(ctx)).not.toThrow();
  });

  it("throws when role missing", () => {
    const ctx = {
      user: {
        ...baseContext.user,
        roles: ["viewer"],
      },
    };

    expect(() => assertAdmin(ctx)).toThrow(AuthorizationError);
  });

  it("throws when no authenticated user", () => {
    expect(() => assertRole({}, "issuer")).toThrow("no authenticated user");
  });

  it("rejects tampered session vault metadata", () => {
    const ctx = {
      user: {
        ...baseContext.user,
        session: {
          id: "session-abc",
          sealed: false,
          expiresAt: futureTimestamp(),
        },
      },
    };

    expect(() => assertIssuer(ctx)).toThrow("vault integrity");
  });

  it("rejects expired sessions", () => {
    const ctx = {
      user: {
        ...baseContext.user,
        session: {
          id: "session-abc",
          expiresAt: Date.now() - 1000,
          sealed: true,
        },
      },
    };

    expect(() => assertIssuer(ctx)).toThrow("session expired");
  });
});
