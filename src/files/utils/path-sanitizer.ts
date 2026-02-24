// utils/path-sanitizer.ts
const ALLOWED_BASE_PATHS = [
  'products',
  'avatars',
  'users',
  'blogs',
  'orders',
  'settings',
  'banners',
];

export const sanitizeAndValidatePath = (path: string): string => {
  if (!path) return 'general';

  const cleanPath = path.replace(/[^a-zA-Z0-9_\\/-]/g, '');

  const normalized = cleanPath
    .split('/')
    .filter((segment) => segment !== '..' && segment !== '.')
    .join('/');

  const startsWithAllowed = ALLOWED_BASE_PATHS.some(
    (base) => normalized === base || normalized.startsWith(base + '/'),
  );

  return startsWithAllowed ? normalized : 'general';
};
