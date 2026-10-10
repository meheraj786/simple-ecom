import { prisma } from "../../db.js";
import type {
  CrudConfig,
  CrudDelegate,
  CrudPage,
  CrudRecord,
  CrudService,
} from "./crud.types.js";

function isRecord(value: unknown): value is CrudRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function sanitizeRecord(config: CrudConfig, record: unknown): unknown {
  if (!config.hidePassword || !isRecord(record)) {
    return record;
  }

  const { password: _password, ...safeRecord } = record;
  return safeRecord;
}

function validateInput(
  config: CrudConfig,
  data: CrudRecord,
  creating: boolean,
): void {
  if (config.hidePassword && Object.hasOwn(data, "password")) {
    throw Object.assign(
      new Error("Password-based user management is not supported"),
      { status: 400 },
    );
  }

  if (config.variantOptions && (creating || Object.hasOwn(data, "options"))) {
    const options = data.options;
    if (
      !Array.isArray(options) ||
      options.some(
        (option) =>
          !isRecord(option) ||
          typeof option.name !== "string" ||
          !option.name.trim() ||
          typeof option.value !== "string" ||
          !option.value.trim(),
      )
    ) {
      throw Object.assign(
        new Error(
          "options must contain objects with non-empty string name and value fields",
        ),
        { status: 400 },
      );
    }
  }

  if (
    config.productStatus &&
    Object.hasOwn(data, "status") &&
    !["IN_STOCK", "OUT_OF_STOCK", "UPCOMING", "COMING_SOON"].includes(
      String(data.status),
    )
  ) {
    throw Object.assign(
      new Error(
        "status must be IN_STOCK, OUT_OF_STOCK, UPCOMING, or COMING_SOON",
      ),
      { status: 400 },
    );
  }
}

export function createCrudService(
  delegateName: string,
  config: CrudConfig,
): CrudService {
  const delegate = (prisma as unknown as Record<string, CrudDelegate>)[
    delegateName
  ];
  if (!delegate) {
    throw new Error(`Unknown Prisma delegate: ${delegateName}`);
  }

  return {
    async list(page, limit): Promise<CrudPage> {
      const where = config.publicWhere;
      const [records, total] = await Promise.all([
        delegate.findMany({
          skip: (page - 1) * limit,
          take: limit,
          ...(where ? { where } : {}),
        }),
        delegate.count(where ? { where } : undefined),
      ]);

      return {
        items: records.map((record) => sanitizeRecord(config, record)),
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      };
    },

    async getById(id) {
      const record = await delegate.findFirst({
        where: { id, ...(config.publicWhere ?? {}) },
      });
      if (!record) {
        throw Object.assign(new Error(`${config.path} record not found`), {
          status: 404,
        });
      }
      return sanitizeRecord(config, record);
    },

    async create(data) {
      validateInput(config, data, true);
      const record = await delegate.create({ data });
      return sanitizeRecord(config, record);
    },

    async update(id, data) {
      validateInput(config, data, false);
      const record = await delegate.update({ where: { id }, data });
      return sanitizeRecord(config, record);
    },

    async delete(id) {
      const record = await delegate.delete({ where: { id } });
      return sanitizeRecord(config, record);
    },
  };
}
