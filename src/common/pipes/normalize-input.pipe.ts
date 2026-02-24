// src/common/pipes/normalize-input.pipe.ts

import { PipeTransform, Injectable } from '@nestjs/common';
import { normalizePersian } from '../utils/normalize-persian';

const SKIP_KEYS = [
  'password',
  'pass',
  'passwordhash',
  'token',
  'tokenhash',
  'accessToken',
  'refreshToken',
  'hash',
  'captcha',
  'codehash',
  'signature',
];

@Injectable()
export class NormalizeInputPipe implements PipeTransform {
  transform(value: unknown): unknown {
    return this.normalize(value);
  }

  private normalize(input: unknown): unknown {
    if (typeof input === 'string') {
      return normalizePersian(input);
    }

    if (Array.isArray(input)) {
      return input.map((item) => this.normalize(item));
    }

    if (input !== null && typeof input === 'object') {
      return Object.fromEntries(
          Object.entries(input).map(([key, value]) => {
            if (this.shouldSkip(key)) {
              return [key, value];
            }
            return [key, this.normalize(value)];
          }),
      );
    }

    return input;
  }

  private shouldSkip(key: string): boolean {
    return SKIP_KEYS.includes(key.toLowerCase());
  }
}
