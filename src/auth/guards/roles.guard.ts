import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { Role } from 'src/common/enums/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

interface AuthenticatedUser {
  id: string;
  role: Role;
  email?: string | null;
  phone?: string | null;
  isActive?: boolean;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as AuthenticatedUser | undefined;
    if (!user) {
      throw new ForbiddenException('دسترسی غیرمجاز.');
    }
    if (user.role === Role.ADMIN) {
      return true;
    }
    if (!user.isActive) {
      throw new ForbiddenException('حساب کاربری غیرفعال است.');
    }
    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('شما دسترسی لازم را ندارید.');
    }

    return true;
  }
}
