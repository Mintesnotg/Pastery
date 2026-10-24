type StandingItemRow = {
  id: number;
  productId: number;
  quantity: number;
  product?: { id: number; name: string; wholesalePrice: unknown } | null;
};

type StandingOrderRow = {
  id: number;
  businessAccountId: number;
  userId: string;
  weekdays: unknown;
  fulfillmentType: string;
  deliveryAddress: string | null;
  preferredTime: string;
  notes: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  items?: StandingItemRow[];
  businessAccount?: { id: number; businessName: string } | null;
  user?: { id: string; email: string; fullName: string } | null;
};

function asWeekdays(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return value.map((n) => Number(n)).filter((n) => Number.isInteger(n) && n >= 1 && n <= 7);
}

export function toStandingOrderDto(row: StandingOrderRow) {
  return {
    id: row.id,
    business_account_id: row.businessAccountId,
    user_id: row.userId,
    weekdays: asWeekdays(row.weekdays),
    fulfillment_type: row.fulfillmentType,
    delivery_address: row.deliveryAddress,
    preferred_time: row.preferredTime,
    notes: row.notes,
    active: row.active,
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString(),
    items: (row.items ?? []).map((item) => ({
      id: item.id,
      product_id: item.productId,
      quantity: item.quantity,
      product_name: item.product?.name ?? null,
      wholesale_price:
        item.product?.wholesalePrice != null ? Number(item.product.wholesalePrice) : null,
    })),
    business_account: row.businessAccount
      ? {
          id: row.businessAccount.id,
          business_name: row.businessAccount.businessName,
        }
      : undefined,
    contact_user: row.user
      ? {
          id: row.user.id,
          email: row.user.email,
          full_name: row.user.fullName,
        }
      : undefined,
  };
}
