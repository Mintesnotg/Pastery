import {
  countAdminCategories,
  createCategory,
  deactivateCategoryById,
  findCategoryById,
  listActiveCategories,
  listAdminCategories,
  updateCategoryById,
} from "./productCategory.repository.js";
import {
  toCategoryAdminDto,
  toCategoryCreateInput,
  toCategoryPublicDto,
  toCategoryUpdateInput,
  type CategoryWriteInput,
} from "./productCategory.mapper.js";

export async function getPublicCategories() {
  const rows = await listActiveCategories();
  return rows.map(toCategoryPublicDto);
}

export async function getAdminCategories(options: {
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
    listAdminCategories({
      limit: pageSize,
      offset,
      includeInactive,
      search: options.search,
    }),
    countAdminCategories({ includeInactive, search: options.search }),
  ]);

  return {
    data: rows.map(toCategoryAdminDto),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize) || 1,
  };
}

export async function getCategory(id: number) {
  const row = await findCategoryById(id);
  return row ? toCategoryAdminDto(row) : null;
}

export async function createNewCategory(input: CategoryWriteInput, actorId?: string | null) {
  const created = await createCategory(toCategoryCreateInput(input, actorId));
  return toCategoryAdminDto(created);
}

export async function updateCategory(
  id: number,
  input: Partial<CategoryWriteInput>,
  actorId?: string | null,
) {
  const updated = await updateCategoryById(id, toCategoryUpdateInput(input, actorId));
  return updated ? toCategoryAdminDto(updated) : null;
}

export async function deleteCategory(id: number, actorId?: string | null) {
  const deleted = await deactivateCategoryById(id, actorId);
  return deleted ? toCategoryAdminDto(deleted) : null;
}
