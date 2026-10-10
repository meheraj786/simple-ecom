import "dotenv/config";
import { lookup } from "node:dns/promises";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client.js";
import type { PoolConfig } from "pg";

type PrismaClientState = {
  client: PrismaClient | undefined;
  initializing: Promise<PrismaClient> | undefined;
};

const state: PrismaClientState = { client: undefined, initializing: undefined };

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property) {
    if (!state.client) {
      throw new Error(
        "Database client is not initialized; call connectDB first",
      );
    }

    const value: unknown = Reflect.get(state.client, property, state.client);
    return typeof value === "function" ? value.bind(state.client) : value;
  },
});

async function getPoolConfig(): Promise<PoolConfig> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL must be configured");
  }

  const url = new URL(connectionString);
  if (url.protocol !== "postgres:" && url.protocol !== "postgresql:") {
    throw new Error(
      "DATABASE_URL must use the postgres or postgresql protocol",
    );
  }

  const hostname = url.hostname;
  // This runtime cannot route IPv6; keep TLS verification against the original hostname.
  const { address } = await lookup(hostname, { family: 4 });
  const sslMode = url.searchParams.get("sslmode");
  const channelBinding = url.searchParams.get("channel_binding");
  const connectTimeout = Number.parseInt(
    url.searchParams.get("connect_timeout") ?? "10",
    10,
  );

  return {
    host: address,
    port: Number(url.port) || 5432,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: decodeURIComponent(url.pathname.slice(1)),
    ...(sslMode && sslMode !== "disable"
      ? {
          ssl: {
            rejectUnauthorized: sslMode !== "no-verify",
            servername: hostname,
          },
        }
      : {}),
    ...(channelBinding === "require" || channelBinding === "prefer"
      ? { enableChannelBinding: true }
      : {}),
    ...(url.searchParams.has("application_name")
      ? {
          application_name:
            url.searchParams.get("application_name") ?? undefined,
        }
      : {}),
    ...(url.searchParams.has("options")
      ? { options: url.searchParams.get("options") ?? undefined }
      : {}),
    connectionTimeoutMillis: Number.isFinite(connectTimeout)
      ? Math.max(1, connectTimeout) * 1000
      : 10_000,
    max: 10,
  };
}

async function getOrCreateClient(): Promise<PrismaClient> {
  if (state.client) {
    return state.client;
  }

  state.initializing ??= (async () => {
    const adapter = new PrismaPg(await getPoolConfig());
    const client = new PrismaClient({ adapter });
    try {
      await client.$connect();
      await client.$queryRawUnsafe("SELECT 1");
      return client;
    } catch (error) {
      await client.$disconnect().catch(() => undefined);
      throw error;
    }
  })();

  try {
    state.client = await state.initializing;
    return state.client;
  } catch (error) {
    state.initializing = undefined;
    throw error;
  }
}

export async function connectDB(): Promise<void> {
  await getOrCreateClient();
  console.log("Database connected successfully");
}

export async function disconnectDB(): Promise<void> {
  await state.client?.$disconnect();
  state.client = undefined;
  state.initializing = undefined;
}
