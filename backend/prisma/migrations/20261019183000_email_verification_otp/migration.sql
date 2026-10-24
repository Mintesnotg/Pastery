-- Drop legacy link-token table (if present)
DROP TABLE IF EXISTS `email_verification_tokens`;

-- Recreate OTP table so this migration is safe after baseline already includes it
DROP TABLE IF EXISTS `email_verification_otps`;

-- CreateTable
CREATE TABLE `email_verification_otps` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `otp_hash` VARCHAR(191) NOT NULL,
    `expires_at` DATETIME(6) NOT NULL,
    `attempt_count` INTEGER NOT NULL DEFAULT 0,
    `consumed_at` DATETIME(6) NULL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    INDEX `email_verification_otps_user_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `email_verification_otps` ADD CONSTRAINT `email_verification_otps_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
