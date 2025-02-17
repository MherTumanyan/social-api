import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class UserService {
  constructor(private db: DatabaseService) {}

  async searchUsers(firstName?: string, lastName?: string, age?: number) {
    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (firstName) {
      conditions.push(`first_name ILIKE $${params.length + 1}`);
      params.push(`%${firstName}%`);
    }
    if (lastName) {
      conditions.push(`last_name ILIKE $${params.length + 1}`);
      params.push(`%${lastName}%`);
    }
    if (age) {
      conditions.push(`age = $${params.length + 1}`);
      params.push(age);
    }

    const query = `
      SELECT id, first_name, last_name, age, email 
      FROM users 
      ${conditions.length ? 'WHERE ' + conditions.join(' AND ') : ''}
    `;

    try {
      const result = await this.db.query(query, params);
      if (result.length === 0) {
        throw new HttpException(
          'No users found matching the criteria',
          HttpStatus.NOT_FOUND,
        );
      }
      return result;
    } catch (error) {
      throw new HttpException(
        `An error occurred while searching for users: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
