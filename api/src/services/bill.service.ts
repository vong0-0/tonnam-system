import mongoose, { type Types } from "mongoose";
import { type IBill, BillModel } from "@/models/bill.model.js";
import { type ITable, TableModel } from "@/models/table.model.js";
import { type IOrder, OrderModel } from "@/models/order.model.js";
import { type IOrderItem, OrderItemModel } from "@/models/order-item.model.js";
import { type IMenuItem, MenuItemModel } from "@/models/menu-item.model.js";
import { type IPayment, PaymentModel } from "@/models/payment.model.js";
import { UserModel } from "@/models/user.model.js";
import { createAuditLog } from "@/services/audit-log.service.js";
import {
  BillStatus,
  OrderItemStatus,
  type TableStatus,
  type Pagination,
} from "@/types/index.js";
import logger from "@/utils/logger.js";
import { problem } from "@/utils/problem.js";
import { successList, type SuccessListResponse } from "@/utils/response.js";
import { io } from "@/websocket/handlers.js";
import { WS_EVENTS } from "@/websocket/events.js";

interface CounterDoc {
  _id: string;
  seq: number;
}

interface ActorInput {
  id: string;
  username: string;
  role: string;
}

interface OrderWithItems {
  order: IOrder;
  items: IOrderItem[];
}

export interface BillDetail {
  bill: IBill;
  created_by_name: string;
  table: { id: Types.ObjectId; table_name: string; status: TableStatus } | null;
  orders: OrderWithItems[];
  payments: IPayment[];
}

interface CreateBillInput {
  table_id: string;
  name: string;
  created_by: string;
}

interface ListBillsQuery {
  page?: number;
  limit?: number;
  table_id?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

interface UpdateBillInput {
  id: string;
  name?: string;
  reason: string;
  actor: ActorInput;
}

interface CancelBillInput {
  id: string;
  reason: string;
  actor: ActorInput;
}

interface SplitBillEntry {
  name?: string;
  order_item_ids: string[];
}

interface SplitBillInput {
  id: string;
  splits: SplitBillEntry[];
  actor: ActorInput;
}

export interface SplitBillResult {
  parent_bill: IBill;
  sub_bills: IBill[];
}

async function generateBillShortId(): Promise<string> {
  const result = await mongoose.connection
    .collection<CounterDoc>("counters")
    .findOneAndUpdate(
      { _id: "bill" },
      { $inc: { seq: 1 } },
      { returnDocument: "after", upsert: true },
    );
  const seq = result?.seq ?? 1;
  return `B-${seq.toString().padStart(4, "0")}`;
}

export async function createBill(input: CreateBillInput): Promise<IBill> {
  if (!mongoose.Types.ObjectId.isValid(input.table_id)) {
    throw problem({
      type: "not-found",
      title: "Not Found",
      status: 404,
      detail: "Table not found.",
      instance: "/v1/bills",
    });
  }

  const table = await TableModel.findById(input.table_id);
  if (!table) {
    throw problem({
      type: "not-found",
      title: "Not Found",
      status: 404,
      detail: "Table not found.",
      instance: "/v1/bills",
    });
  }

  if (table.status !== "OCCUPIED" && table.status !== "PAID") {
    throw problem({
      type: "TABLE_NOT_OCCUPIED",
      title: "Conflict",
      status: 409,
      detail: "Table must be occupied or in paid status to open a bill.",
      instance: "/v1/bills",
    });
  }

  const short_id = await generateBillShortId();

  const bill = await BillModel.create({
    short_id,
    name: input.name,
    table_id: new mongoose.Types.ObjectId(input.table_id),
    status: BillStatus.OPEN,
    total_amount: 0,
    created_by: new mongoose.Types.ObjectId(input.created_by),
  });

  table.bill_ids.push(bill._id);

  if (table.status === "PAID") {
    table.status = "OCCUPIED";
  }

  await table.save();

  logger.info("Bill created", {
    billId: String(bill._id),
    shortId: short_id,
    tableId: input.table_id,
  });

  const billChannel = `bill:${String(bill._id)}`;
  const tableChannel = `table:${String(bill.table_id)}`;
  io.to(billChannel).emit(
    "message",
    JSON.stringify({
      event: WS_EVENTS.BILL_CREATED,
      channel: billChannel,
      data: { bill },
      timestamp: new Date().toISOString(),
    }),
  );
  io.to(tableChannel).emit(
    "message",
    JSON.stringify({
      event: WS_EVENTS.BILL_CREATED,
      channel: tableChannel,
      data: { bill },
      timestamp: new Date().toISOString(),
    }),
  );

  return bill;
}

export async function getBillById(id: string): Promise<BillDetail> {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw problem({
      type: "not-found",
      title: "Not Found",
      status: 404,
      detail: "Bill not found.",
      instance: `/v1/bills/${id}`,
    });
  }

