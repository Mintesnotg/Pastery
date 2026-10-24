-- CreateTable
CREATE TABLE `app_settings` (
    `key` VARCHAR(64) NOT NULL,
    `value` VARCHAR(512) NOT NULL,
    `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Seed defaults (idempotent)
INSERT INTO `app_settings` (`key`, `value`) VALUES
  ('order.timezone', 'Europe/London'),
  ('order.cutoff_time', '14:00'),
  ('order.min_lead_days', '1')
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);
