/** Shared audit field convention for Product / ProductCategory (Prisma has no model inheritance). */
export type AuditableFields = {
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
};

export type AuditableDto = {
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
};

export function toAuditableDto(row: AuditableFields): AuditableDto {
  return {
    is_active: row.active,
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString(),
    created_by: row.createdBy,
    updated_by: row.updatedBy,
  };
}
