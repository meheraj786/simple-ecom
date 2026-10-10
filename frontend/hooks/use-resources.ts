"use client";

import {
  accountsApi,
  categoriesApi,
  contactMessagesApi,
  divisionsApi,
  orderItemsApi,
  ordersApi,
  productCategoriesApi,
  productSubcategoriesApi,
  productVariantsApi,
  productsApi,
  reviewsApi,
  subcategoriesApi,
  usersApi,
} from "@/server/resources";
import type {
  Account,
  Category,
  ContactMessage,
  Division,
  ListParams,
  Order,
  OrderItem,
  Product,
  ProductCategory,
  ProductSubCategory,
  ProductVariant,
  Review,
  SubCategory,
  User,
} from "@/server/types";
import { useCrudDetail, useCrudList, useCrudMutations } from "./use-crud";

export function useUsers(params?: ListParams) {
  return useCrudList<User>(["users"], usersApi, params);
}
export function useUser(id: string | undefined) {
  return useCrudDetail<User>(["users"], usersApi, id);
}
export function useUserMutations() {
  return useCrudMutations<User>(["users"], usersApi);
}

export function useAccounts(params?: ListParams) {
  return useCrudList<Account>(["accounts"], accountsApi, params);
}
export function useAccount(id: string | undefined) {
  return useCrudDetail<Account>(["accounts"], accountsApi, id);
}
export function useAccountMutations() {
  return useCrudMutations<Account>(["accounts"], accountsApi);
}

export function useCategories(params?: ListParams) {
  return useCrudList<Category>(["categories"], categoriesApi, params);
}
export function useCategory(id: string | undefined) {
  return useCrudDetail<Category>(["categories"], categoriesApi, id);
}
export function useCategoryMutations() {
  return useCrudMutations<Category>(["categories"], categoriesApi);
}

export function useSubcategories(params?: ListParams) {
  return useCrudList<SubCategory>(["subcategories"], subcategoriesApi, params);
}
export function useSubcategory(id: string | undefined) {
  return useCrudDetail<SubCategory>(["subcategories"], subcategoriesApi, id);
}
export function useSubcategoryMutations() {
  return useCrudMutations<SubCategory>(["subcategories"], subcategoriesApi);
}

export function useProducts(params?: ListParams) {
  return useCrudList<Product>(["products"], productsApi, params);
}
export function useProduct(id: string | undefined) {
  return useCrudDetail<Product>(["products"], productsApi, id);
}
export function useProductMutations() {
  return useCrudMutations<Product>(["products"], productsApi);
}

export function useProductVariants(params?: ListParams) {
  return useCrudList<ProductVariant>(
    ["product-variants"],
    productVariantsApi,
    params,
  );
}
export function useProductVariant(id: string | undefined) {
  return useCrudDetail<ProductVariant>(
    ["product-variants"],
    productVariantsApi,
    id,
  );
}
export function useProductVariantMutations() {
  return useCrudMutations<ProductVariant>(
    ["product-variants"],
    productVariantsApi,
  );
}

export function useProductCategories(params?: ListParams) {
  return useCrudList<ProductCategory>(
    ["product-categories"],
    productCategoriesApi,
    params,
  );
}
export function useProductCategory(id: string | undefined) {
  return useCrudDetail<ProductCategory>(
    ["product-categories"],
    productCategoriesApi,
    id,
  );
}
export function useProductCategoryMutations() {
  return useCrudMutations<ProductCategory>(
    ["product-categories"],
    productCategoriesApi,
  );
}

export function useProductSubcategories(params?: ListParams) {
  return useCrudList<ProductSubCategory>(
    ["product-subcategories"],
    productSubcategoriesApi,
    params,
  );
}
export function useProductSubcategory(id: string | undefined) {
  return useCrudDetail<ProductSubCategory>(
    ["product-subcategories"],
    productSubcategoriesApi,
    id,
  );
}
export function useProductSubcategoryMutations() {
  return useCrudMutations<ProductSubCategory>(
    ["product-subcategories"],
    productSubcategoriesApi,
  );
}

export function useReviews(params?: ListParams) {
  return useCrudList<Review>(["reviews"], reviewsApi, params);
}
export function useReview(id: string | undefined) {
  return useCrudDetail<Review>(["reviews"], reviewsApi, id);
}
export function useReviewMutations() {
  return useCrudMutations<Review>(["reviews"], reviewsApi);
}

export function useOrders(params?: ListParams) {
  return useCrudList<Order>(["orders"], ordersApi, params);
}
export function useOrder(id: string | undefined) {
  return useCrudDetail<Order>(["orders"], ordersApi, id);
}
export function useOrderMutations() {
  const { update, replace, remove } = useCrudMutations<Order>(
    ["orders"],
    ordersApi,
  );
  return { update, replace, remove };
}

export function useOrderItems(params?: ListParams) {
  return useCrudList<OrderItem>(["order-items"], orderItemsApi, params);
}
export function useOrderItem(id: string | undefined) {
  return useCrudDetail<OrderItem>(["order-items"], orderItemsApi, id);
}
export function useOrderItemMutations() {
  return useCrudMutations<OrderItem>(["order-items"], orderItemsApi);
}

export function useDivisions(params?: ListParams) {
  return useCrudList<Division>(["divisions"], divisionsApi, params);
}
export function useDivision(id: string | undefined) {
  return useCrudDetail<Division>(["divisions"], divisionsApi, id);
}
export function useDivisionMutations() {
  return useCrudMutations<Division>(["divisions"], divisionsApi);
}

export function useContactMessages(params?: ListParams) {
  return useCrudList<ContactMessage>(
    ["contact-messages"],
    contactMessagesApi,
    params,
  );
}
export function useContactMessage(id: string | undefined) {
  return useCrudDetail<ContactMessage>(
    ["contact-messages"],
    contactMessagesApi,
    id,
  );
}
export function useContactMessageMutations() {
  const { update, replace, remove } = useCrudMutations<ContactMessage>(
    ["contact-messages"],
    contactMessagesApi,
  );
  return { update, replace, remove };
}
