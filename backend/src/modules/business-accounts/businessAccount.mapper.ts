import type { BusinessAccount, User } from "@prisma/client";

type AccountWithUser = BusinessAccount & {
  contactUser?: Pick<User, "id" | "email" | "fullName"> | null;
};

export type BusinessAccountDto = {
  id: number;
  contact_user_id: string;
  business_name: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  postcode: string;
  country: string;
  phone: string | null;
  has_business_id_doc: boolean;
  has_license_doc: boolean;
  approval_status: string;
  rejection_reason: string | null;
  credit_tier: number;
  credit_limit: number;
  credit_balance: number;
  overdue_paused: boolean;
  notes: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
  contact_user?: { id: string; email: string; full_name: string };
};

export function toBusinessAccountDto(row: AccountWithUser): BusinessAccountDto {
  return {
    id: row.id,
    contact_user_id: row.contactUserId,
    business_name: row.businessName,
    address_line1: row.addressLine1,
    address_line2: row.addressLine2,
    city: row.city,
    postcode: row.postcode,
    country: row.country,
    phone: row.phone,
    has_business_id_doc: Boolean(row.businessIdDocPath),
    has_license_doc: Boolean(row.licenseDocPath),
    approval_status: row.approvalStatus,
    rejection_reason: row.rejectionReason,
    credit_tier: row.creditTier,
    credit_limit: Number(row.creditLimit),
    credit_balance: Number(row.creditBalance),
    overdue_paused: row.overduePaused,
    notes: row.notes,
    approved_at: row.approvedAt?.toISOString() ?? null,
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString(),
    ...(row.contactUser
      ? {
          contact_user: {
            id: row.contactUser.id,
            email: row.contactUser.email,
            full_name: row.contactUser.fullName,
          },
        }
      : {}),
  };
}
