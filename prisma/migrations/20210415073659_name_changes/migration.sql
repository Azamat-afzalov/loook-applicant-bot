/*
  Warnings:

  - You are about to drop the column `send_to_branch_time` on the `t_applicant` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `t_applicant` DROP COLUMN `send_to_branch_time`,
    ADD COLUMN     `sent_to_branch_time` DATETIME(3);
