import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import { mapProduct } from "../products/products.service";

@Injectable()
export class CollectionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.collection.findMany({ orderBy: { sortOrder: "asc" } });
  }

  async findProducts(slug: string) {
    const collection = await this.prisma.collection.findUnique({
      where: { slug },
      include: {
        products: {
          orderBy: { sortOrder: "asc" },
          include: {
            product: {
              include: {
                images: { orderBy: { sortOrder: "asc" } },
                variants: { orderBy: [{ color: "asc" }, { size: "asc" }] },
              },
            },
          },
        },
      },
    });
    if (!collection) {
      throw new NotFoundException({ code: "COLLECTION_NOT_FOUND", message: "Collection not found" });
    }
    return {
      id: collection.id,
      title: collection.title,
      slug: collection.slug,
      description: collection.description,
      products: collection.products.map((entry) => mapProduct(entry.product)),
    };
  }
}
