import { createCrudApi } from "./crud-api";
import apiClient from "./api-client";
import type {
  Account,
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
} from "./types";

export const usersApi = createCrudApi<User>("users");
export const accountsApi = createCrudApi<Account>("accounts");
export const categoriesApi = createCrudApi<Category>("categories");
export const subcategoriesApi = createCrudApi<SubCategory>("subcategories");
export const productsApi = createCrudApi<Product>("products");
export const productVariantsApi =
  createCrudApi<ProductVariant>("product-variants");
export const productCategoriesApi =
  createCrudApi<ProductCategory>("product-categories");
export const productSubcategoriesApi = createCrudApi<ProductSubCategory>(
  "product-subcategories",
);
export const reviewsApi = createCrudApi<Review>("reviews");
export const ordersApi = createCrudApi<Order>("orders");
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
