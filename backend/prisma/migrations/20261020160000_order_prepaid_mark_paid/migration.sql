-- AlterTable
ALTER TABLE `orders`
  ADD COLUMN `prepaid_paid_at` DATETIME(6) NULL,
  ADD COLUMN `payment_reference` VARCHAR(191) NULL;
