// src/common/helpers/search.ts

import { normalizePersian } from './normalize-persian';

export function normalizeSearch(term: string): string {
  return (normalizePersian(term) as string).toLowerCase();
}
