import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import { hashAdminPassword, verifyAdminPassword } from "./admin-password";

@Injectable()
export class AdminAuthService {
  constructor(private readonly prisma: PrismaService) {}

  async login(email: string, password: string) {
    const user = await this.prisma.adminUser.findUnique({
      where: { email: email.toLowerCase() },
      include: { role: true },
    });

    if (!user || !user.active || !verifyAdminPassword(password, user.passwordHash)) {
      throw new UnauthorizedException({ code: "INVALID_ADMIN_CREDENTIALS", message: "Invalid admin credentials" });
    }

    await this.prisma.adminUser.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: "admin.login",
        resource: "AdminUser",
        resourceId: user.id,
        details: { email: user.email },
      },
    });

    return user;
  }

  async getAdminUser(id: string) {
    return this.prisma.adminUser.findUnique({
      where: { id },
      include: { role: true },
    });
  }
}

export { hashAdminPassword };
