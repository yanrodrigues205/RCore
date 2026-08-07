import * as net from 'node:net';
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { TrackerService } from './tracker.service';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class TrackerServer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TrackerServer.name);
  private server: net.Server;

  private readonly host = '0.0.0.0';
  private readonly port = process.env.TCP_PORT ? Number(process.env.TCP_PORT) : 5000;

  constructor(private readonly trackerService: TrackerService) {}

  onModuleInit() {
    this.start();
  }

  onModuleDestroy() {
    this.stop();
  }

  private start() {
    this.server = net.createServer((socket) => {
      this.handleConnection(socket);
    });

    this.server.listen(this.port, this.host, () => {
      this.logger.log(`Servidor TCP iniciado em ${this.host}:${this.port}`);
    });

    this.server.on('error', (error) => {
      this.logger.error('Erro no servidor TCP', error);
    });
  }

  private handleConnection(socket: net.Socket) {
    const remoteAddress = socket.remoteAddress;
    const remotePort = socket.remotePort;

    this.logger.log(`Rastreador conectado: ${remoteAddress}:${remotePort}`);

    socket.on('data', (data: Buffer) => {
      const hex = data.toString('hex').toUpperCase();
      const ascii = data.toString('ascii').replace(/[^\x20-\x7E]/g, '.');

      this.logger.log(`Pacote recebido de ${remoteAddress}:${remotePort}`);
      this.logger.log(`HEX:   ${hex}`);
      this.logger.log(`ASCII: ${ascii}`);
      this.logger.log(`BYTES: ${data.length}`);

      this.trackerService.processPacket(socket, data);
    });

    socket.on('close', () => {
      this.logger.log(`Rastreador desconectado: ${remoteAddress}:${remotePort}`);
    });

    socket.on('error', (error) => {
      this.logger.error(`Erro na conexão ${remoteAddress}:${remotePort}`, error.message);
    });
  }

  private stop() {
    if (!this.server) return;
    this.server.close(() => {
      this.logger.log('Servidor TCP encerrado');
    });
  }
}