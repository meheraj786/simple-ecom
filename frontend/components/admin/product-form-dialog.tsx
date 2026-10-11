"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Controller,
  useFieldArray,
  useForm,
  useFormState,
  useWatch,
} from "react-hook-form";
import type { Control, UseFormRegister } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { LoaderCircle, Plus, Trash2, X } from "lucide-react";

import type {
  AdminProduct,
  Category,
  ProductStatus,
  SubCategory,
} from "@/server/types";
import { uploadImageOrVideo } from "@/lib/cloudinary";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const mediaUrl = z
  .string()
  .trim()
  .refine((value) => {
    if (!value) return true;
    try {
      return ["http:", "https:"].includes(new URL(value).protocol);
    } catch {
      return false;
    }
  }, "Upload a valid image or video");

const optionSchema = z.object({
  name: z.string().trim().min(1, "Enter an option name").max(60),
  value: z.string().trim().min(1, "Enter an option value").max(100),
  image: mediaUrl,
});

const priceSchema = z
  .string()
  .trim()
  .regex(
    /^\d{1,10}(?:\.\d{1,2})?$/,
    "Use a non-negative amount with up to 2 decimals",
  );

const variantSchema = z
  .object({
    id: z.string().optional(),
    sku: z.string().trim().min(1, "Variant SKU is required").max(80),
    price: priceSchema,
    compareAtPrice: z.union([z.literal(""), priceSchema]),
    images: z.array(mediaUrl),
    options: z.array(optionSchema),
    isActive: z.boolean(),
  })
  .superRefine((variant, context) => {
    if (
      variant.compareAtPrice &&
      Number(variant.compareAtPrice) < Number(variant.price)
    ) {
      context.addIssue({
        code: "custom",
        path: ["compareAtPrice"],
        message: "Compare-at price must be at least the selling price",
      });
    }
  });

const productFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(120),
    slug: z
      .string()
      .trim()
      .min(2, "Slug is required")
      .max(160)
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Use lowercase letters, numbers, and hyphens",
      ),
    sku: z.string().trim().max(80),
    baseImage: mediaUrl,
    description: z.string().max(10000, "Description is too long"),
    isActive: z.boolean(),
    isNew: z.boolean(),
    isBestSeller: z.boolean(),
    isFeatured: z.boolean(),
    status: z.enum(["IN_STOCK", "OUT_OF_STOCK", "UPCOMING", "COMING_SOON"]),
    categoryIds: z.array(z.string()),
    subcategoryIds: z.array(z.string()),
    variants: z
      .array(variantSchema)
      .min(1, "Add at least one product variant")
      .max(100),
  })
  .superRefine((product, context) => {
    const seenSkus = new Set<string>();
    product.variants.forEach((variant, index) => {
      if (seenSkus.has(variant.sku)) {
        context.addIssue({
          code: "custom",
          path: ["variants", index, "sku"],
          message: "Variant SKUs must be unique",
        });
      }
      seenSkus.add(variant.sku);
    });
  });

export type ProductFormValues = z.infer<typeof productFormSchema>;

function emptyVariant() {
  return {
    sku: "",
    price: "",
    compareAtPrice: "",
    images: [] as string[],
    options: [] as Array<{ name: string; value: string; image: string }>,
    isActive: true,
  };
}

const emptyProduct: ProductFormValues = {
  name: "",
  slug: "",
  sku: "",
  baseImage: "",
  description: "",
  isActive: true,
  isNew: false,
  isBestSeller: false,
  isFeatured: false,
  status: "IN_STOCK",
  categoryIds: [],
  subcategoryIds: [],
  variants: [emptyVariant()],
};

function isVideoUrl(url: string) {
  try {
    const path = new URL(url).pathname.toLowerCase();
    return (
      path.includes("/video/upload/") || /\.(mp4|mov|webm|m4v)$/.test(path)
    );
  } catch {
    return false;
  }
}

function MediaPreview({ url, label }: { url: string; label: string }) {
  return (
    <div className="relative size-16 shrink-0 overflow-hidden rounded border bg-muted">
      {isVideoUrl(url) ? (
        <video
          src={url}
          className="size-full object-cover"
          aria-label={label}
        />
      ) : (
        <Image
          src={url}
          alt={label}
          fill
          sizes="64px"
          unoptimized
          className="object-cover"
        />
      )}
    </div>
  );
}

