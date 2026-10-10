import { createCrudService } from "../crud/crud.service.js";

export const productVariantService = createCrudService("productVariant", {
  path: "product-variants",
  publicRead: true,
  publicWhere: { isActive: true, product: { isActive: true } },
  variantOptions: true,
});
