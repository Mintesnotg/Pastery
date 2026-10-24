-- Dual product pricing: rename price -> retail_price, add wholesale_price
ALTER TABLE `products` CHANGE `price` `retail_price` DECIMAL(10, 2) NOT NULL;
ALTER TABLE `products` ADD COLUMN `wholesale_price` DECIMAL(10, 2) NULL;

-- Business accounts (cafe / B2B credit)
CREATE TABLE `business_accounts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `contact_user_id` CHAR(36) NOT NULL,
    `business_name` VARCHAR(191) NOT NULL,
    `address_line1` VARCHAR(191) NOT NULL,
    `address_line2` VARCHAR(191) NULL,
    `city` VARCHAR(191) NOT NULL,
    `postcode` VARCHAR(191) NOT NULL,
    `country` VARCHAR(191) NOT NULL DEFAULT 'GB',
    `phone` VARCHAR(191) NULL,
    `business_id_doc_path` TEXT NULL,
    `license_doc_path` TEXT NULL,
    `approval_status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    `rejection_reason` TEXT NULL,
    `credit_tier` TINYINT NOT NULL DEFAULT 0,
    `credit_limit` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `credit_balance` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `overdue_paused` BOOLEAN NOT NULL DEFAULT false,
    `notes` TEXT NULL,
    `approved_at` DATETIME(6) NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),

    UNIQUE INDEX `business_accounts_contact_user_id_key`(`contact_user_id`),
    INDEX `business_accounts_approval_idx`(`approval_status`),
    INDEX `business_accounts_tier_idx`(`credit_tier`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `business_accounts`
  ADD CONSTRAINT `business_accounts_contact_user_id_fkey`
  FOREIGN KEY (`contact_user_id`) REFERENCES `users`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- Order channel / fulfillment / credit fields
ALTER TABLE `orders`
  ADD COLUMN `business_account_id` INTEGER NULL,
  ADD COLUMN `channel` ENUM('retail', 'wholesale', 'custom') NOT NULL DEFAULT 'retail',
  ADD COLUMN `fulfillment_type` ENUM('pickup', 'delivery') NOT NULL DEFAULT 'pickup',
  ADD COLUMN `payment_terms` ENUM('prepaid', 'credit') NOT NULL DEFAULT 'prepaid',
  ADD COLUMN `delivery_address` TEXT NULL;

CREATE INDEX `orders_business_account_idx` ON `orders`(`business_account_id`);
CREATE INDEX `orders_channel_idx` ON `orders`(`channel`);

ALTER TABLE `orders`
  ADD CONSTRAINT `orders_business_account_id_fkey`
  FOREIGN KEY (`business_account_id`) REFERENCES `business_accounts`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;
