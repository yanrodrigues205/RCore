-- CreateTable
CREATE TABLE "Vehicles" (
    "id" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "color" TEXT NOT NULL,
    "vehicleImg" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "trackingDeviceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrackingDevices" (
    "id" TEXT NOT NULL,
    "imei" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "blockade" BOOLEAN,
    "model" TEXT NOT NULL,
    "protocol" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "instaledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "TrackingDevices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrackerData" (
    "id" TEXT NOT NULL,
    "imei" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "speed" DOUBLE PRECISION NOT NULL,
    "course" DOUBLE PRECISION NOT NULL,
    "satCount" DOUBLE PRECISION NOT NULL,
    "gpsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrackerData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Vehicles_trackingDeviceId_key" ON "Vehicles"("trackingDeviceId");

-- CreateIndex
CREATE INDEX "Vehicles_userId_trackingDeviceId_idx" ON "Vehicles"("userId", "trackingDeviceId");

-- CreateIndex
CREATE UNIQUE INDEX "TrackingDevices_imei_key" ON "TrackingDevices"("imei");

-- CreateIndex
CREATE INDEX "TrackingDevices_imei_userId_idx" ON "TrackingDevices"("imei", "userId");

-- CreateIndex
CREATE INDEX "TrackerData_imei_gpsAt_idx" ON "TrackerData"("imei", "gpsAt" DESC);

-- CreateIndex
CREATE INDEX "TrackerData_createdAt_gpsAt_idx" ON "TrackerData"("createdAt", "gpsAt");

-- AddForeignKey
ALTER TABLE "Vehicles" ADD CONSTRAINT "Vehicles_trackingDeviceId_fkey" FOREIGN KEY ("trackingDeviceId") REFERENCES "TrackingDevices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicles" ADD CONSTRAINT "Vehicles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackingDevices" ADD CONSTRAINT "TrackingDevices_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