  const bill = (await BillModel.findById(id).lean()) as IBill | null;
  if (!bill) {
    throw problem({
      type: "not-found",
      title: "Not Found",
      status: 404,
      detail: "Bill not found.",
      instance: `/v1/bills/${id}`,
    });
  }

  const tableDoc = (await TableModel.findById(
    bill.table_id,
  ).lean()) as ITable | null;
  const table = tableDoc
    ? {
        id: tableDoc._id as Types.ObjectId,
        table_name: tableDoc.table_name,
        status: tableDoc.status,
      }
    : null;

  const rawOrders = (await OrderModel.find({
    bill_id: bill._id,
  }).lean()) as IOrder[];

  const orders: OrderWithItems[] = await Promise.all(
    rawOrders.map(async (order) => {
      const items = (await OrderItemModel.find({
        order_id: order._id,
      }).lean()) as IOrderItem[];

      const missingNameIds = items
        .filter((item) => !item.name)
        .map((item) => item.menu_item_id);

      if (missingNameIds.length > 0) {
        const menuItems = (await MenuItemModel.find({
          _id: { $in: missingNameIds },
        })
          .select("name")
          .lean()) as IMenuItem[];
        const nameMap = new Map(
          menuItems.map((m) => [String(m._id), m.name]),
        );
        items.forEach((item) => {
          if (!item.name) {
            item.name = nameMap.get(String(item.menu_item_id)) ?? "";
          }
        });
      }

      return { order, items };
    }),
  );

  const payments = (await PaymentModel.find({
    bill_id: bill._id,
  }).lean()) as IPayment[];

  const creator = (await UserModel.findById(bill.created_by)
    .select("first_name last_name")
    .lean()) as { first_name: string; last_name: string } | null;
  const created_by_name = creator
    ? `${creator.first_name} ${creator.last_name}`.trim()
    : String(bill.created_by);

  return { bill, created_by_name, table, orders, payments };
}

export async function listBills(
  query: ListBillsQuery,
): Promise<SuccessListResponse<IBill>> {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const { table_id, status, date_from, date_to, search } = query;

  const filter: Record<string, unknown> = {};
  if (search !== undefined && search !== "") filter["short_id"] = { $regex: search, $options: "i" };
  if (table_id !== undefined) filter["table_id"] = table_id;
  if (status !== undefined) filter["status"] = status;
  if (date_from !== undefined || date_to !== undefined) {
    const createdAtFilter: Record<string, Date> = {};
    if (date_from !== undefined) createdAtFilter["$gte"] = new Date(date_from);
    if (date_to !== undefined) {
      const to = new Date(date_to);
      to.setUTCHours(23, 59, 59, 999);
      createdAtFilter["$lte"] = to;
    }
    filter["createdAt"] = createdAtFilter;
  }

  const skip = (page - 1) * limit;
  const [rawItems, total] = await Promise.all([
    BillModel.find(filter)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    BillModel.countDocuments(filter),
  ]);

  const items = rawItems as IBill[];
  const totalPages = Math.ceil(total / limit);
  const pagination: Pagination = { page, limit, total, totalPages };

  return successList(items, pagination, "Bills retrieved successfully");
}

export async function updateBill(input: UpdateBillInput): Promise<IBill> {
  if (!mongoose.Types.ObjectId.isValid(input.id)) {
    throw problem({
      type: "not-found",
      title: "Not Found",
      status: 404,
      detail: "Bill not found.",
      instance: `/v1/bills/${input.id}`,
    });
  }

  const bill = await BillModel.findById(input.id);
  if (!bill) {
    throw problem({
      type: "not-found",
      title: "Not Found",
      status: 404,
      detail: "Bill not found.",
      instance: `/v1/bills/${input.id}`,
    });
  }

  if (bill.status === BillStatus.CANCELLED) {
    throw problem({
      type: "BILL_CANCELLED",
      title: "Conflict",
      status: 409,
      detail: "Cannot edit a cancelled bill.",
      instance: `/v1/bills/${input.id}`,
    });
  }

  const beforeState = { name: bill.name };

  if (input.name !== undefined) {
    bill.name = input.name;
  }
  await bill.save();

  await createAuditLog({
    actor: input.actor,
    action: "UPDATE_BILL",
    entity_name: "Bill",
    entity_id: bill._id as Types.ObjectId,
    reason: input.reason,
    before_state: beforeState,
    after_state: { name: bill.name },
  });

  logger.info("Bill updated", { billId: input.id, reason: input.reason });

  const billChannel = `bill:${String(bill._id)}`;
  io.to(billChannel).emit(
    "message",
    JSON.stringify({
      event: WS_EVENTS.BILL_UPDATED,
      channel: billChannel,
      data: { bill },
      timestamp: new Date().toISOString(),
    }),
  );

  return bill;
}

