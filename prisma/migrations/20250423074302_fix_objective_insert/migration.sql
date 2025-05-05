/*
  Warnings:

  - You are about to drop the `_GoalTags` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_TaskTags` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `goals` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tasks` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ObjectiveType" AS ENUM ('GOAL', 'TASK', 'SUBGOAL', 'SUBTASK');

-- CreateEnum
CREATE TYPE "ObjectiveStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'ARCHIVED', 'TODO', 'IN_PROGRESS', 'DONE');

-- DropForeignKey
ALTER TABLE "_GoalTags" DROP CONSTRAINT "_GoalTags_A_fkey";

-- DropForeignKey
ALTER TABLE "_GoalTags" DROP CONSTRAINT "_GoalTags_B_fkey";

-- DropForeignKey
ALTER TABLE "_TaskTags" DROP CONSTRAINT "_TaskTags_A_fkey";

-- DropForeignKey
ALTER TABLE "_TaskTags" DROP CONSTRAINT "_TaskTags_B_fkey";

-- DropForeignKey
ALTER TABLE "goals" DROP CONSTRAINT "goals_parent_goal_id_fkey";

-- DropForeignKey
ALTER TABLE "goals" DROP CONSTRAINT "goals_user_id_fkey";

-- DropForeignKey
ALTER TABLE "progress_logs" DROP CONSTRAINT "progress_logs_goal_id_fkey";

-- DropForeignKey
ALTER TABLE "progress_logs" DROP CONSTRAINT "progress_logs_task_id_fkey";

-- DropForeignKey
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_goal_id_fkey";

-- DropForeignKey
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_parent_task_id_fkey";

-- DropForeignKey
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_user_id_fkey";

-- DropForeignKey
ALTER TABLE "time_records" DROP CONSTRAINT "time_records_task_id_fkey";

-- DropTable
DROP TABLE "_GoalTags";

-- DropTable
DROP TABLE "_TaskTags";

-- DropTable
DROP TABLE "goals";

-- DropTable
DROP TABLE "tasks";

-- DropEnum
DROP TYPE "GoalLevel";

-- DropEnum
DROP TYPE "GoalStatus";

-- DropEnum
DROP TYPE "TaskPriority";

-- DropEnum
DROP TYPE "TaskStatus";

-- CreateTable
CREATE TABLE "objectives" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "ObjectiveType" NOT NULL DEFAULT 'TASK',
    "status" "ObjectiveStatus" NOT NULL DEFAULT 'ACTIVE',
    "priority" INTEGER NOT NULL DEFAULT 1,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "parent_objective_id" TEXT,
    "user_id" TEXT NOT NULL,
    "metadata" JSONB DEFAULT '{}',
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "total_time" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "objectives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ObjectiveTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ObjectiveTags_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ObjectiveTags_B_index" ON "_ObjectiveTags"("B");

-- AddForeignKey
ALTER TABLE "objectives" ADD CONSTRAINT "objectives_parent_objective_id_fkey" FOREIGN KEY ("parent_objective_id") REFERENCES "objectives"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "objectives" ADD CONSTRAINT "objectives_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_records" ADD CONSTRAINT "time_records_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "objectives"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progress_logs" ADD CONSTRAINT "progress_logs_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "objectives"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ObjectiveTags" ADD CONSTRAINT "_ObjectiveTags_A_fkey" FOREIGN KEY ("A") REFERENCES "objectives"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ObjectiveTags" ADD CONSTRAINT "_ObjectiveTags_B_fkey" FOREIGN KEY ("B") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
