import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private configService: ConfigService) {}
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) return false;

    try {
      const token = authHeader.split(' ')[1];
      const jwtSecret = this.configService.get<string>('JWT_SECRET');

      if (!jwtSecret) {
        throw new Error('JWT_SECRET is not set in environment variables');
      }
      const decoded = jwt.verify(token, jwtSecret);
      request.user = decoded;
      return true;
    } catch (error) {
      return false;
    }
  }
}
