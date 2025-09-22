export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthorizationError";
  }
}

export interface SessionMetadata {
  id: string;
  expiresAt?: string | number | Date;
  revoked?: boolean;
  sealed?: boolean;
}

export interface AuthenticatedUser {
  id?: string;
  roles?: string[];
  session?: SessionMetadata;
}

export interface AuthorizationContext {
  user?: AuthenticatedUser | null;
}

const normalizeRole = (role: string) => role.trim().toLowerCase();

const parseExpiration = (expires?: string | number | Date) => {
  if (!expires) {
    return undefined;
  }

  if (expires instanceof Date) {
    return expires.getTime();
  }

  if (typeof expires === "number") {
    return Number.isFinite(expires) ? expires : undefined;
  }

  const timestamp = Date.parse(expires);
  return Number.isNaN(timestamp) ? undefined : timestamp;
};

const ensureActiveSession = (session?: SessionMetadata) => {
  if (!session) {
    return;
  }

  if (!session.id) {
    throw new AuthorizationError("Unauthorized: session vault token missing identifier");
  }

  if (session.sealed === false) {
    throw new AuthorizationError("Unauthorized: session vault integrity check failed");
  }

  if (session.revoked) {
    throw new AuthorizationError("Unauthorized: session revoked");
  }

  const expiresAt = parseExpiration(session.expiresAt);
  if (expiresAt && expiresAt <= Date.now()) {
    throw new AuthorizationError("Unauthorized: session expired");
  }
};

const ensureUser = (ctx: AuthorizationContext) => {
  if (!ctx || !ctx.user) {
    throw new AuthorizationError("Unauthorized: no authenticated user in context");
  }

  ensureActiveSession(ctx.user.session);

  if (!Array.isArray(ctx.user.roles) || ctx.user.roles.length === 0) {
    throw new AuthorizationError("Unauthorized: no roles assigned to user");
  }

  return ctx.user.roles;
};

export function assertRole<T extends AuthorizationContext>(
  ctx: T,
  role: string,
  customMessage?: string
): asserts ctx is T & { user: AuthenticatedUser & { roles: string[] } } {
  const roles = ensureUser(ctx).map(normalizeRole);
  const target = normalizeRole(role);

  if (!roles.includes(target)) {
    throw new AuthorizationError(
      customMessage ?? `Unauthorized: ${role} role required`
    );
  }
}

export const assertIssuer = <T extends AuthorizationContext>(ctx: T) =>
  assertRole(ctx, "issuer", "Unauthorized: issuer role required");

export const assertAdmin = <T extends AuthorizationContext>(ctx: T) =>
  assertRole(ctx, "admin", "Unauthorized: admin role required");