export async function cancelBill(input: CancelBillInput): Promise<IBill> {
  if (!mongoose.Types.ObjectId.isValid(input.id)) {
    throw problem({
      type: "not-found",
      title: "Not Found",
      status: 404,
      detail: "Bill not found.",
      instance: `/v1/bills/${input.id}`,
    });
  }

  const bill = await BillModel.findById(input.id);
  if (!bill) {
    throw problem({
      type: "not-found",
      title: "Not Found",
      status: 404,
      detail: "Bill not found.",
      instance: `/v1/bills/${input.id}`,
    });
  }

  if (bill.status !== BillStatus.OPEN) {
    throw problem({
      type: "BILL_NOT_OPEN",
      title: "Conflict",
      status: 409,
      detail: `Bill cannot be cancelled because its status is ${bill.status}.`,
      instance: `/v1/bills/${input.id}`,
    });
  }

  bill.status = BillStatus.CANCELLED;
  bill.cancel_reason = input.reason;
  await bill.save();

  const orders = (await OrderModel.find({
    bill_id: bill._id,
  }).lean()) as IOrder[];
  const orderIds = orders.map((o) => o._id);
  await OrderItemModel.updateMany(
    { order_id: { $in: orderIds }, status: null },
    { $set: { status: OrderItemStatus.CANCELLED } },
  );

  // Cancel any other open bills on the same table so the table clears cleanly
  const otherOpenBills = (await BillModel.find({
    table_id: bill.table_id,
    status: BillStatus.OPEN,
    _id: { $ne: bill._id },
  }).lean()) as IBill[];

  if (otherOpenBills.length > 0) {
    const otherBillIds = otherOpenBills.map((b) => b._id);
    await BillModel.updateMany(
      { _id: { $in: otherBillIds } },
      { $set: { status: BillStatus.CANCELLED, cancel_reason: input.reason } },
    );
    const otherOrders = (await OrderModel.find({
      bill_id: { $in: otherBillIds },
    }).lean()) as IOrder[];
    const otherOrderIds = otherOrders.map((o) => o._id);
    await OrderItemModel.updateMany(
      { order_id: { $in: otherOrderIds }, status: null },
      { $set: { status: OrderItemStatus.CANCELLED } },
    );
  }

  await TableModel.findByIdAndUpdate(bill.table_id, { status: "AVAILABLE", bill_ids: [] });

  await createAuditLog({
    actor: input.actor,
    action: "CANCEL_BILL",
    entity_name: "Bill",
    entity_id: bill._id as Types.ObjectId,
    reason: input.reason,
    before_state: { status: "OPEN" },
    after_state: { status: BillStatus.CANCELLED },
  });

  logger.info("Bill cancelled", { billId: input.id, reason: input.reason });

  const billChannel = `bill:${String(bill._id)}`;
  const tableChannel = `table:${String(bill.table_id)}`;
  io.to(billChannel).emit(
    "message",
    JSON.stringify({
      event: WS_EVENTS.BILL_STATUS_UPDATED,
      channel: billChannel,
      data: { bill_id: String(bill._id), status: bill.status },
      timestamp: new Date().toISOString(),
    }),
  );
  io.to(tableChannel).emit(
    "message",
    JSON.stringify({
      event: WS_EVENTS.BILL_STATUS_UPDATED,
      channel: tableChannel,
      data: { bill_id: String(bill._id), status: bill.status },
      timestamp: new Date().toISOString(),
    }),
  );

  return bill;
}

