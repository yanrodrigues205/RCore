/*
  Warnings:

  - Made the column `trackingDeviceId` on table `Vehicles` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Vehicles" DROP CONSTRAINT "Vehicles_trackingDeviceId_fkey";

-- AlterTable
ALTER TABLE "Vehicles" ALTER COLUMN "trackingDeviceId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Vehicles" ADD CONSTRAINT "Vehicles_trackingDeviceId_fkey" FOREIGN KEY ("trackingDeviceId") REFERENCES "TrackingDevices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
