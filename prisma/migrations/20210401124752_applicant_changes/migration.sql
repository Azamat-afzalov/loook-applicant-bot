-- DropIndex
DROP INDEX `position` ON `t_applicant`;

-- AlterTable
ALTER TABLE `t_applicant` MODIFY `position` VARCHAR(256) NOT NULL;
