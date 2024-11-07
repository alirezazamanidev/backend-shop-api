import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { RoleEnum } from '../enums/role.enum';
import { RoleGuard } from '../guards/role.guard';

export const ROLES_KEY = 'roles';
const role = (...roles: RoleEnum[]) => SetMetadata(ROLES_KEY, roles);

export const Roles = (...roles: RoleEnum[]) => {
  return applyDecorators(role(...roles), UseGuards(RoleGuard));
};
