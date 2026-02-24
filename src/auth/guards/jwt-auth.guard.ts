// src/auth/guards/jwt-auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AUTH_STRATEGIES } from '../constants/auth-strategies.constants';

@Injectable()
export class JwtAuthGuard extends AuthGuard(AUTH_STRATEGIES.JWT) {}
