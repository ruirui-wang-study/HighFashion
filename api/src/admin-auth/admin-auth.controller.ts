import { Body, Controller, Get, Post, Req, Res, UseGuards } from "@nestjs/common";
import type { AdminRoleName } from "@prisma/client";
import type { Request, Response } from "express";
import { ok } from "../common/api-response";
import { AdminAuthGuard } from "./admin-auth.guard";
import { AdminAuthService } from "./admin-auth.service";
import { AdminLoginDto } from "./dto/admin-login.dto";
import { adminSessionCookieName, createAdminSessionToken } from "./admin-session";

type RequestWithAdmin = Request & {
  adminSession?: {
    sub: string;
    role: AdminRoleName;
    email: string;
    name: string;
    exp: number;
  };
};

@Controller("admin/auth")
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Post("login")
  async login(@Body() body: AdminLoginDto, @Res({ passthrough: true }) response: Response) {
    const user = await this.adminAuthService.login(body.email, body.password);
    const token = createAdminSessionToken({
      sub: user.id,
      role: user.role.name,
      email: user.email,
      name: user.name,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 12,
    });

    response.cookie(adminSessionCookieName, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
      maxAge: 1000 * 60 * 60 * 12,
    });

    return ok({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role.name,
    });
  }

  @Post("logout")
  async logout(@Res({ passthrough: true }) response: Response) {
    response.cookie(adminSessionCookieName, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
      expires: new Date(0),
    });
    return ok({ success: true });
  }

  @Get("me")
  @UseGuards(AdminAuthGuard)
  async me(@Req() request: RequestWithAdmin) {
    const session = request.adminSession!;
    return ok({
      id: session.sub,
      email: session.email,
      name: session.name,
      role: session.role,
    });
  }
}
