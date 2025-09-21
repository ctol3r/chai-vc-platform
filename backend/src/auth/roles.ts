export type RequestContext = {
  user?: {
    roles?: string[];
  };
};

function hasRole(ctx: RequestContext, role: string) {
  return Boolean(ctx.user?.roles?.includes(role));
}

export function assertRole(ctx: RequestContext, role: string) {
  if (!hasRole(ctx, role)) {
    throw new Error(`Unauthorized: ${role} role required`);
  }
}

export function assertAdmin(ctx: RequestContext) {
  assertRole(ctx, 'admin');
}

export function assertIssuer(ctx: RequestContext) {
  assertRole(ctx, 'issuer');
}
