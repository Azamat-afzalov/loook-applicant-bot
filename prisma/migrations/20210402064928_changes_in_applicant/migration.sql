/*
  Warnings:

  - You are about to drop the column `filial` on the `t_applicant` table. All the data in the column will be lost.
  - You are about to alter the column `position` on the `t_applicant` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(50)`.
  - Added the required column `branch_id` to the `t_applicant` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `filial` ON `t_applicant`;

-- AlterTable
ALTER TABLE `t_applicant` DROP COLUMN `filial`,
    ADD COLUMN     `branch_id` INTEGER NOT NULL,
    MODIFY `birth_date` VARCHAR(50) NOT NULL,
    MODIFY `position` VARCHAR(50) NOT NULL;

-- CreateIndex
CREATE INDEX `branchId` ON `t_applicant`(`branch_id`);

-- AddForeignKey
ALTER TABLE `t_applicant` ADD FOREIGN KEY (`branch_id`) REFERENCES `t_branch`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
