import { Module } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import { AdminGeoController } from "./admin-geo.controller";
import { AdminGeoService } from "./admin-geo.service";

@Module({
  controllers: [AdminGeoController],
  providers: [AdminGeoService, PrismaService],
  exports: [AdminGeoService],
})
export class AdminGeoModule {}
