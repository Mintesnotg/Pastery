-- Clear order data before adding required user_id
TRUNCATE TABLE payment_events, payments, payment_intents, order_items, orders RESTART IDENTITY CASCADE;

ALTER TABLE order_items DROP COLUMN IF EXISTS product_sku;
ALTER TABLE order_items DROP COLUMN IF EXISTS metadata;

ALTER TABLE orders DROP COLUMN IF EXISTS subtotal;
ALTER TABLE orders DROP COLUMN IF EXISTS tax_total;
ALTER TABLE orders DROP COLUMN IF EXISTS discount_total;

ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id UUID;

-- Temporary: if any rows somehow remain without user_id, they were truncated above.
-- Enforce NOT NULL after column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'user_id' AND is_nullable = 'YES'
  ) THEN
    -- No rows after truncate; safe to set NOT NULL
    ALTER TABLE orders ALTER COLUMN user_id SET NOT NULL;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'orders_user_id_fkey'
  ) THEN
    ALTER TABLE orders
      ADD CONSTRAINT orders_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT;
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS orders_user_idx ON orders(user_id);
