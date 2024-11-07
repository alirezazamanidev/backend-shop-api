import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { RoleEnum } from '../enums/role.enum';
import { ROLES_KEY } from '../decorators/role.decorator';
import { Request } from 'express';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const requiredRoles = this.reflector.getAllAndOverride<RoleEnum[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) return true;

    const {admin} = context.switchToHttp().getRequest<Request>()?.session;
    if(!admin)  throw new ForbiddenException('access daind!'); 
    if (!requiredRoles.some((role) => admin?.role === role))
      throw new ForbiddenException('access daind!');
  }
}