function OptionEditor({
  control,
  register,
  index,
  variantIndex,
  onUploadStateChange,
  onRemove,
  disabled,
}: {
  control: Control<ProductFormValues>;
  register: UseFormRegister<ProductFormValues>;
  index: number;
  variantIndex: number;
  onUploadStateChange: (uploading: boolean) => void;
  onRemove: () => void;
  disabled: boolean;
}) {
  const [uploading, setUploading] = useState(false);
  const { errors } = useFormState({ control });
  const optionErrors = errors.variants?.[variantIndex]?.options?.[index];
  const imageField = `variants.${variantIndex}.options.${index}.image` as const;

  async function uploadOptionImage(
    file: File | undefined,
    onChange: (url: string) => void,
  ) {
    if (!file) return;
    setUploading(true);
    onUploadStateChange(true);
    try {
      onChange(await uploadImageOrVideo(file, { folder: "products/options" }));
      toast.success("Option image uploaded");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Option image upload failed",
      );
    } finally {
      setUploading(false);
      onUploadStateChange(false);
    }
  }

  return (
    <div className="grid gap-2 rounded-md border p-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
      <div className="grid gap-1.5">
        <Label htmlFor={`option-name-${variantIndex}-${index}`}>
          Option name
        </Label>
        <Input
          id={`option-name-${variantIndex}-${index}`}
          placeholder="Color"
          aria-invalid={Boolean(optionErrors?.name)}
          {...register(`variants.${variantIndex}.options.${index}.name`)}
        />
        {optionErrors?.name?.message && (
          <p className="text-sm text-destructive">
            {optionErrors.name.message}
          </p>
        )}
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor={`option-value-${variantIndex}-${index}`}>Value</Label>
        <Input
          id={`option-value-${variantIndex}-${index}`}
          placeholder="Navy Blue"
          aria-invalid={Boolean(optionErrors?.value)}
          {...register(`variants.${variantIndex}.options.${index}.value`)}
        />
        {optionErrors?.value?.message && (
          <p className="text-sm text-destructive">
            {optionErrors.value.message}
          </p>
        )}
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor={`option-image-${variantIndex}-${index}`}>
          Option image/video
        </Label>
        <Controller
          name={imageField}
          control={control}
          render={({ field }) => (
            <div className="flex min-w-0 items-center gap-2">
              <Input
                id={`option-image-${variantIndex}-${index}`}
                type="file"
                accept="image/*,video/*"
                className="min-w-0"
                disabled={disabled || uploading}
                onChange={(event) =>
                  void uploadOptionImage(
                    event.currentTarget.files?.[0],
                    field.onChange,
                  )
                }
              />
              {field.value && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Remove option media"
                  disabled={disabled || uploading}
                  onClick={() => field.onChange("")}
                >
                  <X />
                </Button>
              )}
            </div>
          )}
        />
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="text-destructive"
        aria-label="Remove option"
        disabled={disabled || uploading}
        onClick={onRemove}
      >
        {uploading ? <LoaderCircle className="animate-spin" /> : <Trash2 />}
      </Button>
    </div>
  );
}

