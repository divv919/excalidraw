/*
  Warnings:

  - You are about to drop the column `clientX` on the `Content` table. All the data in the column will be lost.
  - You are about to drop the column `clientY` on the `Content` table. All the data in the column will be lost.
  - You are about to drop the column `fromX` on the `Content` table. All the data in the column will be lost.
  - You are about to drop the column `fromY` on the `Content` table. All the data in the column will be lost.
  - You are about to drop the column `radiusX` on the `Content` table. All the data in the column will be lost.
  - You are about to drop the column `radiusY` on the `Content` table. All the data in the column will be lost.
  - You are about to drop the column `toX` on the `Content` table. All the data in the column will be lost.
  - You are about to drop the column `toY` on the `Content` table. All the data in the column will be lost.
  - Added the required column `name` to the `Room` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Content" DROP COLUMN "clientX",
DROP COLUMN "clientY",
DROP COLUMN "fromX",
DROP COLUMN "fromY",
DROP COLUMN "radiusX",
DROP COLUMN "radiusY",
DROP COLUMN "toX",
DROP COLUMN "toY",
ADD COLUMN     "client_x" INTEGER,
ADD COLUMN     "client_y" INTEGER,
ADD COLUMN     "color" TEXT,
ADD COLUMN     "from_x" INTEGER,
ADD COLUMN     "from_y" INTEGER,
ADD COLUMN     "radius_x" INTEGER,
ADD COLUMN     "radius_y" INTEGER,
ADD COLUMN     "to_x" INTEGER,
ADD COLUMN     "to_y" INTEGER;

-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "name" TEXT NOT NULL;
