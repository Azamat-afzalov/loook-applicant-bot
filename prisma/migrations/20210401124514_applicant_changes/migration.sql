-- CreateTable
CREATE TABLE `t_applicant` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `first_name` VARCHAR(50) NOT NULL,
    `last_name` VARCHAR(50) NOT NULL,
    `middle_name` VARCHAR(50) NOT NULL,
    `birth_date` DATE NOT NULL,
    `phone` VARCHAR(50) NOT NULL,
    `filial` INTEGER NOT NULL,
    `position` VARCHAR(191) NOT NULL,
    `photo` VARCHAR(256),
    `shift` ENUM('OPEN', 'CLOSE') DEFAULT 'OPEN',
INDEX `filial`(`filial`),
INDEX `position`(`position`),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `t_branch` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `company_id` INTEGER NOT NULL,
    `created_by` INTEGER,
    `updated_by` INTEGER,
    `name` VARCHAR(100) NOT NULL,
    `code` VARCHAR(10),
    `timezone` VARCHAR(100) NOT NULL,
    `start_work` VARCHAR(8) NOT NULL,
    `end_work` VARCHAR(8) NOT NULL,
    `is_hq` BOOLEAN NOT NULL DEFAULT false,
    `work_days` VARCHAR(100) NOT NULL,
    `created_at` DATETIME(0),
    `updated_at` DATETIME(0),
    `deleted_at` DATETIME(0),
    `deleted` BOOLEAN NOT NULL DEFAULT false,
INDEX `company_id`(`company_id`),
INDEX `created_by`(`created_by`),
INDEX `deleted_created_by_id`(`deleted`, `created_by`, `id`),
INDEX `updated_by`(`updated_by`),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `t_job_position` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `company_id` INTEGER NOT NULL,
    `branch_id` INTEGER NOT NULL,
    `department_id` INTEGER NOT NULL,
    `created_by` INTEGER,
    `updated_by` INTEGER,
    `name` VARCHAR(50) NOT NULL,
    `description` VARCHAR(100),
    `requirement` INTEGER DEFAULT 1,
    `is_recruitment_open` BOOLEAN DEFAULT false,
    `is_kitchen` BOOLEAN DEFAULT false,
    `is_delivery` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(0),
    `updated_at` DATETIME(0),
    `deleted_at` DATETIME(0),
    `deleted` BOOLEAN NOT NULL DEFAULT false,
INDEX `branch_id`(`branch_id`),
INDEX `company_id`(`company_id`),
INDEX `created_by`(`created_by`),
INDEX `department_id`(`department_id`),
INDEX `updated_by`(`updated_by`),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
