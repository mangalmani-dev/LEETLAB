/*
  Warnings:

  - You are about to drop the column `codeSnipptes` on the `Problem` table. All the data in the column will be lost.
  - You are about to drop the column `constarints` on the `Problem` table. All the data in the column will be lost.
  - You are about to drop the column `refranceSolutions` on the `Problem` table. All the data in the column will be lost.
  - Added the required column `codeSnippets` to the `Problem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `constraints` to the `Problem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `referenceSolutions` to the `Problem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Problem" DROP COLUMN "codeSnipptes",
DROP COLUMN "constarints",
DROP COLUMN "refranceSolutions",
ADD COLUMN     "codeSnippets" JSONB NOT NULL,
ADD COLUMN     "constraints" TEXT NOT NULL,
ADD COLUMN     "referenceSolutions" JSONB NOT NULL;
