"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { LoaderCircle, Pencil, Plus, Trash2 } from "lucide-react";

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
import { useDivisionMutations, useDivisions } from "@/hooks/use-resources";
import type { Division } from "@/server/types";

const divisionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Division name must be at least 2 characters")
    .max(80, "Division name must be 80 characters or fewer"),
  deliveryCharge: z
    .string()
    .trim()
    .regex(
      /^\d{1,10}(?:\.\d{1,2})?$/,
      "Enter a non-negative amount with up to 2 decimal places",
    ),
});

type DivisionFormValues = z.infer<typeof divisionSchema>;

const emptyValues: DivisionFormValues = { name: "", deliveryCharge: "" };

function formatCharge(value: string) {
  const amount = Number(value);
  return Number.isFinite(amount)
    ? new Intl.NumberFormat(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount)
    : value;
}

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

function DivisionFormDialog({
  open,
  division,
  saving,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  division: Division | null;
  saving: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (values: DivisionFormValues) => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DivisionFormValues>({
    resolver: zodResolver(divisionSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (open) {
      reset(
        division
          ? {
              name: division.name,
              deliveryCharge: division.deliveryCharge,
            }
          : emptyValues,
      );
    }
  }, [division, open, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {division ? "Edit division" : "Add division"}
          </DialogTitle>
          <DialogDescription>
            Set the division name and its delivery charge.
          </DialogDescription>
        </DialogHeader>
        <form
          id="division-form"
          className="grid gap-4"
          onSubmit={handleSubmit(onSave)}
          noValidate
        >
          <div className="grid gap-2">
            <Label htmlFor="division-name">Division name</Label>
            <Input
              id="division-name"
              autoComplete="off"
              maxLength={80}
              aria-invalid={Boolean(errors.name)}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="division-delivery-charge">Delivery charge</Label>
            <Input
              id="division-delivery-charge"
              type="number"
              inputMode="decimal"
              min="0"
              max="9999999999.99"
              step="0.01"
              placeholder="0.00"
              aria-invalid={Boolean(errors.deliveryCharge)}
              {...register("deliveryCharge")}
            />
            {errors.deliveryCharge && (
              <p className="text-sm text-destructive">
                {errors.deliveryCharge.message}
              </p>
            )}
          </div>
        </form>
        <DialogFooter>
          <DialogClose
            render={
              <Button type="button" variant="outline" disabled={saving} />
            }
          >
            Cancel
          </DialogClose>
          <Button type="submit" form="division-form" disabled={saving}>
            {saving && <LoaderCircle className="animate-spin" />}
            {division ? "Save changes" : "Create division"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function DivisionPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [formOpen, setFormOpen] = useState(false);
  const [editingDivision, setEditingDivision] = useState<Division | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Division | null>(null);

  const divisionsQuery = useDivisions({ page, limit });
  const mutations = useDivisionMutations();
  const divisions = divisionsQuery.data?.items ?? [];
  const pagination = {
    page,
    limit,
    total: divisionsQuery.data?.pagination.total ?? 0,
    pages: divisionsQuery.data?.pagination.pages ?? 0,
  };

  const columns: ServerDataTableColumn<Division>[] = [
    {
      id: "name",
      header: "Division",
      cell: (division) => <span className="font-medium">{division.name}</span>,
    },
    {
      id: "delivery-charge",
      header: "Delivery charge",
      cell: (division) => formatCharge(division.deliveryCharge),
    },
    {
      id: "actions",
      header: <span className="sr-only">Actions</span>,
      className: "w-24 text-right",
      cell: (division) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Edit ${division.name}`}
            onClick={() => {
              setEditingDivision(division);
              setFormOpen(true);
            }}
          >
            <Pencil />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-destructive hover:text-destructive"
            aria-label={`Delete ${division.name}`}
            onClick={() => setDeleteTarget(division)}
          >
            <Trash2 />
          </Button>
        </div>
      ),
    },
  ];

  async function saveDivision(values: DivisionFormValues) {
    const payload = {
      name: values.name,
      deliveryCharge: Number(values.deliveryCharge).toFixed(2),
    };

    try {
      if (editingDivision) {
        await mutations.update.mutateAsync({
          id: editingDivision.id,
          data: payload,
        });
        toast.success("Division updated");
      } else {
        await mutations.create.mutateAsync(payload);
        setPage(1);
        toast.success("Division created");
      }
      setFormOpen(false);
      setEditingDivision(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function deleteDivision() {
    if (!deleteTarget) return;
    try {
      await mutations.remove.mutateAsync(deleteTarget.id);
      if (divisions.length === 1 && page > 1) setPage((current) => current - 1);
      setDeleteTarget(null);
      toast.success("Division deleted");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <main className="flex flex-col gap-6 p-4 lg:p-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Divisions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage delivery areas and their charges.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingDivision(null);
            setFormOpen(true);
          }}
        >
          <Plus />
          Add division
        </Button>
      </header>

      {divisionsQuery.isError && (
        <p role="alert" className="text-sm text-destructive">
          {getErrorMessage(divisionsQuery.error)}
        </p>
      )}

      <ServerDataTable
        data={divisions}
        columns={columns}
        pagination={pagination}
        loading={divisionsQuery.isLoading}
        onPageChange={setPage}
        onPageSizeChange={(nextLimit) => {
          setLimit(nextLimit);
          setPage(1);
        }}
        emptyMessage="No divisions found."
      />

      <DivisionFormDialog
        open={formOpen}
        division={editingDivision}
        saving={mutations.create.isPending || mutations.update.isPending}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingDivision(null);
        }}
        onSave={saveDivision}
      />

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete division?</DialogTitle>
            <DialogDescription>
              “{deleteTarget?.name}” will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose
              render={
                <Button
                  type="button"
                  variant="outline"
                  disabled={mutations.remove.isPending}
                />
              }
            >
              Cancel
            </DialogClose>
            <Button
              variant="destructive"
              onClick={deleteDivision}
              disabled={mutations.remove.isPending}
            >
              {mutations.remove.isPending && (
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
