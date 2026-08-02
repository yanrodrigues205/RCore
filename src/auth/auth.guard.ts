import {
CanActivate,
ExecutionContext,
Injectable,
UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
constructor(private jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        var request : any = context.switchToHttp().getRequest<Request>();
        const token = this.extractTokenFromHeader(request);

        if (!token) {
        throw new UnauthorizedException('Authentication token not found.');
        }

        try {
        const payload = await this.jwtService.verifyAsync(token, {
            secret: process.env.JWT_SECRET,
        });

        request['user'] = payload;
        } catch (error) {
        throw new UnauthorizedException('Invalid or expired authentication token.');
        }

        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const authorization = request.headers.authorization;
        if (!authorization) {
        return undefined;
        }

        const [type, token] = authorization.split(' ');  
        return type?.toLowerCase() === 'bearer' ? token : undefined;
    }
}