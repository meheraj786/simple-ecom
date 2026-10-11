"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ArrowDownToLine, Eye, LoaderCircle, Trash2 } from "lucide-react";

import {
  ServerDataTable,
  type ServerDataTableColumn,
} from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
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
import {
  useContactMessageMutations,
  useContactMessages,
} from "@/hooks/use-resources";
import { contactMessagesApi } from "@/server/resources";
import type { ContactMessage } from "@/server/types";

async function fetchAllMessages() {
  const firstPage = await contactMessagesApi.list({ page: 1, limit: 100 });
  if (firstPage.pagination.pages <= 1) return firstPage.items;

  const remainingPages = await Promise.all(
    Array.from({ length: firstPage.pagination.pages - 1 }, (_, index) =>
      contactMessagesApi.list({ page: index + 2, limit: 100 }),
    ),
  );
  return firstPage.items.concat(...remainingPages.map((page) => page.items));
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

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "-"
    : new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
}

export default function MessagesPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<ContactMessage | null>(null);
  const [exporting, setExporting] = useState(false);

  const messagesQuery = useContactMessages({ page, limit });
  const { remove } = useContactMessageMutations();
  const messages = messagesQuery.data?.items ?? [];
  const pagination = {
    page,
    limit,
    total: messagesQuery.data?.pagination.total ?? 0,
    pages: messagesQuery.data?.pagination.pages ?? 0,
  };

  const columns: ServerDataTableColumn<ContactMessage>[] = [
    {
      id: "sender",
      header: "From",
      cell: (message) => (
        <div className="min-w-36">
          <p className="font-medium">{message.name}</p>
          <p className="text-xs text-muted-foreground">{message.email}</p>
        </div>
      ),
    },
    {
      id: "subject",
      header: "Subject",
      cell: (message) => (
        <span className="block max-w-52 truncate" title={message.subject}>
          {message.subject || "No subject"}
        </span>
      ),
    },
    {
      id: "message",
      header: "Message",
      cell: (message) => (
        <span
          className="block max-w-72 truncate text-muted-foreground"
          title={message.message}
        >
          {message.message}
        </span>
      ),
    },
    {
      id: "received",
      header: "Received",
      cell: (message) => formatDate(message.createdAt),
    },
    {
      id: "status",
      header: "Status",
      cell: (message) => (
        <Badge variant={message.isRead ? "outline" : "secondary"}>
          {message.isRead ? "Read" : "Unread"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: <span className="sr-only">Actions</span>,
      className: "w-24 text-right",
      cell: (message) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Read message from ${message.name}`}
            onClick={() => setSelectedMessage(message)}
          >
            <Eye />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-destructive hover:text-destructive"
            aria-label={`Delete message from ${message.name}`}
            onClick={() => setDeleteTarget(message)}
          >
            <Trash2 />
          </Button>
        </div>
      ),
    },
  ];

  async function exportMessages() {
    setExporting(true);
    try {
      const [XLSX, records] = await Promise.all([
        import("xlsx"),
        fetchAllMessages(),
      ]);
      const worksheet = XLSX.utils.json_to_sheet(
        records.map((message) => ({
          Name: message.name,
          Email: message.email,
          Phone: message.phone,
          Subject: message.subject,
          Message: message.message,
          Status: message.isRead ? "Read" : "Unread",
          "Received At": message.createdAt,
        })),
      );
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Messages");
      XLSX.writeFile(workbook, "contact-messages.xlsx");
      toast.success("Messages exported to Excel");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setExporting(false);
    }
  }

  async function deleteMessage() {
    if (!deleteTarget) return;
    try {
      await remove.mutateAsync(deleteTarget.id);
      if (messages.length === 1 && page > 1)
        setPage((currentPage) => currentPage - 1);
      setDeleteTarget(null);
      toast.success("Message deleted");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <main className="flex flex-col gap-6 p-4 lg:p-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Messages</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Read and manage messages sent through the contact form.
          </p>
        </div>
        <Button variant="outline" onClick={exportMessages} disabled={exporting}>
          {exporting ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            <ArrowDownToLine />
          )}
          Export Excel
        </Button>
      </header>

      <div className="flex items-end justify-between">
        <div>
          <h2 className="font-medium">Inbox</h2>
          <p className="text-sm text-muted-foreground">
            {pagination.total} total messages
          </p>
        </div>
      </div>

      {messagesQuery.isError && (
        <p role="alert" className="text-sm text-destructive">
          {getErrorMessage(messagesQuery.error)}
        </p>
      )}

      <ServerDataTable
        data={messages}
        columns={columns}
        pagination={pagination}
        loading={messagesQuery.isLoading}
        onPageChange={setPage}
        onPageSizeChange={(nextLimit) => {
          setLimit(nextLimit);
          setPage(1);
        }}
        emptyMessage="No messages found."
      />

      <Dialog
        open={selectedMessage !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedMessage(null);
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {selectedMessage?.subject || "Contact message"}
            </DialogTitle>
            <DialogDescription>
              Received{" "}
              {selectedMessage ? formatDate(selectedMessage.createdAt) : ""}
            </DialogDescription>
          </DialogHeader>
          {selectedMessage && (
            <div className="grid gap-5 text-sm">
              <dl className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-1">
                  <dt className="text-xs text-muted-foreground">From</dt>
                  <dd className="font-medium">{selectedMessage.name}</dd>
                </div>
                <div className="grid gap-1">
                  <dt className="text-xs text-muted-foreground">Email</dt>
                  <dd className="break-all">{selectedMessage.email}</dd>
                </div>
                <div className="grid gap-1">
                  <dt className="text-xs text-muted-foreground">Phone</dt>
                  <dd>{selectedMessage.phone || "-"}</dd>
                </div>
                <div className="grid gap-1">
                  <dt className="text-xs text-muted-foreground">Status</dt>
                  <dd>{selectedMessage.isRead ? "Read" : "Unread"}</dd>
                </div>
              </dl>
              <div className="grid gap-2">
                <h3 className="text-xs font-medium text-muted-foreground">
                  Message
                </h3>
                <p className="max-h-72 overflow-y-auto whitespace-pre-wrap wrap-break-word rounded-md border bg-muted/30 p-3 leading-6">
                  {selectedMessage.message}
                </p>
              </div>
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
            <DialogTitle>Delete message?</DialogTitle>
            <DialogDescription>
              The message from {deleteTarget?.name} will be permanently deleted.
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
              onClick={deleteMessage}
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
