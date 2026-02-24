export const jwtConfig = {
  accessSecret: process.env.JWT_ACCESS_SECRET || 'super-secret-access',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'super-secret-refresh',

  accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m', // string ok
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  accessCookieMaxAge: parseInt(
    process.env.JWT_ACCESS_COOKIE_MAX_AGE || '900000', // 15min in ms
    10,
  ),
  refreshCookieMaxAge: parseInt(
    process.env.JWT_REFRESH_COOKIE_MAX_AGE || '604800000', // 7d in ms
    10,
  ),
};
