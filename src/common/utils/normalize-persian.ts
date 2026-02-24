// src/common/helpers/normalize-persian.ts

export function normalizePersian(input: unknown): unknown {
  if (typeof input === 'string') {
    return normalizeString(input);
  }

  if (Array.isArray(input)) {
    return input.map((item) => normalizePersian(item));
  }

  if (input !== null && typeof input === 'object') {
    return Object.fromEntries(
      Object.entries(input).map(([k, v]) => [k, normalizePersian(v)]),
    );
  }

  return input; // number, boolean, null remain unchanged
}

function normalizeString(str: string): string {
  return (
    str
      // Arabic → Persian letters
      .replace(/ي/g, 'ی')
      .replace(/ك/g, 'ک')
      // Persian & Arabic digits → English
      .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - '۰'.charCodeAt(0)))
      .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - '٠'.charCodeAt(0)))
      // Remove invisible/zero-width chars
      .replace(/[\u200c\u200f\u200b]/g, '')
      // Replace multiple spaces with a single space
      .replace(/\s+/g, ' ')
      .trim()
  );
}
