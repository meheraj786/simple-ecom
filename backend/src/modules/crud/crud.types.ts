export type CrudRecord = Record<string, unknown>;

export type CrudDelegate = {
  findMany(args: {
    skip: number;
    take: number;
    where?: CrudRecord;
    orderBy?: CrudRecord;
  }): Promise<unknown[]>;
  findFirst(args: { where: CrudRecord }): Promise<unknown | null>;
  count(args?: { where?: CrudRecord }): Promise<number>;
  create(args: { data: CrudRecord }): Promise<unknown>;
  update(args: { where: { id: string }; data: CrudRecord }): Promise<unknown>;
  delete(args: { where: { id: string } }): Promise<unknown>;
};

export type CrudConfig = {
  path: string;
  publicRead?: boolean;
  publicWhere?: CrudRecord;
  orderBy?: CrudRecord;
  hidePassword?: boolean;
  variantOptions?: boolean;
  productStatus?: boolean;
};

export type CrudPage = {
  items: unknown[];
  pagination: { page: number; limit: number; total: number; pages: number };
};

export type CrudService = {
  list(page: number, limit: number): Promise<CrudPage>;
  getById(id: string): Promise<unknown>;
  create(data: CrudRecord): Promise<unknown>;
  update(id: string, data: CrudRecord): Promise<unknown>;
  delete(id: string): Promise<unknown>;
};

export type CrudController = {
  list: import("express").RequestHandler;
  getById: import("express").RequestHandler;
  create: import("express").RequestHandler;
  update: import("express").RequestHandler;
  delete: import("express").RequestHandler;
};
