"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Eye, LoaderCircle, Star, Trash2 } from "lucide-react";

import {
  ServerDataTable,
  type ServerDataTableColumn,
} from "@/components/data-table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useReviewMutations, useReviews } from "@/hooks/use-resources";
import type { Review } from "@/server/types";

function getErrorMessage(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "data" in error.response &&
    typeof error.response.data === "object" &&
    error.response.data !== null &&
    "message" in error.response.data &&
    typeof error.response.data.message === "string"
  ) {
    return error.response.data.message;
  }
  return error instanceof Error ? error.message : "Something went wrong";
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "-"
    : new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
}

export default function ReviewPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Review | null>(null);

  const reviewsQuery = useReviews({ page, limit });
  const { remove } = useReviewMutations();
  const reviews = reviewsQuery.data?.items ?? [];
  const pagination = {
    page,
    limit,
    total: reviewsQuery.data?.pagination.total ?? 0,
    pages: reviewsQuery.data?.pagination.pages ?? 0,
  };

  const columns: ServerDataTableColumn<Review>[] = [
    {
      id: "reviewer",
      header: "Reviewer",
      cell: (review) => (
        <div className="min-w-32">
          <p className="font-medium">{review.userName}</p>
          <p className="text-xs text-muted-foreground">{review.userId}</p>
        </div>
      ),
    },
    {
      id: "product",
      header: "Product ID",
      cell: (review) => (
        <span
          className="block max-w-40 truncate text-muted-foreground"
          title={review.productId}
        >
          {review.productId}
        </span>
      ),
    },
    {
      id: "rating",
      header: "Rating",
      cell: (review) => (
        <span className="inline-flex items-center gap-1 font-medium">
          <Star className="size-3.5 fill-amber-400 text-amber-500" />
          {review.rating}/5
        </span>
      ),
    },
    {
      id: "comment",
      header: "Review",
      cell: (review) => (
        <span
          className="block max-w-72 truncate text-muted-foreground"
          title={review.comment ?? undefined}
        >
          {review.comment || "No written comment"}
        </span>
      ),
    },
    {
      id: "created",
      header: "Submitted",
      cell: (review) => formatDate(review.createdAt),
    },
    {
      id: "actions",
      header: <span className="sr-only">Actions</span>,
      className: "w-24 text-right",
      cell: (review) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Read review by ${review.userName}`}
            onClick={() => setSelectedReview(review)}
          >
            <Eye />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-destructive hover:text-destructive"
            aria-label={`Delete review by ${review.userName}`}
            onClick={() => setDeleteTarget(review)}
          >
            <Trash2 />
          </Button>
        </div>
      ),
    },
  ];

  async function deleteReview() {
    if (!deleteTarget) return;
    try {
      await remove.mutateAsync(deleteTarget.id);
      if (reviews.length === 1 && page > 1)
        setPage((currentPage) => currentPage - 1);
      setDeleteTarget(null);
      toast.success("Review deleted");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <main className="flex flex-col gap-6 p-4 lg:p-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Reviews</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Read customer feedback and remove reviews when necessary.
        </p>
      </header>

      <div>
        <h2 className="font-medium">Customer reviews</h2>
        <p className="text-sm text-muted-foreground">
          {pagination.total} total reviews
        </p>
      </div>

      {reviewsQuery.isError && (
        <p role="alert" className="text-sm text-destructive">
          {getErrorMessage(reviewsQuery.error)}
        </p>
      )}

      <ServerDataTable
        data={reviews}
        columns={columns}
        pagination={pagination}
        loading={reviewsQuery.isLoading}
        onPageChange={setPage}
        onPageSizeChange={(nextLimit) => {
          setLimit(nextLimit);
          setPage(1);
        }}
        emptyMessage="No reviews found."
      />

      <Dialog
        open={selectedReview !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedReview(null);
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Customer review</DialogTitle>
            <DialogDescription>
              Submitted{" "}
              {selectedReview ? formatDate(selectedReview.createdAt) : ""}
            </DialogDescription>
          </DialogHeader>
          {selectedReview && (
            <div className="grid gap-5 text-sm">
              <dl className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-1">
                  <dt className="text-xs text-muted-foreground">Reviewer</dt>
                  <dd className="font-medium">{selectedReview.userName}</dd>
                </div>
                <div className="grid gap-1">
                  <dt className="text-xs text-muted-foreground">Rating</dt>
                  <dd className="inline-flex items-center gap-1 font-medium">
                    <Star className="size-3.5 fill-amber-400 text-amber-500" />
                    {selectedReview.rating} / 5
                  </dd>
                </div>
                <div className="grid gap-1 sm:col-span-2">
                  <dt className="text-xs text-muted-foreground">Product ID</dt>
                  <dd className="break-all">{selectedReview.productId}</dd>
                </div>
              </dl>
              <div className="grid gap-2">
                <h3 className="text-xs font-medium text-muted-foreground">
                  Comment
                </h3>
                <p className="max-h-72 overflow-y-auto whitespace-pre-wrap wrap-break-word rounded-md border bg-muted/30 p-3 leading-6">
                  {selectedReview.comment ||
                    "No written comment was submitted."}
                </p>
              </div>
              {selectedReview.images.length > 0 && (
                <div className="grid gap-2">
                  <h3 className="text-xs font-medium text-muted-foreground">
                    Attached images
                  </h3>
                  <ul className="grid gap-2">
                    {selectedReview.images.map((image, index) => (
                      <li key={`${image}-${index}`} className="min-w-0">
                        <a
                          href={image}
                          target="_blank"
                          rel="noreferrer"
                          className="block truncate text-primary underline underline-offset-4"
                        >
                          Image {index + 1}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Close
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete review?</DialogTitle>
            <DialogDescription>
              The review by {deleteTarget?.userName} will be permanently
              deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose
              render={
                <Button
                  type="button"
                  variant="outline"
                  disabled={remove.isPending}
                />
              }
            >
              Cancel
            </DialogClose>
            <Button
              variant="destructive"
              onClick={deleteReview}
              disabled={remove.isPending}
            >
              {remove.isPending && <LoaderCircle className="animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
