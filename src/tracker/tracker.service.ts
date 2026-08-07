import { Injectable, Logger } from '@nestjs/common';
import * as net from 'node:net';
import { calculateCRC16 } from './util/crc16.util';
import { TrackerDataService } from 'src/tracker-data/tracker-data.service';

export interface GpsData {
  timestamp: Date;
  satellites: number;
  latitude: number;
  longitude: number;
  speed: number;
  course: number;
}

interface AuthenticatedSocket extends net.Socket {
  imei?: string;
}

@Injectable()
export class TrackerService {
  private readonly logger = new Logger(TrackerService.name);

  constructor(private readonly trackerDataService: TrackerDataService){}

  public async processPacket(socket: AuthenticatedSocket, data: Buffer) {
    if (data.length < 10 || data[0] !== 0x78 || data[1] !== 0x78) {
      this.logger.warn('Pacote não é GT06 válido ou é muito curto.');
      return;
    }

    const protocol = data[3];
    const serialBuffer = data.subarray(data.length - 6, data.length - 4);


    if (protocol === 0x01) {
      const imei = data.subarray(4, 12).toString('hex');
      socket.imei = String(imei);
      this.logger.log(`[LOGIN] IMEI: ${imei}`);
      this.sendAck(socket, protocol, serialBuffer);
    } 
    else if (protocol === 0x12) {
      if(!socket.imei)
      {
        this.logger.warn(`[GPS REJEITADO] Pacote 0x12 recebido em socket sem IMEI autenticado.`)
      }

      const parsedGps = this.parseGpsPackage(data);
      if (parsedGps) {
        this.logger.log(
          `📍 [GPS DATA] Lat: ${parsedGps.latitude} | Long: ${parsedGps.longitude} | Vel: ${parsedGps.speed} km/h | Data: ${parsedGps.timestamp.toISOString()}`
        );
 
        if(socket.imei && socket.imei.length > 0)
        {
          await this.trackerDataService.create({
            imei: socket.imei,
            lat:parsedGps.latitude,
            lng: parsedGps.longitude,
            speed: parsedGps.speed,
            course: parsedGps.course,
            satCount: parsedGps.satellites,
            gpsAt: parsedGps.timestamp
          })
        }
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
      let rawLat = data.readUInt32BE(11) / 30000.0 / 60.0;
      let rawLng = data.readUInt32BE(15) / 30000.0 / 60.0;
      const speed = data[19];
      const courseStatus = data.readUInt16BE(20);
      const isNorth = (courseStatus & 0x04) !== 0;
      const isEast = (courseStatus & 0x08) !== 0;

      let latitude = isNorth ? Math.abs(rawLat) : -Math.abs(rawLat);
      let longitude = isEast ? Math.abs(rawLng) : -Math.abs(rawLng);
      if (longitude > 0 && rawLng >= 30 && rawLng <= 80) {
        longitude = -Math.abs(longitude);
      }
      if (latitude > 0 && rawLat >= 0 && rawLat <= 40) {
        latitude = -Math.abs(latitude);
      }
      
      const course = courseStatus & 0x03ff;
  
      return {
        timestamp,
        satellites: satCount,
        latitude: Number(latitude.toFixed(6)),
        longitude: Number(longitude.toFixed(6)),
        speed,
        course,
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