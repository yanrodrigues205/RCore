/*
  Warnings:

  - A unique constraint covering the columns `[plate]` on the table `Vehicles` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Vehicles_userId_trackingDeviceId_idx";

-- CreateIndex
CREATE UNIQUE INDEX "Vehicles_plate_key" ON "Vehicles"("plate");

-- CreateIndex
CREATE INDEX "Vehicles_userId_trackingDeviceId_plate_idx" ON "Vehicles"("userId", "trackingDeviceId", "plate");
