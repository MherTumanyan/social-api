import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as pgPromise from 'pg-promise';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private db;

  constructor(private configService: ConfigService) {
    const pgp = pgPromise();
    const databaseUrl = this.configService.get<string>('DATABASE_URL');
    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not defined in environment variables');
    }
    this.db = pgp(databaseUrl);
  }

  async query(query: string, params?: any[]) {
    return this.db.any(query, params);
  }

  async onModuleInit() {
    console.log('Database connection initialized');
  }

  async onModuleDestroy() {
    await this.db.$pool.end();
    console.log('Database connection closed');
  }
}
