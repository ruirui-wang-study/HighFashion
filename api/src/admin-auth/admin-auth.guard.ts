import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";
import { ADMIN_ROLES_KEY } from "./admin-roles.decorator";
import { hasAdminRole } from "./admin-rbac";
import { parseCookie, verifyAdminSessionToken } from "./admin-session";

type RequestWithAdmin = Request & {
  adminSession?: ReturnType<typeof verifyAdminSessionToken>;
};

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<RequestWithAdmin>();
    const token = parseCookie(request.headers.cookie);
    const session = verifyAdminSessionToken(token);
    if (!session) {
      throw new UnauthorizedException({ code: "ADMIN_UNAUTHORIZED", message: "Admin login required" });
    }

    const roles = this.reflector.getAllAndOverride(ADMIN_ROLES_KEY, [context.getHandler(), context.getClass()]) as string[] | undefined;
    if (roles && roles.length > 0 && !hasAdminRole(roles as never, session.role)) {
      throw new ForbiddenException({ code: "ADMIN_FORBIDDEN", message: "Insufficient permissions" });
    }

    request.adminSession = session;
    return true;
  }
}
