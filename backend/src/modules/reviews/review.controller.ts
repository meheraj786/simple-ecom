import type { RequestHandler } from "express";
import { errorResponse, successResponse } from "../../utils/apiResponse.js";
import { createCrudController } from "../crud/crud.controller.js";
import {
  reviewCrudService,
  createReview,
  deleteReview,
  updateReview,
} from "./review.service.js";

export const reviewCrudController = createCrudController(
  reviewCrudService,
  "reviews",
);

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
}

export const createReviewController: RequestHandler = async (
  request,
  response,
) => {
  const { productId, rating, comment, images } = request.body ?? {};
  const userId = response.locals.auth?.userId;
  if (
    !userId ||
    typeof productId !== "string" ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5 ||
    (comment !== undefined && typeof comment !== "string") ||
    (images !== undefined && !isStringArray(images))
  ) {
    errorResponse(
      response,
      400,
      "A productId, rating from 1 to 5, and optional comment/images are required",
    );
    return;
  }

  const review = await createReview(userId, {
    productId,
    rating,
    ...(comment === undefined ? {} : { comment }),
    ...(images === undefined ? {} : { images }),
  });
  successResponse(response, "Review created", review, 201);
};

export const updateReviewController: RequestHandler = async (
  request,
  response,
) => {
  const id = request.params.id;
  const userId = response.locals.auth?.userId;
  const role = response.locals.auth?.role;
  const { rating, comment, images } = request.body ?? {};

  if (
    typeof id !== "string" ||
    !userId ||
    !role ||
    (rating !== undefined &&
      (!Number.isInteger(rating) || rating < 1 || rating > 5)) ||
    (comment !== undefined && typeof comment !== "string") ||
    (images !== undefined && !isStringArray(images))
  ) {
    errorResponse(
      response,
      400,
      "Review updates may include rating (1-5), comment, or images",
    );
    return;
  }

  const review = await updateReview(id, userId, role, {
    ...(rating === undefined ? {} : { rating }),
    ...(comment === undefined ? {} : { comment }),
    ...(images === undefined ? {} : { images }),
  });
  successResponse(response, "Review updated", review);
};

export const deleteReviewController: RequestHandler = async (
  request,
  response,
) => {
  const id = request.params.id;
  const userId = response.locals.auth?.userId;
  const role = response.locals.auth?.role;
  if (typeof id !== "string" || !userId || !role) {
    errorResponse(response, 400, "A valid review id is required");
    return;
  }

  await deleteReview(id, userId, role);
  successResponse(response, "Review deleted");
};
