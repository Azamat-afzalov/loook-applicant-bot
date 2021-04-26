/*
  Warnings:

  - Added the required column `status` to the `t_applicant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deleted` to the `t_applicant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `t_applicant` ADD COLUMN     `address` TEXT,
    ADD COLUMN     `employee_id` INTEGER,
    ADD COLUMN     `manager_comment` TEXT,
    ADD COLUMN     `interview_comment` TEXT,
    ADD COLUMN     `sent_branch_id` INTEGER,
    ADD COLUMN     `send_to_branch_time` DATETIME(3),
    ADD COLUMN     `learning_result` INTEGER,
    ADD COLUMN     `status` ENUM('NEW', 'INTERVIEW', 'TRAINING', 'INTERN', 'REJECTED', 'ACCEPTED') NOT NULL,
    ADD COLUMN     `deleted` TINYINT NOT NULL;