function VariantEditor({
  control,
  register,
  index,
  onUploadStateChange,
  onRemove,
  disabled,
}: {
  control: Control<ProductFormValues>;
  register: UseFormRegister<ProductFormValues>;
  index: number;
  onUploadStateChange: (uploading: boolean) => void;
  onRemove: () => void;
  disabled: boolean;
}) {
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const { errors } = useFormState({ control });
  const variantErrors = errors.variants?.[index];
  const optionsName =
    `variants.${index}.options` as `variants.${number}.options`;
  const { fields, append, remove } = useFieldArray({
    control,
    name: optionsName,
  });
  const variantImagePath = `variants.${index}.images` as const;

  async function uploadVariantImages(
    files: FileList | null,
    currentImages: string[],
    onChange: (images: string[]) => void,
  ) {
    if (!files?.length) return;
    if (currentImages.length + files.length > 10) {
      toast.error("A variant can have up to 10 media files");
      return;
    }
    setUploadingMedia(true);
    onUploadStateChange(true);
    try {
      const uploaded = await Promise.all(
        Array.from(files, (file) =>
          uploadImageOrVideo(file, { folder: "products/variants" }),
        ),
      );
      onChange([...currentImages, ...uploaded]);
      toast.success("Variant media uploaded");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Variant media upload failed",
      );
    } finally {
      setUploadingMedia(false);
      onUploadStateChange(false);
    }
  }

  return (
    <section className="grid gap-4 rounded-lg border p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-medium">Variant {index + 1}</h3>
        <div className="flex items-center gap-2">
          <Controller
            name={`variants.${index}.isActive`}
            control={control}
            render={({ field }) => (
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) =>
                    field.onChange(checked === true)
                  }
                  disabled={disabled || uploadingMedia}
                />
                Active
              </label>
            )}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-destructive"
            aria-label={`Remove variant ${index + 1}`}
            disabled={disabled || uploadingMedia}
            onClick={onRemove}
          >
            <Trash2 />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="grid gap-1.5">
          <Label htmlFor={`variant-sku-${index}`}>Variant SKU</Label>
          <Input
            id={`variant-sku-${index}`}
            aria-invalid={Boolean(variantErrors?.sku)}
            {...register(`variants.${index}.sku`)}
          />
          {variantErrors?.sku?.message && (
            <p className="text-sm text-destructive">
              {variantErrors.sku.message}
            </p>
          )}
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor={`variant-price-${index}`}>Price</Label>
          <Input
            id={`variant-price-${index}`}
            type="number"
            min="0"
            max="9999999999.99"
            step="0.01"
            inputMode="decimal"
            aria-invalid={Boolean(variantErrors?.price)}
            {...register(`variants.${index}.price`)}
          />
          {variantErrors?.price?.message && (
            <p className="text-sm text-destructive">
              {variantErrors.price.message}
            </p>
          )}
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor={`variant-compare-price-${index}`}>
            Compare-at price
          </Label>
          <Input
            id={`variant-compare-price-${index}`}
            type="number"
            min="0"
            max="9999999999.99"
            step="0.01"
            inputMode="decimal"
            aria-invalid={Boolean(variantErrors?.compareAtPrice)}
            {...register(`variants.${index}.compareAtPrice`)}
          />
          {variantErrors?.compareAtPrice?.message && (
            <p className="text-sm text-destructive">
              {variantErrors.compareAtPrice.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-2">
        <Label>Variant images and videos</Label>
        <Controller
          name={variantImagePath}
          control={control}
          render={({ field }) => (
            <>
              <div className="flex flex-wrap gap-2">
                {field.value.map((url, mediaIndex) => (
                  <div key={`${url}-${mediaIndex}`} className="relative">
                    <MediaPreview
                      url={url}
                      label={`Variant ${index + 1} media ${mediaIndex + 1}`}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon-xs"
                      className="absolute -right-1 -top-1"
                      aria-label="Remove media"
                      disabled={disabled || uploadingMedia}
                      onClick={() =>
                        field.onChange(
                          field.value.filter((_, i) => i !== mediaIndex),
                        )
                      }
                    >
                      <X />
                    </Button>
                  </div>
                ))}
              </div>
              <Input
                type="file"
                accept="image/*,video/*"
                multiple
                disabled={
                  disabled || uploadingMedia || field.value.length >= 10
                }
                onChange={(event) => {
                  void uploadVariantImages(
                    event.currentTarget.files,
                    field.value,
                    field.onChange,
                  );
                  event.currentTarget.value = "";
                }}
              />
            </>
          )}
        />
        <p className="text-xs text-muted-foreground">
          Media files are uploaded to Cloudinary. Up to 10 files per variant.
        </p>
      </div>

      <div className="grid gap-3">
        <div className="flex items-center justify-between gap-3">
          <Label>Options</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || uploadingMedia}
            onClick={() => append({ name: "", value: "", image: "" })}
          >
            <Plus />
            Add option
          </Button>
        </div>
        {fields.map((field, optionIndex) => (
          <OptionEditor
            key={field.id}
            control={control}
            register={register}
            index={optionIndex}
            variantIndex={index}
            onUploadStateChange={onUploadStateChange}
            onRemove={() => remove(optionIndex)}
            disabled={disabled}
          />
        ))}
        {fields.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No options for this variant.
          </p>
        )}
      </div>
    </section>
  );
}

