import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {AuthRegisterDto } from './dto/auth.register.dto';
import { LoginDto } from './dto/auth.login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: AuthRegisterDto) {
    const userExists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (userExists) throw new ConflictException('E-mail já cadastrado.');

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
      },
    });

    return { id: user.id, email: user.email, name: user.name };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Credenciais inválidas.');

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Credenciais inválidas.');

    const payload = { sub: user.id, email: user.email };

    const tokenOptions = {
      secret: process.env.JWT_SECRET,
      expiresIn: 604800
    };

    const expiresInDays = 7;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    return {
      access_token: await this.jwtService.signAsync(payload, tokenOptions),
      expires_at: expiresAt.toISOString(),
      user: { email: user.email, name: user.name },
    };
  }
}
