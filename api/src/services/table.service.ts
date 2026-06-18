import mongoose from "mongoose";
import { TableModel, type ITable } from "@/models/table.model.js";
import {
  type CreateTableInput,
  type UpdateTableInput,
  type UpdateTableStatusInput,
} from "@/schemas/table.schema.js";
import { type Pagination, type TableStatus, type Role } from "@/types/index.js";
import logger from "@/utils/logger.js";
import { problem } from "@/utils/problem.js";
import { successList, type SuccessListResponse } from "@/utils/response.js";
import { io } from "@/websocket/handlers.js";
import { WS_EVENTS } from "@/websocket/events.js";

interface ListTablesQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: TableStatus;
  is_temporary?: boolean;
}

interface MoveTableInput {
  target_table_id: string;
}

interface MoveTableResult {
  from_table: { id: string; table_name: string; status: TableStatus };
  to_table: { id: string; table_name: string; status: TableStatus };
}

export async function listTables(
  query: ListTablesQuery,
): Promise<SuccessListResponse<ITable>> {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const { search, status, is_temporary } = query;

  const filter: Record<string, unknown> = {};

  if (search !== undefined) filter["table_name"] = new RegExp(search, "i");
  if (status !== undefined) filter["status"] = status;
  if (is_temporary !== undefined) filter["is_temporary"] = is_temporary;

  const skip = (page - 1) * limit;
  const [rawItems, total] = await Promise.all([
    TableModel.find(filter).skip(skip).limit(limit).lean(),
    TableModel.countDocuments(filter),
  ]);

  const items = rawItems as ITable[];
  const totalPages = Math.ceil(total / limit);
  const pagination: Pagination = { page, limit, total, totalPages };

  return successList(items, pagination, "Tables retrieved successfully");
}

export async function getTableById(id: string): Promise<ITable> {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw problem({
      type: "validation-error",
      title: "Validation Error",
      status: 400,
      detail: "Invalid table ID format.",
      instance: `/v1/tables/${id}`,
    });
  }

  const table = (await TableModel.findById(id).lean()) as ITable | null;
  if (!table) {
    throw problem({
      type: "not-found",
      title: "Not Found",
      status: 404,
      detail: "Table not found.",
      instance: `/v1/tables/${id}`,
    });
  }

  return table;
}

export async function createTable(input: CreateTableInput): Promise<ITable> {
  const existing = await TableModel.findOne({ table_name: input.table_name });
  if (existing) {
    throw problem({
      type: "conflict",
      title: "Conflict",
      status: 409,
      detail: "A table with this name already exists.",
      instance: "/v1/tables",
    });
  }

  const table = await TableModel.create(input);
  logger.info("Table created", {
    tableId: String(table._id),
    table_name: table.table_name,
  });

  io.to("tables").emit(
    "message",
    JSON.stringify({
      event: WS_EVENTS.TABLE_CREATED,
      channel: "tables",
      data: { table_id: String(table._id) },
      timestamp: new Date().toISOString(),
    }),
  );

  return table;
}

export async function updateTable(
  id: string,
  input: UpdateTableInput,
): Promise<ITable> {
  await getTableById(id);

  if (input.table_name !== undefined) {
    const dup = await TableModel.findOne({
      table_name: input.table_name,
      _id: { $ne: id },
    });
    if (dup) {
      throw problem({
        type: "conflict",
        title: "Conflict",
        status: 409,
        detail: "A table with this name already exists.",
        instance: `/v1/tables/${id}`,
      });
    }
  }

  const updated = await TableModel.findByIdAndUpdate(id, input, {
    new: true,
    runValidators: true,
  });
  if (!updated) {
    throw problem({
      type: "not-found",
      title: "Not Found",
      status: 404,
      detail: "Table not found.",
      instance: `/v1/tables/${id}`,
    });
  }

  io.to("tables").emit(
    "message",
    JSON.stringify({
      event: WS_EVENTS.TABLE_UPDATED,
      channel: "tables",
      data: { table_id: id },
      timestamp: new Date().toISOString(),
    }),
  );

  return updated;
}

export async function deleteTable(id: string): Promise<null> {
  const table = await getTableById(id);

  if (table.bill_ids.length > 0) {
    throw problem({
      type: "conflict",
      title: "Conflict",
      status: 409,
      detail: "Cannot delete a table that has pending bills.",
      instance: `/v1/tables/${id}`,
    });
  }

  await TableModel.findByIdAndDelete(id);
  logger.info("Table deleted", { tableId: id });

  io.to("tables").emit(
    "message",
    JSON.stringify({
      event: WS_EVENTS.TABLE_DELETED,
      channel: "tables",
      data: { table_id: id },
      timestamp: new Date().toISOString(),
    }),
  );

  return null;
}

