import { Test, TestingModule } from '@nestjs/testing';
import { TrackerService } from './tracker.service';
import * as net from 'node:net';

describe('TrackerService', () => {
  let service: TrackerService;
  let mockSocket: Partial<net.Socket>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TrackerService],
    }).compile();

    service = module.get<TrackerService>(TrackerService);
    mockSocket = {
      write: jest.fn((buffer: Uint8Array | string, cb?: (err?: Error) => void) => {
        if (typeof cb === 'function') cb();
        return true;
      }),
    };
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processPacket', () => {
    it('deve processar o pacote de LOGIN (0x01) e responder com o ACK correto', () => {

      const rawHex = '78780D010869890083720296000B40840D0A';
      const inputBuffer = Buffer.from(rawHex, 'hex');

      service.processPacket(mockSocket as net.Socket, inputBuffer);

z
      expect(mockSocket.write).toHaveBeenCalledTimes(1);


      const writtenBuffer = (mockSocket.write as jest.Mock).mock.calls[0][0] as Buffer;
      const responseHex = writtenBuffer.toString('hex').toUpperCase();

      expect(writtenBuffer.length).toBe(10); 
      expect(responseHex.substring(0, 4)).toBe('7878');
      expect(responseHex.substring(4, 6)).toBe('05');
      expect(responseHex.substring(6, 8)).toBe('01'); 
      expect(responseHex.substring(8, 12)).toBe('000B'); 
      expect(responseHex.endsWith('0D0A')).toBe(true);  
    });

    it('deve ignorar pacotes com tamanho inválido ou sem cabeçalho 7878', () => {
      const invalidBuffer = Buffer.from('12345678', 'hex');

      service.processPacket(mockSocket as net.Socket, invalidBuffer);

      expect(mockSocket.write).not.toHaveBeenCalled();
    });
  });
});