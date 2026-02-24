import { User, UserProfile } from '@prisma/client';

export type SafeUser = Omit<User, 'passwordHash'> & {
  userProfile?: UserProfile | null;
};

/**
 * Removes sensitive fields like passwordHash and returns a safe user object
 */

export function sanitizeUser(
  user:
    | (User & {
        userProfile?: UserProfile | null;
      })
    | null,
): SafeUser | null {
  if (!user) return null;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash: _passwordHash, ...safeUser } = user;

  return {
    ...safeUser,
  };
}
