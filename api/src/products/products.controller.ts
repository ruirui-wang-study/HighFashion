import { Controller, Get, Param, Query } from "@nestjs/common";
import { ok } from "../common/api-response";
import { ProductQueryDto } from "./dto/product-query.dto";
import { ProductsService } from "./products.service";

@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll(@Query() query: ProductQueryDto) {
    return ok(await this.productsService.findAll(query));
  }

  @Get(":slug")
  async findBySlug(@Param("slug") slug: string, @Query() query: ProductQueryDto) {
    return ok(await this.productsService.findBySlug(slug, query.locale));
  }
}
