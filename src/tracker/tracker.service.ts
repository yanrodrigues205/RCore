import { Injectable, Logger } from '@nestjs/common';
import * as net from 'node:net';
import { calculateCRC16 } from './util/crc16.util';

export interface GpsData {
  timestamp: Date;
  satellites: number;
  latitude: number;
  longitude: number;
  speed: number;
  course: number;
}

@Injectable()
export class TrackerService {
  private readonly logger = new Logger(TrackerService.name);

  public processPacket(socket: net.Socket, data: Buffer) {
    if (data.length < 10 || data[0] !== 0x78 || data[1] !== 0x78) {
      this.logger.warn('Pacote não é GT06 válido ou é muito curto.');
      return;
    }

    const protocol = data[3];
    const serialBuffer = data.subarray(data.length - 6, data.length - 4);


    if (protocol === 0x01) {
      const imei = data.subarray(4, 12).toString('hex');
      this.logger.log(`[LOGIN] IMEI: ${imei}`);
      this.sendAck(socket, protocol, serialBuffer);
    } 
    else if (protocol === 0x12) {
      const parsedGps = this.parseGpsPackage(data);
      if (parsedGps) {
        this.logger.log(
          `📍 [GPS DATA] Lat: ${parsedGps.latitude} | Long: ${parsedGps.longitude} | Vel: ${parsedGps.speed} km/h | Data: ${parsedGps.timestamp.toISOString()}`
        );
 
      }
      this.sendAck(socket, protocol, serialBuffer);
    }
  }

  private parseGpsPackage(data: Buffer): GpsData | null {
    try {
      const year = 2000 + data[4];
      const month = data[5] - 1;
      const day = data[6];
      const hour = data[7];
      const minute = data[8];
      const second = data[9];
      const timestamp = new Date(Date.UTC(year, month, day, hour, minute, second));

      const satCount = data[10] & 0x0f;

      let latitude = data.readUInt32BE(11) / 30000.0 / 60.0;
      let longitude = data.readUInt32BE(15) / 30000.0 / 60.0;
      const speed = data[19];

      const courseStatus = data.readUInt16BE(20);
      const isLatitudeNorth = (courseStatus & 0x0400) === 0;
      const isLongitudeWest = (courseStatus & 0x0800) !== 0;

      if (!isLatitudeNorth) latitude = -latitude;
      if (isLongitudeWest) longitude = -longitude;

      return {
        timestamp,
        satellites: satCount,
        latitude: Number(latitude.toFixed(6)),
        longitude: Number(longitude.toFixed(6)),
        speed,
        course: courseStatus & 0x03ff,
      };
    } catch (err) {
      this.logger.error('Erro ao decodificar pacote GPS', err);
      return null;
    }
  }

  private sendAck(socket: net.Socket, protocol: number, serialBuffer: Buffer) {
    const payload = Buffer.from([0x05, protocol, serialBuffer[0], serialBuffer[1]]);
    const crc = calculateCRC16(payload);

    const ack = Buffer.alloc(10);
    ack[0] = 0x78;
    ack[1] = 0x78;
    ack[2] = 0x05;
    ack[3] = protocol;
    ack[4] = serialBuffer[0];
    ack[5] = serialBuffer[1];
    ack.writeUInt16BE(crc, 6);
    ack[8] = 0x0d;
    ack[9] = 0x0a;

    socket.write(ack, () => {
      this.logger.log(`[ACK ENVIADO] Protocolo: 0x${protocol.toString(16).padStart(2, '0')}`);
    });
  }
}