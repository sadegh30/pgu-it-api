import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return `
      <a href="/docs">Swagger API Docs</a>
    `;
  }
}
