-- AlterTable
ALTER TABLE `orders` ADD COLUMN `standing_order_id` INTEGER NULL;

-- CreateTable
CREATE TABLE `standing_orders` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `business_account_id` INTEGER NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `weekdays` JSON NOT NULL,
    `fulfillment_type` ENUM('pickup', 'delivery') NOT NULL DEFAULT 'pickup',
    `delivery_address` TEXT NULL,
    `preferred_time` VARCHAR(16) NOT NULL,
    `notes` TEXT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    INDEX `standing_orders_ba_idx`(`business_account_id`),
    INDEX `standing_orders_user_idx`(`user_id`),
    INDEX `standing_orders_active_idx`(`active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `standing_order_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `standing_order_id` INTEGER NOT NULL,
    `product_id` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,

    INDEX `standing_order_items_so_idx`(`standing_order_id`),
    INDEX `standing_order_items_product_idx`(`product_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `orders_standing_pickup_idx` ON `orders`(`standing_order_id`, `pickup_date`);

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_standing_order_id_fkey` FOREIGN KEY (`standing_order_id`) REFERENCES `standing_orders`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `standing_orders` ADD CONSTRAINT `standing_orders_business_account_id_fkey` FOREIGN KEY (`business_account_id`) REFERENCES `business_accounts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `standing_orders` ADD CONSTRAINT `standing_orders_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `standing_order_items` ADD CONSTRAINT `standing_order_items_standing_order_id_fkey` FOREIGN KEY (`standing_order_id`) REFERENCES `standing_orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `standing_order_items` ADD CONSTRAINT `standing_order_items_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
