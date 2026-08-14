import {
  eq,
  sql,
  type SQL,
  type InferInsertModel,
  type InferSelectModel,
} from "drizzle-orm";
import { db } from "../db/index.js";
import type { AnyPgColumn, AnyPgTable } from "drizzle-orm/pg-core";

type FindManyOptions = {
  where?: SQL<unknown>;
  limit?: number;
  offset?: number;
  orderBy?: SQL<unknown>;
};

export function createGenericRepository<TTable extends AnyPgTable, TIdColumn extends AnyPgColumn>(
  table: TTable,
  idColumn: TIdColumn
) {
  type Insert = InferInsertModel<TTable>;
  type Id = TIdColumn["_"]["data"];

  const findMany = async (options: FindManyOptions = {}) => {
    let query = db.select().from(table as any) as any;
    if (options.where) {
      query = query.where(options.where);
    }
    if (options.orderBy) {
      query = query.orderBy(options.orderBy);
    }
    if (typeof options.limit === "number") {
      query = query.limit(options.limit);
    }
    if (typeof options.offset === "number") {
      query = query.offset(options.offset);
    }
    return (await query) as InferSelectModel<TTable>[];
  };

  const findById = async (id: Id) => findOne(eq(idColumn, id));

  const findOne = async (where?: SQL<unknown>) => {
    const baseQuery = db.select().from(table as any) as any;
    const rows = (await (where ? baseQuery.where(where).limit(1) : baseQuery.limit(1))) as InferSelectModel<TTable>[];
    const [row] = rows;
    return row ?? null;
  };

  const create = async (values: Insert) => {
    const result = await (db.insert(table as any).values(values as any).returning() as unknown as Promise<
      InferSelectModel<TTable>[]
    >);
    const [created] = result;
    return created;
  };

  const createMany = async (values: Insert[]) => {
    if (values.length === 0) return [];
    return (await (db.insert(table as any).values(values as any).returning() as unknown as Promise<InferSelectModel<TTable>[]>));
  };

  const updateById = async (id: Id, values: Partial<Insert>) => {
    const result = await (db.update(table as any).set(values as any).where(eq(idColumn, id)).returning() as unknown as Promise<
      InferSelectModel<TTable>[]
    >);
    const [updated] = result;
    return updated ?? null;
  };

  const deleteById = async (id: Id) => {
    const result = await (db.delete(table as any).where(eq(idColumn, id)).returning() as unknown as Promise<
      InferSelectModel<TTable>[]
    >);
    const [deleted] = result;
    return deleted ?? null;
  };

  const exists = async (where: SQL<unknown>) => {
    const result = await (db.select({ value: sql<number>`count(*)` }).from(table as any).where(where) as unknown as Promise<
      Array<{ value: number | string }>
    >);
    const [row] = result;
    return Number(row?.value ?? 0) > 0;
  };

  const count = async (where?: SQL<unknown>) => {
    const rows = where
      ? await (db.select({ value: sql<number>`count(*)` }).from(table as any).where(where) as unknown as Promise<
          Array<{ value: number | string }>
        >)
      : await (db.select({ value: sql<number>`count(*)` }).from(table as any) as unknown as Promise<Array<{ value: number | string }>>);
    return Number(rows[0]?.value ?? 0);
  };

  return {
    findMany,
    findById,
    findOne,
    create,
    createMany,
    updateById,
    deleteById,
    exists,
    count,
  };
}