export function ProductFormDialog({
  open,
  product,
  categories,
  subcategories,
  lookupsLoading,
  saving,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  product: AdminProduct | null;
  categories: Category[];
  subcategories: SubCategory[];
  lookupsLoading: boolean;
  saving: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (values: ProductFormValues) => Promise<void>;
}) {
  const [uploadsInProgress, setUploadsInProgress] = useState(0);
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: emptyProduct,
  });
  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = form;
  const variantArray = useFieldArray({ control, name: "variants" });
  const selectedCategoryIds = useWatch({ control, name: "categoryIds" });
  const selectedSubcategoryIds = useWatch({ control, name: "subcategoryIds" });
  const eligibleSubcategories = subcategories.filter((subcategory) =>
    selectedCategoryIds.includes(subcategory.categoryId),
  );
  const busy = saving || uploadsInProgress > 0;

  useEffect(() => {
    if (!open) return;
    reset(
      product
        ? {
            name: product.name,
            slug: product.slug,
            sku: product.sku ?? "",
            baseImage: product.baseImage ?? "",
            description: product.description ?? "",
            isActive: product.isActive,
            isNew: product.isNew,
            isBestSeller: product.isBestSeller,
            isFeatured: product.isFeatured,
            status: product.status,
            categoryIds: product.categories.map(({ categoryId }) => categoryId),
            subcategoryIds: product.subCategories.map(
              ({ subCategoryId }) => subCategoryId,
            ),
            variants: product.variants.map((variant) => ({
              id: variant.id,
              sku: variant.sku,
              price: variant.price,
              compareAtPrice: variant.compareAtPrice ?? "",
              images: variant.images,
              options: variant.options.map((option) => ({
                name: option.name,
                value: option.value,
                image: option.image ?? "",
              })),
              isActive: variant.isActive,
            })),
          }
        : emptyProduct,
    );
  }, [open, product, reset]);

  function changeCategory(categoryId: string, checked: boolean) {
    const current = selectedCategoryIds;
    const next = checked
      ? [...current, categoryId]
      : current.filter((id) => id !== categoryId);
    setValue("categoryIds", next, { shouldDirty: true, shouldValidate: true });
    const allowedSubcategoryIds = new Set(
      subcategories
        .filter((subcategory) => next.includes(subcategory.categoryId))
        .map((subcategory) => subcategory.id),
    );
    setValue(
      "subcategoryIds",
      selectedSubcategoryIds.filter((id) => allowedSubcategoryIds.has(id)),
      { shouldDirty: true, shouldValidate: true },
    );
  }

  function changeSubcategory(subcategoryId: string, checked: boolean) {
    const current = selectedSubcategoryIds;
    setValue(
      "subcategoryIds",
      checked
        ? [...current, subcategoryId]
        : current.filter((id) => id !== subcategoryId),
      { shouldDirty: true, shouldValidate: true },
    );
  }

  async function uploadBaseMedia(
    file: File | undefined,
    onChange: (url: string) => void,
  ) {
    if (!file) return;
    setUploadsInProgress((count) => count + 1);
    try {
      onChange(await uploadImageOrVideo(file, { folder: "products" }));
      toast.success("Product media uploaded");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Product media upload failed",
      );
    } finally {
      setUploadsInProgress((count) => Math.max(0, count - 1));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{product ? "Edit product" : "Add product"}</DialogTitle>
          <DialogDescription>
            Manage product details, media, categories, and purchasable variants.
          </DialogDescription>
        </DialogHeader>

        <form
          id="product-form"
          className="grid gap-6"
          onSubmit={handleSubmit(onSave)}
          noValidate
        >
          <section className="grid gap-4">
            <h3 className="font-medium">Product information</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor="product-name">Name</Label>
                <Input
                  id="product-name"
                  aria-invalid={Boolean(errors.name)}
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="product-slug">Slug</Label>
                <Input
                  id="product-slug"
                  aria-invalid={Boolean(errors.slug)}
                  {...register("slug")}
                />
                {errors.slug && (
                  <p className="text-sm text-destructive">
                    {errors.slug.message}
                  </p>
                )}
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="product-sku">Product SKU</Label>
                <Input id="product-sku" {...register("sku")} />
                {errors.sku && (
                  <p className="text-sm text-destructive">
                    {errors.sku.message}
                  </p>
                )}
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="product-status">Inventory status</Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(value) =>
                        field.onChange(value as ProductStatus)
                      }
                      items={[
                        { label: "In stock", value: "IN_STOCK" },
                        { label: "Out of stock", value: "OUT_OF_STOCK" },
                        { label: "Upcoming", value: "UPCOMING" },
                        { label: "Coming soon", value: "COMING_SOON" },
                      ]}
                    >
                      <SelectTrigger id="product-status" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="IN_STOCK">In stock</SelectItem>
                          <SelectItem value="OUT_OF_STOCK">
                            Out of stock
                          </SelectItem>
                          <SelectItem value="UPCOMING">Upcoming</SelectItem>
                          <SelectItem value="COMING_SOON">
                            Coming soon
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="product-description">Description</Label>
              <textarea
                id="product-description"
                rows={4}
                maxLength={10000}
                className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive"
                aria-invalid={Boolean(errors.description)}
                {...register("description")}
              />
              {errors.description && (
                <p className="text-sm text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label>Product image or video</Label>
              <Controller
                name="baseImage"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-wrap items-center gap-3">
                    {field.value && (
                      <MediaPreview
                        url={field.value}
                        label="Product media preview"
                      />
                    )}
                    <Input
                      type="file"
                      accept="image/*,video/*"
                      className="max-w-md"
                      disabled={busy}
                      onChange={(event) => {
                        void uploadBaseMedia(
                          event.currentTarget.files?.[0],
                          field.onChange,
                        );
                        event.currentTarget.value = "";
                      }}
                    />
                    {field.value && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Remove product media"
                        disabled={busy}
                        onClick={() => field.onChange("")}
                      >
                        <X />
                      </Button>
                    )}
                  </div>
                )}
              />
              {errors.baseImage && (
                <p className="text-sm text-destructive">
                  {errors.baseImage.message}
                </p>
              )}
            </div>
          </section>

          <section className="grid gap-4">
            <div>
              <h3 className="font-medium">Categories</h3>
              <p className="text-sm text-muted-foreground">
                Choose one or more categories and subcategories.
              </p>
            </div>
            {lookupsLoading ? (
              <p className="text-sm text-muted-foreground">
                Loading categories...
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <fieldset className="grid content-start gap-2 rounded-lg border p-3">
                  <legend className="px-1 text-sm font-medium">
                    Categories
                  </legend>
                  {categories.length ? (
                    categories.map((category) => (
                      <label
                        key={category.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Checkbox
                          checked={selectedCategoryIds.includes(category.id)}
                          onCheckedChange={(checked) =>
                            changeCategory(category.id, checked === true)
                          }
                          disabled={busy}
                        />
                        {category.name}
                      </label>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No categories found.
                    </p>
                  )}
                </fieldset>
                <fieldset className="grid content-start gap-2 rounded-lg border p-3">
                  <legend className="px-1 text-sm font-medium">
                    Subcategories
                  </legend>
                  {eligibleSubcategories.length ? (
                    eligibleSubcategories.map((subcategory) => (
                      <label
                        key={subcategory.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Checkbox
                          checked={selectedSubcategoryIds.includes(
                            subcategory.id,
                          )}
                          onCheckedChange={(checked) =>
                            changeSubcategory(subcategory.id, checked === true)
                          }
                          disabled={busy}
                        />
                        {subcategory.name}
                      </label>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Select a category to see its subcategories.
                    </p>
                  )}
                </fieldset>
              </div>
            )}
          </section>

          <section className="grid gap-3">
            <h3 className="font-medium">Catalog visibility</h3>
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              {(
                [
                  ["isActive", "Active in store"],
                  ["isNew", "New arrival"],
                  ["isBestSeller", "Best seller"],
                  ["isFeatured", "Featured"],
                ] as const
              ).map(([fieldName, label]) => (
                <Controller
                  key={fieldName}
                  name={fieldName}
                  control={control}
                  render={({ field }) => (
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) =>
                          field.onChange(checked === true)
                        }
                        disabled={busy}
                      />
                      {label}
                    </label>
                  )}
                />
              ))}
            </div>
          </section>

          <section className="grid gap-4">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h3 className="font-medium">Variants and options</h3>
                <p className="text-sm text-muted-foreground">
                  Each variant has its own SKU, price, media, and JSON options.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={busy || variantArray.fields.length >= 100}
                onClick={() => variantArray.append(emptyVariant())}
              >
                <Plus />
                Add variant
              </Button>
            </div>
            {errors.variants?.root && (
              <p className="text-sm text-destructive">
                {errors.variants.root.message}
              </p>
            )}
            {errors.variants?.message && (
              <p className="text-sm text-destructive">
                {errors.variants.message}
              </p>
            )}
            <div className="grid gap-4">
              {variantArray.fields.map((field, index) => (
                <VariantEditor
                  key={field.id}
                  control={control}
                  register={register}
                  index={index}
                  onUploadStateChange={(uploading) =>
                    setUploadsInProgress((count) =>
                      Math.max(0, count + (uploading ? 1 : -1)),
                    )
                  }
                  onRemove={() => variantArray.remove(index)}
                  disabled={busy}
                />
              ))}
            </div>
          </section>
        </form>

        <DialogFooter>
          <DialogClose
            render={<Button type="button" variant="outline" disabled={busy} />}
          >
            Cancel
          </DialogClose>
          <Button
            type="submit"
            form="product-form"
            disabled={busy || lookupsLoading}
          >
            {busy && <LoaderCircle className="animate-spin" />}
            {uploadsInProgress > 0
              ? "Uploading media..."
              : product
                ? "Save product"
                : "Create product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
