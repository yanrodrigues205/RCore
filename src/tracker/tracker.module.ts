import { Module } from '@nestjs/common';
import { TcpServer } from './tcp-server';

@Module({
  providers: [
    TcpServer,
  ],
})
export class TrackerModule {}