export async function splitBill(
  input: SplitBillInput,
): Promise<SplitBillResult> {
  if (!mongoose.Types.ObjectId.isValid(input.id)) {
    throw problem({
      type: "not-found",
      title: "Not Found",
      status: 404,
      detail: "Bill not found.",
      instance: `/v1/bills/${input.id}/split`,
    });
  }

  const parentBill = await BillModel.findById(input.id);
  if (!parentBill) {
    throw problem({
      type: "not-found",
      title: "Not Found",
      status: 404,
      detail: "Bill not found.",
      instance: `/v1/bills/${input.id}/split`,
    });
  }

  if (parentBill.status !== BillStatus.OPEN) {
    throw problem({
      type: "BILL_NOT_OPEN",
      title: "Conflict",
      status: 409,
      detail: `Bill cannot be split because its status is ${parentBill.status}.`,
      instance: `/v1/bills/${input.id}/split`,
    });
  }

  const orders = (await OrderModel.find({
    bill_id: parentBill._id,
  }).lean()) as IOrder[];
  const orderIds = orders.map((o) => o._id);
  const allActiveItems = (await OrderItemModel.find({
    order_id: { $in: orderIds },
    status: { $ne: OrderItemStatus.CANCELLED },
  }).lean()) as IOrderItem[];

  const activeItemIdSet = new Set(
    allActiveItems.map((item) => String(item._id)),
  );

  const seenItemIds = new Set<string>();
  for (const entry of input.splits) {
    for (const itemId of entry.order_item_ids) {
      if (seenItemIds.has(itemId)) {
        throw problem({
          type: "validation-error",
          title: "Validation Error",
          status: 400,
          detail: `Order item ${itemId} appears in more than one sub-bill.`,
          instance: `/v1/bills/${input.id}/split`,
        });
      }
      seenItemIds.add(itemId);
    }
  }

  for (const itemId of activeItemIdSet) {
    if (!seenItemIds.has(itemId)) {
      throw problem({
        type: "validation-error",
        title: "Validation Error",
        status: 400,
        detail: `Order item ${itemId} is not assigned to any sub-bill.`,
        instance: `/v1/bills/${input.id}/split`,
      });
    }
  }

  const itemMap = new Map(
    allActiveItems.map((item) => [String(item._id), item]),
  );

  const session = await mongoose.startSession();
  let subBills: IBill[] = [];

  try {
    session.startTransaction();

    subBills = await Promise.all(
      input.splits.map(async (entry, index) => {
        const label = entry.name ?? String.fromCharCode(65 + index); // A, B, C…
        const subShortId = `${parentBill.short_id}/${label}`;
        const totalAmount = entry.order_item_ids.reduce((sum, itemId) => {
          const item = itemMap.get(itemId);
          return item !== undefined
            ? sum + item.unit_price * item.quantity
            : sum;
        }, 0);

        const docs = await BillModel.create(
          [
            {
              short_id: subShortId,
              name: entry.name ?? `${parentBill.name}/${label}`,
              table_id: parentBill.table_id,
              parent_bill_id: parentBill._id,
              split_label: label,
              status: BillStatus.OPEN,
              total_amount: totalAmount,
              created_by: new mongoose.Types.ObjectId(input.actor.id),
            },
          ],
          { session },
        );
        return docs[0] as IBill;
      }),
    );

    parentBill.status = BillStatus.CANCELLED;
    parentBill.cancel_reason = "Split into sub-bills";
    await parentBill.save({ session });

    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }

  await createAuditLog({
    actor: input.actor,
    action: "SPLIT_BILL",
    entity_name: "Bill",
    entity_id: parentBill._id as Types.ObjectId,
    reason: "Bill split by staff",
    before_state: { status: "OPEN", total_amount: parentBill.total_amount },
    after_state: {
      sub_bills: subBills.map((b) => ({
        short_id: b.short_id,
        label: b.split_label,
        total_amount: b.total_amount,
      })),
    },
  });

  logger.info("Bill split", {
    parentBillId: input.id,
    subBillCount: subBills.length,
  });

  const billChannel = `bill:${String(parentBill._id)}`;
  const tableChannel = `table:${String(parentBill.table_id)}`;
  io.to(billChannel).emit(
    "message",
    JSON.stringify({
      event: WS_EVENTS.BILL_STATUS_UPDATED,
      channel: billChannel,
      data: { bill_id: String(parentBill._id), status: parentBill.status },
      timestamp: new Date().toISOString(),
    }),
  );
  io.to(tableChannel).emit(
    "message",
    JSON.stringify({
      event: WS_EVENTS.BILL_STATUS_UPDATED,
      channel: tableChannel,
      data: { bill_id: String(parentBill._id), status: parentBill.status },
      timestamp: new Date().toISOString(),
    }),
  );

  return { parent_bill: parentBill, sub_bills: subBills };
}

export async function recalculateBillTotal(bill_id: string): Promise<IBill> {
  const orders = (await OrderModel.find({ bill_id }).lean()) as IOrder[];
  const orderIds = orders.map((o) => o._id);

  const activeItems = (await OrderItemModel.find({
    order_id: { $in: orderIds },
    status: { $ne: OrderItemStatus.CANCELLED },
  })
    .select("unit_price quantity")
    .lean()) as IOrderItem[];

  const total = activeItems.reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0,
  );

  const updated = await BillModel.findByIdAndUpdate(
    bill_id,
    { total_amount: total },
    { new: true },
  );
  if (!updated) {
    throw problem({
      type: "not-found",
      title: "Not Found",
      status: 404,
      detail: "Bill not found.",
      instance: `/v1/bills/${bill_id}`,
    });
  }

  return updated;
}