export async function updateTableStatus(
  id: string,
  input: UpdateTableStatusInput,
  _role?: Role,
): Promise<ITable> {
  const table = await getTableById(id);
  const currentStatus = table.status;
  const targetStatus = input.status;

  // if (role === 'WAITER' && !(currentStatus === 'PAID' && targetStatus === 'AVAILABLE')) {
  //   throw problem({
  //     type: 'forbidden',
  //     title: 'Forbidden',
  //     status: 403,
  //     detail: 'Waiters can only transition table status from PAID to AVAILABLE.',
  //     instance: `/v1/tables/${id}/status`,
  //   })
  // }

  const allowed =
    (currentStatus === "AVAILABLE" && targetStatus === "OCCUPIED") ||
    (currentStatus === "OCCUPIED" && targetStatus === "AVAILABLE") ||
    (currentStatus === "PAID" && targetStatus === "AVAILABLE");

  if (!allowed) {
    throw problem({
      type: "invalid-status-transition",
      title: "Invalid Status Transition",
      status: 400,
      detail: `Cannot transition table status from ${currentStatus} to ${targetStatus}.`,
      instance: `/v1/tables/${id}/status`,
    });
  }

  if (
    currentStatus === "OCCUPIED" &&
    targetStatus === "AVAILABLE" &&
    table.bill_ids.length > 0
  ) {
    throw problem({
      type: "conflict",
      title: "Conflict",
      status: 409,
      detail: "Cannot set table to AVAILABLE while it has pending bills.",
      instance: `/v1/tables/${id}/status`,
    });
  }

  const update: Record<string, unknown> = { status: targetStatus };
  if (currentStatus === "PAID" && targetStatus === "AVAILABLE") {
    update["bill_ids"] = [];
  }

  const updated = await TableModel.findByIdAndUpdate(id, update, { new: true });
  if (!updated) {
    throw problem({
      type: "not-found",
      title: "Not Found",
      status: 404,
      detail: "Table not found.",
      instance: `/v1/tables/${id}/status`,
    });
  }

  io.to("tables").emit(
    "message",
    JSON.stringify({
      event: WS_EVENTS.TABLE_STATUS_UPDATED,
      channel: "tables",
      data: { table_id: id, status: targetStatus },
      timestamp: new Date().toISOString(),
    }),
  );
  const tableSpecificChannel = `table:${id}`;
  io.to(tableSpecificChannel).emit(
    "message",
    JSON.stringify({
      event: WS_EVENTS.TABLE_STATUS_UPDATED,
      channel: tableSpecificChannel,
      data: { table_id: id, status: targetStatus },
      timestamp: new Date().toISOString(),
    }),
  );

  return updated;
}

export async function moveTable(
  sourceId: string,
  input: MoveTableInput,
): Promise<MoveTableResult> {
  const { target_table_id } = input;

  if (sourceId === target_table_id) {
    throw problem({
      type: "same-table-move",
      title: "Same Table Move",
      status: 400,
      detail: "Source and target table must be different.",
      instance: `/v1/tables/${sourceId}/move`,
    });
  }

  const [source, target] = await Promise.all([
    getTableById(sourceId),
    getTableById(target_table_id),
  ]);

  if (source.bill_ids.length === 0) {
    throw problem({
      type: "conflict",
      title: "Conflict",
      status: 409,
      detail: "Source table has no bills to transfer.",
      instance: `/v1/tables/${sourceId}/move`,
    });
  }

  if (target.status === "OCCUPIED") {
    throw problem({
      type: "conflict",
      title: "Conflict",
      status: 409,
      detail:
        "Target table is occupied. Use POST /table-merge-groups to merge tables instead.",
      instance: `/v1/tables/${sourceId}/move`,
    });
  }

  await Promise.all([
    TableModel.findByIdAndUpdate(target._id, {
      bill_ids: [...target.bill_ids, ...source.bill_ids],
      status: "OCCUPIED",
    }),
    TableModel.findByIdAndUpdate(source._id, {
      bill_ids: [],
      status: "AVAILABLE",
    }),
  ]);

  logger.info("Table move completed", {
    from: sourceId,
    to: target_table_id,
    bills: source.bill_ids.map(String),
  });

  io.to("tables").emit(
    "message",
    JSON.stringify({
      event: WS_EVENTS.TABLE_MOVED,
      channel: "tables",
      data: {
        from_table_id: sourceId,
        to_table_id: target_table_id,
        bill_ids: source.bill_ids.map(String),
      },
      timestamp: new Date().toISOString(),
    }),
  );

  return {
    from_table: {
      id: String(source._id),
      table_name: source.table_name,
      status: "AVAILABLE",
    },
    to_table: {
      id: String(target._id),
      table_name: target.table_name,
      status: "OCCUPIED",
    },
  };
}
