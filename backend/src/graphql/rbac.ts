export interface User {
  id: string;
  roles: string[];
}

export interface Context {
  user: User;
}

export function requireRole(role: string, context: Context): void {
  if (!context.user || !context.user.roles.includes(role)) {
    throw new Error(`Access denied: missing required role ${role}`);
  }
}
