"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { uploadImageOrVideo } from "@/lib/cloudinary";
import {
  ArrowDownToLine,
  LoaderCircle,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useCategories,
  useCategoryMutations,
  useSubcategories,
  useSubcategoryMutations,
} from "@/hooks/use-resources";
import { categoriesApi, subcategoriesApi } from "@/server/resources";
import type {
  Category,
  ListParams,
  PaginatedData,
  SubCategory,
} from "@/server/types";

const nameSchema = z
  .string()
  .trim()
  .min(2, "Enter at least 2 characters")
  .max(80);
const slugSchema = z
  .string()
  .trim()
  .min(2, "Enter a slug")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Use lowercase letters, numbers, and hyphens",
  );
const imageSchema = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || /^https?:\/\/\S+$/i.test(value),
    "Enter a valid image URL",
  );

const categoryFormSchema = z.object({
  name: nameSchema,
  slug: slugSchema,
  image: imageSchema,
});
const subcategoryFormSchema = categoryFormSchema.extend({
  categoryId: z.string().min(1, "Choose a category"),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;
type SubcategoryFormValues = z.infer<typeof subcategoryFormSchema>;
type ActiveTab = "categories" | "subcategories";
type DeleteTarget = {
  kind: ActiveTab;
  id: string;
  name: string;
};

const emptyCategoryValues: CategoryFormValues = {
  name: "",
  slug: "",
  image: "",
};
const emptySubcategoryValues: SubcategoryFormValues = {
  ...emptyCategoryValues,
  categoryId: "",
};
const noCategories: Category[] = [];

function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function fetchAllPages<T>(
  list: (params?: ListParams) => Promise<PaginatedData<T>>,
) {
  const firstPage = await list({ page: 1, limit: 100 });
  if (firstPage.pagination.pages <= 1) return firstPage.items;

  const remainingPages = await Promise.all(
    Array.from({ length: firstPage.pagination.pages - 1 }, (_, index) =>
      list({ page: index + 2, limit: 100 }),
    ),
  );
  return firstPage.items.concat(...remainingPages.map((page) => page.items));
}

function errorMessage(error: unknown) {
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

function displayDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "-"
    : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

function CategoryFormDialog({
  open,
  item,
  saving,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  item: Category | null;
  saving: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (values: CategoryFormValues) => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: emptyCategoryValues,
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (open) {
      reset(
        item
          ? { name: item.name, slug: item.slug, image: item.image ?? "" }
          : emptyCategoryValues,
      );
    }
  }, [item, open, reset]);

  async function uploadImage(
    file: File | undefined,
    onChange: (url: string) => void,
  ) {
    if (!file) return;
    setUploadingImage(true);
    try {
      onChange(await uploadImageOrVideo(file, { folder: "categories" }));
      toast.success("Category image uploaded");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Image upload failed",
      );
    } finally {
      setUploadingImage(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{item ? "Edit category" : "Add category"}</DialogTitle>
          <DialogDescription>
            Enter the category details below.
          </DialogDescription>
        </DialogHeader>
        <form
          id="category-form"
          className="grid gap-4"
          onSubmit={handleSubmit(onSave)}
          noValidate
        >
          <div className="grid gap-2">
            <Label htmlFor="category-name">Name</Label>
            <Input
              id="category-name"
              autoComplete="off"
              aria-invalid={Boolean(errors.name)}
              {...register("name", {
                onChange: (event) => {
                  setValue("slug", slugify(event.target.value), {
                    shouldValidate: true,
                  });
                },
              })}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="category-slug">Slug</Label>
            <Input
              id="category-slug"
              autoComplete="off"
              aria-invalid={Boolean(errors.slug)}
              {...register("slug")}
            />
            {errors.slug && (
              <p className="text-sm text-destructive">{errors.slug.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="category-image">Image URL</Label>
            <Controller
              name="image"
              control={control}
              render={({ field }) => (
                <div className="grid gap-2">
                  <Input
                    id="category-image"
                    type="file"
                    accept="image/*"
                    disabled={uploadingImage || saving}
                    aria-invalid={Boolean(errors.image)}
                    onChange={(event) => {
                      void uploadImage(
                        event.currentTarget.files?.[0],
                        field.onChange,
                      );
                      event.currentTarget.value = "";
                    }}
                  />
                  {field.value && (
                    <div className="flex items-center gap-3">
                      <Image
                        src={field.value}
                        alt="Category preview"
                        width={56}
                        height={56}
                        unoptimized
                        className="size-14 rounded border object-cover"
                      />
                      <span className="min-w-0 truncate text-xs text-muted-foreground">
                        {field.value}
                      </span>
                    </div>
                  )}
                </div>
              )}
            />
            {errors.image && (
              <p className="text-sm text-destructive">{errors.image.message}</p>
            )}
          </div>
        </form>
        <DialogFooter>
          <DialogClose
            render={
              <Button
                type="button"
                variant="outline"
                disabled={saving || uploadingImage}
              />
            }
          >
            Cancel
          </DialogClose>
          <Button
            type="submit"
            form="category-form"
            disabled={saving || uploadingImage}
          >
            {(saving || uploadingImage) && (
              <LoaderCircle className="animate-spin" />
            )}
            {item ? "Save changes" : "Create category"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SubcategoryFormDialog({
  open,
  item,
  categories,
  categoriesLoading,
  saving,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  item: SubCategory | null;
  categories: Category[];
  categoriesLoading: boolean;
  saving: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (values: SubcategoryFormValues) => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<SubcategoryFormValues>({
    resolver: zodResolver(subcategoryFormSchema),
    defaultValues: emptySubcategoryValues,
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (open) {
      reset(
        item
          ? {
              name: item.name,
              slug: item.slug,
              image: item.image ?? "",
              categoryId: item.categoryId,
            }
          : emptySubcategoryValues,
      );
    }
  }, [item, open, reset]);

  async function uploadImage(
    file: File | undefined,
    onChange: (url: string) => void,
  ) {
    if (!file) return;
    setUploadingImage(true);
    try {
      onChange(await uploadImageOrVideo(file, { folder: "subcategories" }));
      toast.success("Subcategory image uploaded");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Image upload failed",
      );
    } finally {
      setUploadingImage(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {item ? "Edit subcategory" : "Add subcategory"}
          </DialogTitle>
          <DialogDescription>
            Choose a parent category and enter the subcategory details.
          </DialogDescription>
        </DialogHeader>
        <form
          id="subcategory-form"
          className="grid gap-4"
          onSubmit={handleSubmit(onSave)}
          noValidate
        >
          <div className="grid gap-2">
            <Label htmlFor="subcategory-category">Category</Label>
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => field.onChange(value ?? "")}
                  items={categories.map((category) => ({
                    label: category.name,
                    value: category.id,
                  }))}
                  disabled={categoriesLoading || categories.length === 0}
                >
                  <SelectTrigger
                    id="subcategory-category"
                    className="w-full"
                    aria-invalid={Boolean(errors.categoryId)}
                  >
                    <SelectValue
                      placeholder={
                        categoriesLoading
                          ? "Loading categories..."
                          : "Select a category"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.categoryId && (
              <p className="text-sm text-destructive">
                {errors.categoryId.message}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="subcategory-name">Name</Label>
            <Input
              id="subcategory-name"
              autoComplete="off"
              aria-invalid={Boolean(errors.name)}
              {...register("name", {
                onChange: (event) => {
                  setValue("slug", slugify(event.target.value), {
                    shouldValidate: true,
                  });
                },
              })}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="subcategory-slug">Slug</Label>
            <Input
              id="subcategory-slug"
              autoComplete="off"
              aria-invalid={Boolean(errors.slug)}
              {...register("slug")}
            />
            {errors.slug && (
              <p className="text-sm text-destructive">{errors.slug.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="subcategory-image">Image URL</Label>
            <Controller
              name="image"
              control={control}
              render={({ field }) => (
                <div className="grid gap-2">
                  <Input
                    id="subcategory-image"
                    type="file"
                    accept="image/*"
                    disabled={uploadingImage || saving}
                    aria-invalid={Boolean(errors.image)}
                    onChange={(event) => {
                      void uploadImage(
                        event.currentTarget.files?.[0],
                        field.onChange,
                      );
                      event.currentTarget.value = "";
                    }}
                  />
                  {field.value && (
                    <div className="flex items-center gap-3">
                      <Image
                        src={field.value}
                        alt="Subcategory preview"
                        width={56}
                        height={56}
                        unoptimized
                        className="size-14 rounded border object-cover"
                      />
                      <span className="min-w-0 truncate text-xs text-muted-foreground">
                        {field.value}
                      </span>
                    </div>
                  )}
                </div>
              )}
            />
            {errors.image && (
              <p className="text-sm text-destructive">{errors.image.message}</p>
            )}
          </div>
        </form>
        <DialogFooter>
          <DialogClose
            render={
              <Button
                type="button"
                variant="outline"
                disabled={saving || uploadingImage}
              />
            }
          >
            Cancel
          </DialogClose>
          <Button
            type="submit"
            form="subcategory-form"
            disabled={saving || uploadingImage || categories.length === 0}
          >
            {(saving || uploadingImage) && (
              <LoaderCircle className="animate-spin" />
            )}
            {item ? "Save changes" : "Create subcategory"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function CategoriesPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("categories");
  const [categoryPage, setCategoryPage] = useState(1);
  const [categoryLimit, setCategoryLimit] = useState(10);
  const [subcategoryPage, setSubcategoryPage] = useState(1);
  const [subcategoryLimit, setSubcategoryLimit] = useState(10);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [subcategoryDialogOpen, setSubcategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSubcategory, setEditingSubcategory] =
    useState<SubCategory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [exporting, setExporting] = useState(false);

  const categoryQuery = useCategories({
    page: categoryPage,
    limit: categoryLimit,
  });
  const subcategoryQuery = useSubcategories({
    page: subcategoryPage,
    limit: subcategoryLimit,
  });
  const categoryOptionsQuery = useQuery({
    queryKey: ["categories", "options"],
    queryFn: () => fetchAllPages(categoriesApi.list),
  });
  const categoryMutations = useCategoryMutations();
  const subcategoryMutations = useSubcategoryMutations();

  const categories = categoryOptionsQuery.data ?? noCategories;
  const categoryNames = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories],
  );
  const categoryData = categoryQuery.data?.items ?? [];
  const subcategoryData = subcategoryQuery.data?.items ?? [];
  const categoryPagination = {
    page: categoryPage,
    limit: categoryLimit,
    total: categoryQuery.data?.pagination.total ?? 0,
    pages: categoryQuery.data?.pagination.pages ?? 0,
  };
  const subcategoryPagination = {
    page: subcategoryPage,
    limit: subcategoryLimit,
    total: subcategoryQuery.data?.pagination.total ?? 0,
    pages: subcategoryQuery.data?.pagination.pages ?? 0,
  };

  const categoryColumns: ServerDataTableColumn<Category>[] = [
    {
      id: "name",
      header: "Category",
      cell: (category) => (
        <div className="min-w-36">
          <p className="font-medium">{category.name}</p>
          <p className="text-xs text-muted-foreground">{category.slug}</p>
        </div>
      ),
    },
    {
      id: "image",
      header: "Image URL",
      cell: (category) => (
        <span
          className="block max-w-56 truncate text-muted-foreground"
          title={category.image ?? undefined}
        >
          {category.image || "-"}
        </span>
      ),
    },
    {
      id: "updated",
      header: "Updated",
      cell: (category) => displayDate(category.updatedAt),
    },
    {
      id: "actions",
      header: <span className="sr-only">Actions</span>,
      className: "w-24 text-right",
      cell: (category) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Edit ${category.name}`}
            onClick={() => {
              setEditingCategory(category);
              setCategoryDialogOpen(true);
            }}
          >
            <Pencil />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Delete ${category.name}`}
            className="text-destructive hover:text-destructive"
            onClick={() =>
              setDeleteTarget({
                kind: "categories",
                id: category.id,
                name: category.name,
              })
            }
          >
            <Trash2 />
          </Button>
        </div>
      ),
    },
  ];

  const subcategoryColumns: ServerDataTableColumn<SubCategory>[] = [
    {
      id: "name",
      header: "Subcategory",
      cell: (subcategory) => (
        <div className="min-w-36">
          <p className="font-medium">{subcategory.name}</p>
          <p className="text-xs text-muted-foreground">{subcategory.slug}</p>
        </div>
      ),
    },
    {
      id: "category",
      header: "Category",
      cell: (subcategory) => categoryNames.get(subcategory.categoryId) ?? "-",
    },
    {
      id: "image",
      header: "Image URL",
      cell: (subcategory) => (
        <span
          className="block max-w-56 truncate text-muted-foreground"
          title={subcategory.image ?? undefined}
        >
          {subcategory.image || "-"}
        </span>
      ),
    },
    {
      id: "updated",
      header: "Updated",
      cell: (subcategory) => displayDate(subcategory.updatedAt),
    },
    {
      id: "actions",
      header: <span className="sr-only">Actions</span>,
      className: "w-24 text-right",
      cell: (subcategory) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Edit ${subcategory.name}`}
            onClick={() => {
              setEditingSubcategory(subcategory);
              setSubcategoryDialogOpen(true);
            }}
          >
            <Pencil />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Delete ${subcategory.name}`}
            className="text-destructive hover:text-destructive"
            onClick={() =>
              setDeleteTarget({
                kind: "subcategories",
                id: subcategory.id,
                name: subcategory.name,
              })
            }
          >
            <Trash2 />
          </Button>
        </div>
      ),
    },
  ];

  async function saveCategory(values: CategoryFormValues) {
    const payload = { ...values, image: values.image || null };
    try {
      if (editingCategory) {
        await categoryMutations.update.mutateAsync({
          id: editingCategory.id,
          data: payload,
        });
        toast.success("Category updated");
      } else {
        await categoryMutations.create.mutateAsync(payload);
        setCategoryPage(1);
        toast.success("Category created");
      }
      setCategoryDialogOpen(false);
      setEditingCategory(null);
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }

  async function saveSubcategory(values: SubcategoryFormValues) {
    const payload = { ...values, image: values.image || null };
    try {
      if (editingSubcategory) {
        await subcategoryMutations.update.mutateAsync({
          id: editingSubcategory.id,
          data: payload,
        });
        toast.success("Subcategory updated");
      } else {
        await subcategoryMutations.create.mutateAsync(payload);
        setSubcategoryPage(1);
        toast.success("Subcategory created");
      }
      setSubcategoryDialogOpen(false);
      setEditingSubcategory(null);
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }

  async function removeRecord() {
    if (!deleteTarget) return;
    const isCategory = deleteTarget.kind === "categories";
    try {
      if (isCategory) {
        await categoryMutations.remove.mutateAsync(deleteTarget.id);
        if (categoryData.length === 1 && categoryPage > 1) {
          setCategoryPage((page) => page - 1);
        }
      } else {
        await subcategoryMutations.remove.mutateAsync(deleteTarget.id);
        if (subcategoryData.length === 1 && subcategoryPage > 1) {
          setSubcategoryPage((page) => page - 1);
        }
      }
      toast.success(`${isCategory ? "Category" : "Subcategory"} deleted`);
      setDeleteTarget(null);
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }

  async function exportActiveTab() {
    setExporting(true);
    try {
      const XLSX = await import("xlsx");
      const workbook = XLSX.utils.book_new();
      if (activeTab === "categories") {
        const records = await fetchAllPages(categoriesApi.list);
        const worksheet = XLSX.utils.json_to_sheet(
          records.map(({ id, name, slug, image, createdAt, updatedAt }) => ({
            ID: id,
            Name: name,
            Slug: slug,
            Image: image ?? "",
            "Created At": createdAt,
            "Updated At": updatedAt,
          })),
        );
        XLSX.utils.book_append_sheet(workbook, worksheet, "Categories");
        XLSX.writeFile(workbook, "categories.xlsx");
      } else {
        const [records, allCategories] = await Promise.all([
          fetchAllPages(subcategoriesApi.list),
          fetchAllPages(categoriesApi.list),
        ]);
        const categoryById = new Map(
          allCategories.map((category) => [category.id, category.name]),
        );
        const worksheet = XLSX.utils.json_to_sheet(
          records.map(
            ({ id, name, slug, image, categoryId, createdAt, updatedAt }) => ({
              ID: id,
              Name: name,
              Slug: slug,
              Category: categoryById.get(categoryId) ?? categoryId,
              Image: image ?? "",
              "Created At": createdAt,
              "Updated At": updatedAt,
            }),
          ),
        );
        XLSX.utils.book_append_sheet(workbook, worksheet, "Subcategories");
        XLSX.writeFile(workbook, "subcategories.xlsx");
      }
      toast.success("Excel file exported");
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setExporting(false);
    }
  }

  return (
    <main className="flex flex-col gap-6 p-4 lg:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage product categories and their subcategories.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={exportActiveTab}
          disabled={exporting}
        >
          {exporting ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            <ArrowDownToLine />
          )}
          Export Excel
        </Button>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as ActiveTab)}
        className="gap-4"
      >
        <TabsList>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="subcategories">Subcategories</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-4">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-medium">Category list</h2>
              <p className="text-sm text-muted-foreground">
                {categoryPagination.total} total categories
              </p>
            </div>
            <Button
              onClick={() => {
                setEditingCategory(null);
                setCategoryDialogOpen(true);
              }}
            >
              <Plus />
              Add category
            </Button>
          </div>
          {categoryQuery.isError && (
            <p role="alert" className="text-sm text-destructive">
              {errorMessage(categoryQuery.error)}
            </p>
          )}
          <ServerDataTable
            data={categoryData}
            columns={categoryColumns}
            pagination={categoryPagination}
            loading={categoryQuery.isLoading}
            onPageChange={setCategoryPage}
            onPageSizeChange={(limit) => {
              setCategoryLimit(limit);
              setCategoryPage(1);
            }}
            emptyMessage="No categories found."
          />
        </TabsContent>

        <TabsContent value="subcategories" className="space-y-4">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-medium">Subcategory list</h2>
              <p className="text-sm text-muted-foreground">
                {subcategoryPagination.total} total subcategories
              </p>
            </div>
            <Button
              onClick={() => {
                setEditingSubcategory(null);
                setSubcategoryDialogOpen(true);
              }}
              disabled={
                categories.length === 0 || categoryOptionsQuery.isLoading
              }
            >
              <Plus />
              Add subcategory
            </Button>
          </div>
          {subcategoryQuery.isError && (
            <p role="alert" className="text-sm text-destructive">
              {errorMessage(subcategoryQuery.error)}
            </p>
          )}
          {categoryOptionsQuery.isError && (
            <p role="alert" className="text-sm text-destructive">
              Could not load categories for the subcategory list.
            </p>
          )}
          <ServerDataTable
            data={subcategoryData}
            columns={subcategoryColumns}
            pagination={subcategoryPagination}
            loading={subcategoryQuery.isLoading}
            onPageChange={setSubcategoryPage}
            onPageSizeChange={(limit) => {
              setSubcategoryLimit(limit);
              setSubcategoryPage(1);
            }}
            emptyMessage="No subcategories found."
          />
        </TabsContent>
      </Tabs>

      <CategoryFormDialog
        open={categoryDialogOpen}
        item={editingCategory}
        saving={
          categoryMutations.create.isPending ||
          categoryMutations.update.isPending
        }
        onOpenChange={(open) => {
          setCategoryDialogOpen(open);
          if (!open) setEditingCategory(null);
        }}
        onSave={saveCategory}
      />
      <SubcategoryFormDialog
        open={subcategoryDialogOpen}
        item={editingSubcategory}
        categories={categories}
        categoriesLoading={categoryOptionsQuery.isLoading}
        saving={
          subcategoryMutations.create.isPending ||
          subcategoryMutations.update.isPending
        }
        onOpenChange={(open) => {
          setSubcategoryDialogOpen(open);
          if (!open) setEditingSubcategory(null);
        }}
        onSave={saveSubcategory}
      />

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Delete{" "}
              {deleteTarget?.kind === "categories" ? "category" : "subcategory"}
              ?
            </DialogTitle>
            <DialogDescription>
              {deleteTarget?.kind === "categories"
                ? `Deleting “${deleteTarget.name}” also removes its subcategories and product category links.`
                : `“${deleteTarget?.name}” will be permanently deleted.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose
              render={
                <Button
                  type="button"
                  variant="outline"
                  disabled={
                    categoryMutations.remove.isPending ||
                    subcategoryMutations.remove.isPending
                  }
                />
              }
            >
              Cancel
            </DialogClose>
            <Button
              variant="destructive"
              onClick={removeRecord}
              disabled={
                categoryMutations.remove.isPending ||
                subcategoryMutations.remove.isPending
              }
            >
              {(categoryMutations.remove.isPending ||
                subcategoryMutations.remove.isPending) && (
                <LoaderCircle className="animate-spin" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
