import "reflect-metadata";
import { Test } from "@nestjs/testing";
import { PATH_METADATA } from "@nestjs/common/constants";
import { ADMIN_ROLES_KEY } from "../admin-auth/admin-roles.decorator";
import { ProductResearchController } from "./product-research.controller";
import { ProductResearchService } from "./product-research.service";

describe("ProductResearchController", () => {
  async function createController() {
    const moduleRef = await Test.createTestingModule({
      controllers: [ProductResearchController],
      providers: [
        {
          provide: ProductResearchService,
          useValue: {},
        },
      ],
    }).compile();

    return moduleRef.get(ProductResearchController);
  }

  it("registers the expected admin product research route surface", async () => {
    const controller = await createController();
    const controllerPath = Reflect.getMetadata(PATH_METADATA, ProductResearchController);

    expect(controllerPath).toBe("admin/product-research");
    expect(Reflect.getMetadata(PATH_METADATA, controller.getDashboard)).toBe("dashboard");
    expect(Reflect.getMetadata(PATH_METADATA, controller.listCandidates)).toBe("candidates");
    expect(Reflect.getMetadata(PATH_METADATA, controller.previewAiImport)).toBe("import/ai/preview");
    expect(Reflect.getMetadata(PATH_METADATA, controller.commitAiImport)).toBe("import/ai/commit");
    expect(Reflect.getMetadata(PATH_METADATA, controller.activateScoringRule)).toBe("scoring-rules/:id/activate");
    expect(Reflect.getMetadata(PATH_METADATA, controller.convertToProductDraft)).toBe("candidates/:id/convert-to-product");
  });

  it("applies the expected role restrictions on critical mutations", async () => {
    const controller = await createController();

    expect(Reflect.getMetadata(ADMIN_ROLES_KEY, controller.commitAiImport)).toEqual(["OPERATOR"]);
    expect(Reflect.getMetadata(ADMIN_ROLES_KEY, controller.activateScoringRule)).toEqual(["ADMIN"]);
    expect(Reflect.getMetadata(ADMIN_ROLES_KEY, controller.convertToProductDraft)).toEqual(["ADMIN"]);
  });
});
