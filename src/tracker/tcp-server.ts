import * as net from 'node:net';
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

@Injectable()
export class TcpServer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TcpServer.name);

  private server: net.Server;

  private readonly host = '0.0.0.0';
  private readonly port = 5000;

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
      this.logger.log(
        `Servidor TCP iniciado em ${this.host}:${this.port}`,
      );
    });

    this.server.on('error', (error) => {
      this.logger.error('Erro no servidor TCP', error);
    });
  }

  private handleConnection(socket: net.Socket) {
    const remoteAddress = socket.remoteAddress;
    const remotePort = socket.remotePort;

    this.logger.log(
      `Rastreador conectado: ${remoteAddress}:${remotePort}`,
    );

    socket.on('data', (data: Buffer) => {
      this.handleData(socket, data);
    });

    socket.on('close', () => {
      this.logger.log(
        `Rastreador desconectado: ${remoteAddress}:${remotePort}`,
      );
    });

    socket.on('error', (error) => {
      this.logger.error(
        `Erro na conexão ${remoteAddress}:${remotePort}`,
        error.message,
      );
    });
  }

  private handleData(
    socket: net.Socket,
    data: Buffer,
  ) {
    const hex = data.toString('hex').toUpperCase();

    const ascii = data
      .toString('ascii')
      .replace(/[^\x20-\x7E]/g, '.');

    this.logger.log(`Pacote recebido`);

    this.logger.log(`HEX:   ${hex}`);

    this.logger.log(`ASCII: ${ascii}`);

    this.logger.log(`BYTES: ${data.length}`);

    // Neste momento não respondemos nada.
    //
    // Depois que identificarmos o protocolo
    // podemos enviar o ACK correto:
    //
    // socket.write(Buffer.from('...', 'hex'));
  }

  private stop() {
    if (!this.server) {
      return;
    }

    this.server.close(() => {
      this.logger.log('Servidor TCP encerrado');
    });
  }
}