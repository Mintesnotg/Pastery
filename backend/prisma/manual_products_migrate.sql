CREATE TABLE IF NOT EXISTS product_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  created_by UUID,
  updated_by UUID
);

INSERT INTO product_categories (name, description)
SELECT * FROM (VALUES
  ('Cakes', 'Celebration cakes and everyday slices.'),
  ('Breads', 'Slow-fermented artisan loaves.'),
  ('Pastries', 'Laminated viennoiserie and morning pastries.'),
  ('Cookies', 'Chewy cookies and wholesome biscuits.'),
  ('Drinks', 'Coffee, tea, and bakery drinks.')
) AS v(name, description)
WHERE NOT EXISTS (SELECT 1 FROM product_categories LIMIT 1);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'order_items_product_id_fkey' AND table_name = 'order_items'
  ) THEN
    ALTER TABLE order_items DROP CONSTRAINT order_items_product_id_fkey;
  END IF;
END
$$;

ALTER TABLE products ADD COLUMN IF NOT EXISTS is_special BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id INTEGER;
ALTER TABLE products ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_by UUID;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'featured'
  ) THEN
    EXECUTE 'UPDATE products SET is_special = featured';
  END IF;
END
$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'category'
  ) THEN
    EXECUTE $sql$
      UPDATE products p
      SET category_id = c.id
      FROM product_categories c
      WHERE p.category_id IS NULL
        AND (
          (LOWER(p.category) LIKE '%bread%' AND c.name = 'Breads')
          OR (LOWER(p.category) LIKE '%pastr%' AND c.name = 'Pastries')
          OR (LOWER(p.category) LIKE '%cake%' AND c.name = 'Cakes')
          OR (LOWER(p.category) LIKE '%cookie%' AND c.name = 'Cookies')
          OR ((LOWER(p.category) LIKE '%drink%' OR LOWER(p.category) LIKE '%coffee%') AND c.name = 'Drinks')
        )
    $sql$;
  END IF;
END
$$;

UPDATE products SET category_id = (SELECT id FROM product_categories ORDER BY id LIMIT 1) WHERE category_id IS NULL;

ALTER TABLE products ALTER COLUMN category_id SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'products_category_id_fkey'
  ) THEN
    ALTER TABLE products
      ADD CONSTRAINT products_category_id_fkey
      FOREIGN KEY (category_id) REFERENCES product_categories(id);
  END IF;
END
$$;

ALTER TABLE products DROP COLUMN IF EXISTS featured;
ALTER TABLE products DROP COLUMN IF EXISTS tags;
ALTER TABLE products DROP COLUMN IF EXISTS category;

CREATE INDEX IF NOT EXISTS products_category_idx ON products(category_id);
CREATE INDEX IF NOT EXISTS products_active_special_idx ON products(active, is_special);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'product_categories_created_by_fkey'
  ) THEN
    ALTER TABLE product_categories
      ADD CONSTRAINT product_categories_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'product_categories_updated_by_fkey'
  ) THEN
    ALTER TABLE product_categories
      ADD CONSTRAINT product_categories_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'products_created_by_fkey'
  ) THEN
    ALTER TABLE products
      ADD CONSTRAINT products_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'products_updated_by_fkey'
  ) THEN
    ALTER TABLE products
      ADD CONSTRAINT products_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;
  END IF;
END
$$;
