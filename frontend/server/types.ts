export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export type PaginatedData<T> = {
  items: T[];
  pagination: Pagination;
};

export type ListParams = {
  page?: number;
  limit?: number;
};

export type ProductListParams = ListParams & {
  minPrice?: number;
  maxPrice?: number;
  categoryIds?: string[];
  subcategoryIds?: string[];
  minRating?: number;
  variantOptions?: Record<string, string[]>;
  status?: ProductStatus;
  collections?: string[];
  sort?: "newest" | "price_asc" | "price_desc";
};

export type ResolvedListParams = Required<ListParams>;

export const DEFAULT_LIST_PARAMS: ResolvedListParams = {
  page: 1,
  limit: 20,
};

export function normalizeListParams(
  params: ListParams = {},
): ResolvedListParams {
  const requestedPage = Number.isFinite(params.page)
    ? Math.trunc(params.page!)
    : 1;
  const requestedLimit = Number.isFinite(params.limit)
    ? Math.trunc(params.limit!)
    : 20;

  return {
    page: Math.max(1, requestedPage),
    limit: Math.min(100, Math.max(1, requestedLimit)),
  };
}

export type ProductStatus =
  | "IN_STOCK"
  | "OUT_OF_STOCK"
  | "UPCOMING"
  | "COMING_SOON";

export type VariantOption = { name: string; value: string; image?: string };

export type User = {
  id: string;
  email: string;
  name: string;
  provider: string;
  role: string;
  avatar: string | null;
  isRegistered: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Account = {
  id: string;
  vendorId: string;
  createdAt: string;
  updatedAt: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SubCategory = Category & { categoryId: string };

export type Product = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  baseImage: string | null;
  description: string | null;
  isActive: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  isFeatured: boolean;
  status: ProductStatus;
  averageRating: number;
  createdAt: string;
  updatedAt: string;
  variants?: ProductVariant[];
  categories?: Array<{
    id: string;
    categoryId: string;
    category: Pick<Category, "id" | "name" | "slug">;
  }>;
  subCategories?: Array<{
    id: string;
    subCategoryId: string;
    subCategory: Pick<SubCategory, "id" | "name" | "slug">;
  }>;
};

export type AdminProduct = Product & {
  variants: ProductVariant[];
  categories: NonNullable<Product["categories"]>;
  subCategories: NonNullable<Product["subCategories"]>;
};

export type AdminProductVariantInput = {
  id?: string;
  sku: string;
  price: string;
  compareAtPrice: string | null;
  images: string[];
  options: Array<{ name: string; value: string; image: string }>;
  isActive: boolean;
};

export type AdminProductInput = {
  name: string;
  slug: string;
  sku: string | null;
  baseImage: string | null;
  description: string | null;
  isActive: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  isFeatured: boolean;
  status: ProductStatus;
  categoryIds: string[];
  subcategoryIds: string[];
  variants: AdminProductVariantInput[];
};

export type ProductVariant = {
  id: string;
  productId: string;
  sku: string;
  price: string;
  compareAtPrice: string | null;
  images: string[];
  options: VariantOption[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProductCategory = {
  id: string;
  productId: string;
  categoryId: string;
};

export type ProductSubCategory = {
  id: string;
  productId: string;
  subCategoryId: string;
};

export type Review = {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string | null;
  images: string[];
  createdAt: string;
  updatedAt: string;
};

export type OrderStatus = string;

export type Order = {
  id: string;
  userId: string | null;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  zipCode: string | null;
  totalAmount: string;
  discountAmount: string;
  couponCode: string | null;
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus: string;
  transactionId: string | null;
  paymentDetails: unknown;
  divisionId: string;
  createdAt: string;
  updatedAt: string;
};

export type OrderItem = {
  id: string;
  orderId: string;
  productId: string;
  variantId: string;
  quantity: number;
  price: string;
  variantSnapshot: unknown;
  createdAt: string;
  updatedAt: string;
};

export type AdminOrderDetails = Order & {
  division: Pick<Division, "id" | "name" | "deliveryCharge">;
  items: Array<
    OrderItem & {
      product: Pick<Product, "id" | "name" | "slug" | "baseImage">;
      variant: Pick<
        ProductVariant,
        | "id"
        | "sku"
        | "price"
        | "compareAtPrice"
        | "images"
        | "options"
        | "isActive"
      >;
    }
  >;
};

export type Division = {
  id: string;
  name: string;
  deliveryCharge: string;
  createdAt: string;
  updatedAt: string;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  isRead: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type PlaceOrderInput = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  zipCode?: string;
  divisionId: string;
  items: Array<{ variantId: string; quantity: number }>;
};

export type TrackOrderInput =
  | { orderId: string; customerPhone?: never }
  | { customerPhone: string; orderId?: never };

export type OrderTracking = Pick<
  Order,
  "id" | "status" | "paymentStatus" | "totalAmount" | "createdAt" | "updatedAt"
> & {
  division: { name: string };
  items: Array<{ quantity: number; price: string; variantSnapshot: unknown }>;
};

export type DashboardStats = {
  totals: {
    users: number;
    products: number;
    categories: number;
    orders: number;
    pendingOrders: number;
  };
  revenue: { allTime: string | number; last30Days: string | number };
  orderStatusCounts: Array<{ status: string; count: number }>;
  productStatusCounts: Array<{ status: ProductStatus; count: number }>;
  unreadContactMessages: number;
  recentOrders: PaginatedData<
    Pick<
      Order,
      | "id"
      | "customerName"
      | "customerEmail"
      | "status"
      | "paymentStatus"
      | "totalAmount"
      | "createdAt"
    > & { _count: { items: number } }
  >;
};
