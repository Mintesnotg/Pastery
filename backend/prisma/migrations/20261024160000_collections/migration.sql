-- AlterTable
ALTER TABLE `business_accounts` ADD COLUMN `late_strike_count` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `invoices` ADD COLUMN `reminder_pre_due_sent_at` DATETIME(6) NULL,
    ADD COLUMN `reminder_due_sent_at` DATETIME(6) NULL;

-- CreateTable
CREATE TABLE `collection_tasks` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `business_account_id` INTEGER NOT NULL,
    `invoice_id` INTEGER NOT NULL,
    `kind` ENUM('overdue_pause') NOT NULL DEFAULT 'overdue_pause',
    `status` ENUM('open', 'resolved', 'cancelled') NOT NULL DEFAULT 'open',
    `days_overdue` INTEGER NOT NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `resolved_at` DATETIME(6) NULL,
    `resolved_by_user_id` CHAR(36) NULL,

    UNIQUE INDEX `collection_tasks_invoice_id_key`(`invoice_id`),
    INDEX `collection_tasks_status_idx`(`status`),
    INDEX `collection_tasks_ba_idx`(`business_account_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `collection_tasks` ADD CONSTRAINT `collection_tasks_business_account_id_fkey` FOREIGN KEY (`business_account_id`) REFERENCES `business_accounts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `collection_tasks` ADD CONSTRAINT `collection_tasks_invoice_id_fkey` FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `collection_tasks` ADD CONSTRAINT `collection_tasks_resolved_by_user_id_fkey` FOREIGN KEY (`resolved_by_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
