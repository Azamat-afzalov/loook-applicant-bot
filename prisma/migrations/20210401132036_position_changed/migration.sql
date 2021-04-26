/*
  Warnings:

  - You are about to alter the column `position` on the `t_applicant` table. The data in that column could be lost. The data in that column will be cast from `VarChar(256)` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `t_applicant` MODIFY `position` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE INDEX `position` ON `t_applicant`(`position`);
