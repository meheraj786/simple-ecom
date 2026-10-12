import { createCrudApi } from "./crud-api";
import apiClient from "./api-client";
import { DEFAULT_LIST_PARAMS, normalizeListParams } from "./types";
import type {
  Account,
  AdminProduct,
  AdminProductInput,
  AdminOrderDetails,
  Category,
  ContactMessage,
  Division,
  Order,
  OrderItem,
  Product,
  ProductCategory,
  ProductSubCategory,
  ProductVariant,
  Review,
  SubCategory,
  User,
  ApiResponse,
  ListParams,
  PaginatedData,
  ProductListParams,
  TrackOrderInput,
  OrderTracking,
} from "./types";

export const usersApi = createCrudApi<User>("users");
export const accountsApi = createCrudApi<Account>("accounts");
export const categoriesApi = createCrudApi<Category>("categories");
export const subcategoriesApi = createCrudApi<SubCategory>("subcategories");
const productCrudApi = createCrudApi<Product>("products");
export const productsApi = {
  ...productCrudApi,
  async list(params: ProductListParams = DEFAULT_LIST_PARAMS) {
    const query = {
      ...normalizeListParams(params),
      ...(params.minPrice === undefined ? {} : { minPrice: params.minPrice }),
      ...(params.maxPrice === undefined ? {} : { maxPrice: params.maxPrice }),
      ...(params.minRating === undefined
        ? {}
        : { minRating: params.minRating }),
      ...(params.categoryIds?.length
        ? { categoryIds: params.categoryIds.join(",") }
        : {}),
      ...(params.subcategoryIds?.length
        ? { subcategoryIds: params.subcategoryIds.join(",") }
        : {}),
      ...(params.variantOptions
        ? { variantOptions: JSON.stringify(params.variantOptions) }
        : {}),
      ...(params.status ? { status: params.status } : {}),
      ...(params.collections?.length
        ? { collections: params.collections.join(",") }
        : {}),
    };
    const response = await apiClient.get<ApiResponse<PaginatedData<Product>>>(
      "/products",
      { params: query },
    );
    return response.data.data;
  },
};
export const adminProductsApi = {
  async list(params: ListParams = DEFAULT_LIST_PARAMS) {
    const response = await apiClient.get<
      ApiResponse<PaginatedData<AdminProduct>>
    >("/products/admin", { params: normalizeListParams(params) });
    return response.data.data;
  },
  async get(id: string) {
    const response = await apiClient.get<ApiResponse<AdminProduct>>(
      `/products/admin/${id}`,
    );
    return response.data.data;
  },
  async create(data: AdminProductInput) {
    const response = await apiClient.post<ApiResponse<AdminProduct>>(
      "/products/admin",
      data,
    );
    return response.data.data;
  },
  async update(id: string, data: AdminProductInput) {
    const response = await apiClient.patch<ApiResponse<AdminProduct>>(
      `/products/admin/${id}`,
      data,
    );
    return response.data.data;
  },
};
export const productVariantsApi =
  createCrudApi<ProductVariant>("product-variants");
export const productCategoriesApi =
  createCrudApi<ProductCategory>("product-categories");
export const productSubcategoriesApi = createCrudApi<ProductSubCategory>(
  "product-subcategories",
);
export const reviewsApi = createCrudApi<Review>("reviews");
export const ordersApi = createCrudApi<Order>("orders");
export const orderTrackingApi = {
  async find(input: TrackOrderInput) {
    const response = await apiClient.post<ApiResponse<OrderTracking[]>>(
      "/orders/track",
      input,
    );
    return response.data.data;
  },
};
export const adminOrderDetailsApi = {
  async get(id: string) {
    const response = await apiClient.get<ApiResponse<AdminOrderDetails>>(
      `/orders/${id}/details`,
    );
    return response.data.data;
  },
};
export const orderItemsApi = createCrudApi<OrderItem>("order-items");
export const divisionsApi = createCrudApi<Division>("divisions");
export const contactMessagesApi =
  createCrudApi<ContactMessage>("contact-messages");

export type ContactMessageSubmission = Pick<
  ContactMessage,
  "name" | "email" | "phone" | "subject" | "message"
>;

export async function submitContactMessage(input: ContactMessageSubmission) {
  const response = await apiClient.post<{
    success: boolean;
    message: string;
    data: { id: string };
  }>("/contact-messages", input);
  return response.data.data;
}
