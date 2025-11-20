/*
  Warnings:

  - You are about to drop the column `client_x` on the `Content` table. All the data in the column will be lost.
  - You are about to drop the column `client_y` on the `Content` table. All the data in the column will be lost.
  - You are about to drop the column `from_x` on the `Content` table. All the data in the column will be lost.
  - You are about to drop the column `from_y` on the `Content` table. All the data in the column will be lost.
  - You are about to drop the column `height` on the `Content` table. All the data in the column will be lost.
  - You are about to drop the column `radius_x` on the `Content` table. All the data in the column will be lost.
  - You are about to drop the column `radius_y` on the `Content` table. All the data in the column will be lost.
  - You are about to drop the column `to_x` on the `Content` table. All the data in the column will be lost.
  - You are about to drop the column `to_y` on the `Content` table. All the data in the column will be lost.
  - You are about to drop the column `width` on the `Content` table. All the data in the column will be lost.
  - The `points` column on the `Content` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Content" DROP COLUMN "client_x",
DROP COLUMN "client_y",
DROP COLUMN "from_x",
DROP COLUMN "from_y",
DROP COLUMN "height",
DROP COLUMN "radius_x",
DROP COLUMN "radius_y",
DROP COLUMN "to_x",
DROP COLUMN "to_y",
DROP COLUMN "width",
ADD COLUMN     "end_x" INTEGER,
ADD COLUMN     "end_y" INTEGER,
ADD COLUMN     "start_x" INTEGER,
ADD COLUMN     "start_y" INTEGER,
DROP COLUMN "points",
ADD COLUMN     "points" JSONB[];
