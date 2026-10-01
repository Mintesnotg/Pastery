import {
  countAdminProducts,
  createProduct,
  deactivateProductById,
  findProductById,
  listAdminProducts,
  listPublicProducts,
  updateProductById,
} from "./product.repository.js";
import {
  toProductAdminDto,
  toProductCreateInput,
  toProductPublicDto,
  toProductUpdateInput,
  type ProductWriteInput,
} from "./product.mapper.js";

function parseBool(value: unknown): boolean | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (value === true || value === "true" || value === "1") return true;
  if (value === false || value === "false" || value === "0") return false;
  return undefined;
}

export async function getPublicProducts(query: {
  isSpecial?: unknown;
  categoryId?: unknown;
  category?: unknown;
}) {
  const isSpecial = parseBool(query.isSpecial);
  const categoryIdRaw = query.categoryId;
  const categoryId =
    categoryIdRaw !== undefined && categoryIdRaw !== ""
      ? Number(categoryIdRaw)
      : undefined;
  const categoryName =
    typeof query.category === "string" && query.category.trim()
      ? query.category.trim()
      : undefined;

  const rows = await listPublicProducts({
    isSpecial,
    categoryId: Number.isFinite(categoryId) ? categoryId : undefined,
    categoryName,
  });
  return rows.map(toProductPublicDto);
}

export async function getAdminProducts(options: {
  page?: number;
  pageSize?: number;
  includeInactive?: boolean;
  search?: string;
} = {}) {
  const page = Math.max(1, options.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, options.pageSize ?? 20));
  const offset = (page - 1) * pageSize;
  const includeInactive = options.includeInactive ?? true;

  const [rows, total] = await Promise.all([
    listAdminProducts({
      limit: pageSize,
      offset,
      includeInactive,
      search: options.search,
    }),
    countAdminProducts({ includeInactive, search: options.search }),
  ]);

  return {
    data: rows.map(toProductAdminDto),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize) || 1,
  };
}

export async function getProduct(id: number) {
  const row = await findProductById(id);
  return row ? toProductAdminDto(row) : null;
}

export async function createNewProduct(input: ProductWriteInput, actorId?: string | null) {
  const created = await createProduct(toProductCreateInput(input, actorId));
  return toProductAdminDto(created);
}

export async function updateProduct(
  id: number,
  input: Partial<ProductWriteInput>,
  actorId?: string | null,
) {
  const updated = await updateProductById(id, toProductUpdateInput(input, actorId));
  return updated ? toProductAdminDto(updated) : null;
}

export async function deleteProduct(id: number, actorId?: string | null) {
  const deleted = await deactivateProductById(id, actorId);
  return deleted ? toProductAdminDto(deleted) : null;
}
