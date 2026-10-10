import { prisma } from "../../db.js";
import { createCrudService } from "../crud/crud.service.js";

export const reviewCrudService = createCrudService("review", {
  path: "reviews",
  publicRead: true,
});

export type ReviewMutation = {
  rating?: number;
  comment?: string | null;
  images?: string[];
};

export async function createReview(
  userId: string,
  input: {
    productId: string;
    rating: number;
    comment?: string;
    images?: string[];
  },
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw Object.assign(new Error("Authentication required"), { status: 401 });
  }

  return prisma.$transaction(async (transaction) => {
    const review = await transaction.review.create({
      data: {
        productId: input.productId,
        userId: user.id,
        userName: user.name,
        rating: input.rating,
        ...(input.comment === undefined ? {} : { comment: input.comment }),
        ...(input.images === undefined ? {} : { images: input.images }),
      },
    });
    const aggregate = await transaction.review.aggregate({
      where: { productId: input.productId },
      _avg: { rating: true },
    });
    await transaction.product.update({
      where: { id: input.productId },
      data: { averageRating: aggregate._avg.rating ?? 0 },
    });
    return review;
  });
}

export async function updateReview(
  id: string,
  userId: string,
  role: string,
  input: ReviewMutation,
) {
  const existing = await prisma.review.findUnique({ where: { id } });
  if (!existing) {
    throw Object.assign(new Error("Review not found"), { status: 404 });
  }
  if (role !== "ADMIN" && existing.userId !== userId) {
    throw Object.assign(new Error("You can only update your own review"), {
      status: 403,
    });
  }

  return prisma.$transaction(async (transaction) => {
    const review = await transaction.review.update({
      where: { id },
      data: input,
    });
    const aggregate = await transaction.review.aggregate({
      where: { productId: existing.productId },
      _avg: { rating: true },
    });
    await transaction.product.update({
      where: { id: existing.productId },
      data: { averageRating: aggregate._avg.rating ?? 0 },
    });
    return review;
  });
}

export async function deleteReview(
  id: string,
  userId: string,
  role: string,
): Promise<void> {
  const existing = await prisma.review.findUnique({ where: { id } });
  if (!existing) {
    throw Object.assign(new Error("Review not found"), { status: 404 });
  }
  if (role !== "ADMIN" && existing.userId !== userId) {
    throw Object.assign(new Error("You can only delete your own review"), {
      status: 403,
    });
  }

  await prisma.$transaction(async (transaction) => {
    await transaction.review.delete({ where: { id } });
    const aggregate = await transaction.review.aggregate({
      where: { productId: existing.productId },
      _avg: { rating: true },
    });
    await transaction.product.update({
      where: { id: existing.productId },
      data: { averageRating: aggregate._avg.rating ?? 0 },
    });
  });
}
