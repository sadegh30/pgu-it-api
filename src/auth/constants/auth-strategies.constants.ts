// src/auth/constants/auth-strategies.constant.ts
export const AUTH_STRATEGIES = {
  JWT: 'jwt',
} as const;

export type AuthStrategy =
  (typeof AUTH_STRATEGIES)[keyof typeof AUTH_STRATEGIES];
