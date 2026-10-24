-- CreateEnum
-- CreateTable
CREATE TABLE `delivery_notes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `order_id` INTEGER NOT NULL,
    `signer_name` VARCHAR(191) NOT NULL,
    `medium` ENUM('paper', 'digital') NOT NULL,
    `signed_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `recorded_by_user_id` CHAR(36) NOT NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    UNIQUE INDEX `delivery_notes_order_id_key`(`order_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `delivery_notes` ADD CONSTRAINT `delivery_notes_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `delivery_notes` ADD CONSTRAINT `delivery_notes_recorded_by_user_id_fkey` FOREIGN KEY (`recorded_by_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
