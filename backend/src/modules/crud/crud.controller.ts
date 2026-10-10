import type { RequestHandler } from "express";
import { errorResponse, successResponse } from "../../utils/apiResponse.js";
import type { CrudController, CrudRecord, CrudService } from "./crud.types.js";

function isRecord(value: unknown): value is CrudRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function createCrudController(
  service: CrudService,
  resourceName: string,
): CrudController {
  const list: RequestHandler = async (request, response) => {
    const page = Math.max(
      1,
      Number.parseInt(String(request.query.page ?? "1"), 10) || 1,
    );
    const limit = Math.min(
      100,
      Math.max(
        1,
        Number.parseInt(String(request.query.limit ?? "20"), 10) || 20,
      ),
    );
    successResponse(
      response,
      `${resourceName} loaded`,
      await service.list(page, limit),
    );
  };

  const getById: RequestHandler = async (request, response) => {
    const id = request.params.id;
    if (typeof id !== "string") {
      errorResponse(response, 400, "A valid record id is required");
      return;
    }
    successResponse(
      response,
      `${resourceName} record loaded`,
      await service.getById(id),
    );
  };

  const create: RequestHandler = async (request, response) => {
    if (!isRecord(request.body)) {
      errorResponse(response, 400, "A JSON object body is required");
      return;
    }
    successResponse(
      response,
      `${resourceName} record created`,
      await service.create(request.body),
      201,
    );
  };

  const update: RequestHandler = async (request, response) => {
    const id = request.params.id;
    if (typeof id !== "string" || !isRecord(request.body)) {
      errorResponse(
        response,
        400,
        "A valid record id and JSON object body are required",
      );
      return;
    }
    successResponse(
      response,
      `${resourceName} record updated`,
      await service.update(id, request.body),
    );
  };

  const remove: RequestHandler = async (request, response) => {
    const id = request.params.id;
    if (typeof id !== "string") {
      errorResponse(response, 400, "A valid record id is required");
      return;
    }
    successResponse(
      response,
      `${resourceName} record deleted`,
      await service.delete(id),
    );
  };

  return { list, getById, create, update, delete: remove };
}
