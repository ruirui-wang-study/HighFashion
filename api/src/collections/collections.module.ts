import { Module } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import { CollectionsController } from "./collections.controller";
import { CollectionsService } from "./collections.service";

@Module({
  controllers: [CollectionsController],
  providers: [CollectionsService, PrismaService],
})
export class CollectionsModule {}
