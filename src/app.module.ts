import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TrackerModule } from './tracker/tracker.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { TrackerDataController } from './tracker-data/tracker-data.controller';
import { TrackerDataService } from './tracker-data/tracker-data.service';
import { TrackerDataModule } from './tracker-data/tracker-data.module';
import { TrackingDevicesModule } from './tracking-devices/tracking-devices.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        name: 'segundo',
        ttl: 1000,
        limit: 3, 
      },
      {
        name: 'minuto',
        ttl: 60000,
        limit: 180,
      },
    ]),
    PrismaModule,
    TrackerModule, 
    AuthModule, TrackerDataModule, TrackingDevicesModule,
  ],
  controllers: [AppController, TrackerDataController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    TrackerDataService
  ],
})
export class AppModule {}
