"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowUpRight,
  CircleAlert,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCurrentUser, useAdminLogin } from "@/hooks/use-auth";

const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password").max(1024),
});

type LoginValues = z.infer<typeof loginSchema>;

function isDashboardPath(value: string | null): value is string {
  return Boolean(
    value &&
    (value === "/admin" ||
      value.startsWith("/admin/") ||
      value === "/dashboard" ||
      value.startsWith("/dashboard/")),
  );
}

function AdminLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentUser = useCurrentUser();
  const login = useAdminLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });
  const requestedPath = searchParams.get("redirectTo");
  const redirectTo = isDashboardPath(requestedPath) ? requestedPath : "/admin";
  const accessDenied = searchParams.get("access") === "denied";
  const isAdmin = currentUser.data?.role === "ADMIN";
  const isSignedInWithoutAccess = Boolean(
    currentUser.data && currentUser.data.role !== "ADMIN",
  );
  const loginError = login.error as {
    response?: { data?: { message?: string } };
  } | null;

  async function submitLogin(values: LoginValues) {
    try {
      await login.mutateAsync({
        email: values.email.trim().toLowerCase(),
        password: values.password,
      });
      router.replace(redirectTo);
    } catch {
      // The mutation error is rendered below without exposing account details.
    }
  }

  useEffect(() => {
    if (isAdmin) {
      router.replace(redirectTo);
    }
  }, [isAdmin, redirectTo, router]);

  const checkingSession = currentUser.isPending || isAdmin;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f1f3ee] px-4 py-10 text-[#17231d]">
      <div className="grid w-full max-w-5xl overflow-hidden border border-[#d8ded7] bg-white shadow-sm lg:min-h-[580px] lg:grid-cols-[0.9fr_1.1fr]">
        <section className="relative flex flex-col justify-between overflow-hidden bg-[#1c3028] p-7 text-white sm:p-10 lg:p-12">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center border border-white/25 text-sm font-semibold tracking-wide">
              E
            </span>
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-white/75">
              E-Com / Operations
            </span>
          </div>
          <div className="relative z-10 py-10 lg:py-0">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#c3d7b9]">
              Administrator access
            </p>
            <h1 className="max-w-sm text-4xl font-semibold leading-tight sm:text-5xl">
              Store control,
              <br />
              in one place.
            </h1>
            <p className="mt-5 max-w-sm text-sm leading-6 text-white/70">
              Sign in with your administrator email and password.
            </p>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-white/15 pt-5 text-xs text-white/60">
            <span>Private administrator workspace</span>
            <Link
              href="/"
              className="inline-flex items-center gap-1 hover:text-white"
            >
              Storefront <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
          <div className="pointer-events-none absolute -right-24 top-1/3 size-72 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-12 top-[38%] size-48 rounded-full border border-white/10" />
        </section>

        <section className="flex items-center justify-center px-5 py-10 sm:px-10 lg:px-14">
          <Card className="w-full max-w-md border-0 shadow-none">
            <CardHeader className="px-0 pb-5">
              <div className="mb-5 flex size-11 items-center justify-center border border-[#d8ded7] bg-[#f4f6f1] text-[#315d47]">
                <ShieldCheck className="size-5" />
              </div>
              <CardTitle className="text-2xl font-semibold">
                Admin sign in
              </CardTitle>
              <CardDescription>
                Enter the credentials configured for your store administrator.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 px-0">
              {(accessDenied || isSignedInWithoutAccess) && (
                <div
                  className="flex gap-3 border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950"
                  role="alert"
                >
                  <CircleAlert className="mt-0.5 size-4 shrink-0" />
                  <p>
                    {currentUser.data
                      ? `${currentUser.data.email} does not have administrator access.`
                      : "This account does not have administrator access."}
                    {isSignedInWithoutAccess &&
                      " Choose the administrator account to continue."}
                  </p>
                </div>
              )}

              {login.isError && (
                <div
                  className="flex gap-3 border border-red-200 bg-red-50 p-3 text-sm text-red-900"
                  role="alert"
                >
                  <CircleAlert className="mt-0.5 size-4 shrink-0" />
                  <p>
                    {loginError?.response?.data?.message ??
                      "Unable to sign in. Check your email and password."}
                  </p>
                </div>
              )}

              <form
                className="space-y-4"
                onSubmit={handleSubmit(submitLogin)}
                noValidate
              >
                <div className="grid gap-2">
                  <Label htmlFor="admin-email">Email</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    autoComplete="username"
                    placeholder="admin@example.com"
                    aria-invalid={Boolean(errors.email)}
                    disabled={checkingSession || login.isPending}
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="admin-password">Password</Label>
                  <Input
                    id="admin-password"
                    type="password"
                    autoComplete="current-password"
                    aria-invalid={Boolean(errors.password)}
                    disabled={checkingSession || login.isPending}
                    {...register("password")}
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">
                      {errors.password.message}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="h-11 w-full justify-center bg-[#1c3028] text-white hover:bg-[#284538]"
                  disabled={checkingSession || login.isPending}
                >
                  {checkingSession || login.isPending ? (
                    <LoaderCircle className="animate-spin" />
                  ) : null}
                  {checkingSession
                    ? "Checking session..."
                    : login.isPending
                      ? "Signing in..."
                      : "Sign in"}
                </Button>
              </form>

              {isAdmin && (
                <p
                  className="text-center text-sm text-muted-foreground"
                  role="status"
                >
                  <LoaderCircle className="mr-2 inline size-4 animate-spin" />
                  Redirecting to the dashboard...
                </p>
              )}

              <div className="flex items-center gap-3">
                <Separator className="flex-1" />
                <span className="text-xs text-muted-foreground">
                  SECURE SESSION
                </span>
                <Separator className="flex-1" />
              </div>
              <p className="text-center text-xs leading-5 text-muted-foreground">
                Access is limited to accounts with the administrator role.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}

function AdminLoginFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f1f3ee] text-sm text-muted-foreground">
      <LoaderCircle className="mr-2 size-4 animate-spin" />
      Loading sign in...
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<AdminLoginFallback />}>
      <AdminLoginContent />
    </Suspense>
  );
}
