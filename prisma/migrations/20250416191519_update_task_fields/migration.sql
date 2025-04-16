/*
  Warnings:

  - Added the required column `date` to the `Task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `jobType` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `task` ADD COLUMN `date` DATETIME(3) NOT NULL,
    ADD COLUMN `deadline` DATETIME(3) NULL,
    ADD COLUMN `jobType` VARCHAR(191) NOT NULL;
