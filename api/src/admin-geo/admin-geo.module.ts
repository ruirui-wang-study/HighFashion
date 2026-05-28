import { Module } from "@nestjs/common";
import { AdminGeoController } from "./admin-geo.controller";
import { AdminGeoService } from "./admin-geo.service";

@Module({
  controllers: [AdminGeoController],
  providers: [AdminGeoService],
  exports: [AdminGeoService],
})
export class AdminGeoModule {}
