import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';

import { DatabaseService } from '../database/database.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private db: DatabaseService,
    private configService: ConfigService,
  ) {}

  async register(
    firstName: string,
    lastName: string,
    age: number,
    email: string,
    password: string,
  ) {
    try {
      const existingUserQuery = `SELECT id FROM users WHERE email = $1`;
      const existingUser = await this.db.query(existingUserQuery, [
        email.trim().toLowerCase(),
      ]);

      if (existingUser.length) {
        throw new HttpException(
          'User with this email already exists.',
          HttpStatus.CONFLICT,
        );
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const query = `INSERT INTO users (first_name, last_name, age, email, password_hash) 
                    VALUES ($1, $2, $3, $4, $5) RETURNING id, first_name, last_name, email`;

      const newUser = await this.db.query(query, [
        firstName.trim(),
        lastName.trim(),
        age,
        email.trim().toLowerCase(),
        hashedPassword,
      ]);

      return newUser;
    } catch (error) {
      throw new HttpException(
        'Error registering user: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async login(email: string, password: string) {
    try {
      const userQuery = `SELECT id, password_hash FROM users WHERE email = $1`;
      const user = await this.db.query(userQuery, [email.trim().toLowerCase()]);

      if (
        !user.length ||
        !(await bcrypt.compare(password, user[0].password_hash))
      ) {
        throw new HttpException(
          'Invalid credentials.',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const jwtSecret = this.configService.get<string>('JWT_SECRET');

      if (!jwtSecret) {
        throw new HttpException(
          'JWT_SECRET is not set in environment variables',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const token = jwt.sign({ userId: user[0].id }, jwtSecret, {
        expiresIn: '1h',
      });

      return { token };
    } catch (error) {
      throw new HttpException(
        'Error logging in: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
