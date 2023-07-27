/*
  Warnings:

  - You are about to drop the column `storeCaller` on the `DataStored` table. All the data in the column will be lost.
  - You are about to drop the column `targetPress` on the `DataStored` table. All the data in the column will be lost.
  - You are about to drop the column `targetPress` on the `LogicUpdated` table. All the data in the column will be lost.
  - You are about to drop the column `targetPress` on the `RendererUpdated` table. All the data in the column will be lost.
  - You are about to drop the `Create721Press` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PressInitialized` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `sender` to the `DataStored` table without a default value. This is not possible if the table is not empty.
  - Added the required column `target` to the `DataStored` table without a default value. This is not possible if the table is not empty.
  - Added the required column `target` to the `LogicUpdated` table without a default value. This is not possible if the table is not empty.
  - Added the required column `target` to the `RendererUpdated` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DataStored" DROP COLUMN "storeCaller",
DROP COLUMN "targetPress",
ADD COLUMN     "sender" TEXT NOT NULL,
ADD COLUMN     "target" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "LogicUpdated" DROP COLUMN "targetPress",
ADD COLUMN     "target" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "RendererUpdated" DROP COLUMN "targetPress",
ADD COLUMN     "target" TEXT NOT NULL;

-- DropTable
DROP TABLE "Create721Press";

-- DropTable
DROP TABLE "PressInitialized";

-- CreateTable
CREATE TABLE "SetupAP721" (
    "id" SERIAL NOT NULL,
    "ap721" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "initialOwner" TEXT NOT NULL,
    "logic" TEXT NOT NULL,
    "renderer" TEXT NOT NULL,
    "factory" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SetupAP721_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataOverwritten" (
    "id" SERIAL NOT NULL,
    "target" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "pointer" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tokenId" BIGINT NOT NULL,

    CONSTRAINT "DataOverwritten_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataRemoved" (
    "id" SERIAL NOT NULL,
    "target" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tokenId" BIGINT NOT NULL,

    CONSTRAINT "DataRemoved_pkey" PRIMARY KEY ("id")
);
