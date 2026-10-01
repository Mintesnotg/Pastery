-- Align existing DB (and shadow DB after 0_init) with current schema.

DROP TABLE IF EXISTS "Test_table";
DROP TABLE IF EXISTS "example_table2";
DROP TABLE IF EXISTS "example_table3";

CREATE TABLE IF NOT EXISTS "product_categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "product_categories_pkey" PRIMARY KEY ("id")
);

INSERT INTO "product_categories" ("name", "description")
SELECT * FROM (VALUES
  ('Cakes', 'Celebration cakes and everyday slices.'),
  ('Breads', 'Slow-fermented artisan loaves.'),
  ('Pastries', 'Laminated viennoiserie and morning pastries.'),
  ('Cookies', 'Chewy cookies and wholesome biscuits.'),
  ('Drinks', 'Coffee, tea, and bakery drinks.')
) AS v(name, description)
WHERE NOT EXISTS (SELECT 1 FROM "product_categories" LIMIT 1);

ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "is_special" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "category_id" INTEGER;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "created_by" UUID;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "updated_by" UUID;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'featured'
  ) THEN
    EXECUTE 'UPDATE "products" SET "is_special" = "featured"';
  END IF;
END
$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'category'
  ) THEN
    EXECUTE $sql$
      UPDATE "products" p
      SET "category_id" = c.id
      FROM "product_categories" c
      WHERE p."category_id" IS NULL
        AND (
          (LOWER(p."category") LIKE '%bread%' AND c.name = 'Breads')
          OR (LOWER(p."category") LIKE '%pastr%' AND c.name = 'Pastries')
          OR (LOWER(p."category") LIKE '%cake%' AND c.name = 'Cakes')
          OR (LOWER(p."category") LIKE '%cookie%' AND c.name = 'Cookies')
          OR ((LOWER(p."category") LIKE '%drink%' OR LOWER(p."category") LIKE '%coffee%') AND c.name = 'Drinks')
        )
    $sql$;
  END IF;
END
$$;

UPDATE "products"
SET "category_id" = (SELECT id FROM "product_categories" ORDER BY id LIMIT 1)
WHERE "category_id" IS NULL;

ALTER TABLE "products" ALTER COLUMN "category_id" SET NOT NULL;

ALTER TABLE "products" DROP COLUMN IF EXISTS "featured";
ALTER TABLE "products" DROP COLUMN IF EXISTS "tags";
ALTER TABLE "products" DROP COLUMN IF EXISTS "category";

CREATE INDEX IF NOT EXISTS "products_category_idx" ON "products"("category_id");
CREATE INDEX IF NOT EXISTS "products_active_special_idx" ON "products"("active", "is_special");

ALTER TABLE "payment_events" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "payment_intents" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "payments" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "id" DROP DEFAULT;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'order_items_product_id_fkey') THEN
    ALTER TABLE "order_items" DROP CONSTRAINT "order_items_product_id_fkey";
  END IF;
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'order_items_product_id_products_id_fk') THEN
    ALTER TABLE "order_items" DROP CONSTRAINT "order_items_product_id_products_id_fk";
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name = 'user_roles'
      AND constraint_type = 'PRIMARY KEY'
      AND constraint_name = 'user_roles_user_role_unique'
  ) THEN
    ALTER TABLE "user_roles" DROP CONSTRAINT IF EXISTS "user_roles_pkey";
    DROP INDEX IF EXISTS "user_roles_user_role_unique";
    ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_role_unique" PRIMARY KEY ("user_id", "role_id");
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name = 'role_permissions'
      AND constraint_type = 'PRIMARY KEY'
      AND constraint_name = 'role_permissions_role_permission_unique'
  ) THEN
    ALTER TABLE "role_permissions" DROP CONSTRAINT IF EXISTS "role_permissions_pkey";
    DROP INDEX IF EXISTS "role_permissions_role_permission_unique";
    ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_permission_unique" PRIMARY KEY ("role_id", "permission_id");
  END IF;
END
$$;

DO $$
DECLARE
  rec record;
BEGIN
  FOR rec IN
    SELECT * FROM (VALUES
      ('order_items', 'order_items_order_id_orders_id_fk', 'order_items_order_id_fkey',
        'ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE'),
      ('payment_events', 'payment_events_payment_id_payments_id_fk', 'payment_events_payment_id_fkey',
        'ALTER TABLE "payment_events" ADD CONSTRAINT "payment_events_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE'),
      ('payment_intents', 'payment_intents_order_id_orders_id_fk', 'payment_intents_order_id_fkey',
        'ALTER TABLE "payment_intents" ADD CONSTRAINT "payment_intents_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE'),
      ('payments', 'payments_order_id_orders_id_fk', 'payments_order_id_fkey',
        'ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE'),
      ('payments', 'payments_payment_intent_ID_payment_intents_id_fk', 'payments_payment_intent_ID_fkey',
        'ALTER TABLE "payments" ADD CONSTRAINT "payments_payment_intent_ID_fkey" FOREIGN KEY ("payment_intent_ID") REFERENCES "payment_intents"("id") ON DELETE SET NULL ON UPDATE CASCADE'),
      ('role_permissions', 'role_permissions_permission_id_permissions_id_fk', 'role_permissions_permission_id_fkey',
        'ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE'),
      ('role_permissions', 'role_permissions_role_id_roles_id_fk', 'role_permissions_role_id_fkey',
        'ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE'),
      ('user_roles', 'user_roles_role_id_roles_id_fk', 'user_roles_role_id_fkey',
        'ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE'),
      ('user_roles', 'user_roles_user_id_users_id_fk', 'user_roles_user_id_fkey',
        'ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE')
    ) AS t(table_name, old_name, new_name, add_sql)
  LOOP
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = rec.old_name) THEN
      EXECUTE format('ALTER TABLE %I DROP CONSTRAINT %I', rec.table_name, rec.old_name);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = rec.new_name) THEN
      EXECUTE rec.add_sql;
    END IF;
  END LOOP;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_category_id_fkey') THEN
    ALTER TABLE "products"
      ADD CONSTRAINT "products_category_id_fkey"
      FOREIGN KEY ("category_id") REFERENCES "product_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'product_categories_created_by_fkey') THEN
    ALTER TABLE "product_categories"
      ADD CONSTRAINT "product_categories_created_by_fkey"
      FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'product_categories_updated_by_fkey') THEN
    ALTER TABLE "product_categories"
      ADD CONSTRAINT "product_categories_updated_by_fkey"
      FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_created_by_fkey') THEN
    ALTER TABLE "products"
      ADD CONSTRAINT "products_created_by_fkey"
      FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_updated_by_fkey') THEN
    ALTER TABLE "products"
      ADD CONSTRAINT "products_updated_by_fkey"
      FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END
$$;
