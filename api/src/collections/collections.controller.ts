import { Controller, Get, Param } from "@nestjs/common";
import { ok } from "../common/api-response";
import { CollectionsService } from "./collections.service";

@Controller("collections")
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Get()
  async findAll() {
    return ok(await this.collectionsService.findAll());
  }

  @Get(":slug/products")
  async findProducts(@Param("slug") slug: string) {
    return ok(await this.collectionsService.findProducts(slug));
  }
}
