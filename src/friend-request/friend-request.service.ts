import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class FriendRequestService {
  constructor(private db: DatabaseService) {}

  async sendRequest(senderId: number, receiverId: number) {
    if (senderId === receiverId) {
      throw new HttpException(
        'You cannot send a friend request to yourself.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const checkQuery = `SELECT COUNT(*) FROM friend_requests 
                            WHERE((sender_id = $1 AND receiver_id = $2) 
                            OR (sender_id = $2 AND receiver_id = $1)) 
                          AND status IN ('pending', 'accepted')
  `;

    const existingRequest = await this.db.query(checkQuery, [
      senderId,
      receiverId,
    ]);

    if (existingRequest[0].count > 0) {
      throw new HttpException(
        'Friend request already exists or you are already friends.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const query = `INSERT INTO friend_requests (sender_id, receiver_id, status) 
                   VALUES ($1, $2, 'pending') RETURNING id`;

    try {
      const result = await this.db.query(query, [senderId, receiverId]);
      return { id: result[0].id };
    } catch (error) {
      console.error('Error sending friend request:', error);
      throw new HttpException(
        'Failed to send friend request. Please try again later.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getRequests(userId: number) {
    const query = `
      SELECT request.id, sender.first_name, sender.last_name, request.status 
      FROM friend_requests AS request
      JOIN users AS sender ON request.sender_id = sender.id 
      WHERE request.receiver_id = $1 AND request.status = 'pending'`;

    try {
      const requests = await this.db.query(query, [userId]);
      return requests; 
    } catch (error) {
      console.error('Error fetching friend requests:', error);
      throw new HttpException(
        'Failed to fetch friend requests. Please try again later.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async respondToRequest(
    requestId: number,
    status: 'accepted' | 'declined',
    userId: number,
  ) {
    const checkQuery = `SELECT receiver_id FROM friend_requests WHERE id = $1 AND status = 'pending'`;
    const result = await this.db.query(checkQuery, [requestId]);

    if (!result.length || result[0].receiver_id !== userId) {
      throw new HttpException(
        'Unauthorized to respond to this friend request.',
        HttpStatus.FORBIDDEN,
      );
    }

    const query = `UPDATE friend_requests SET status = $1 WHERE id = $2 RETURNING id`;
    try {
      const updatedRequest = await this.db.query(query, [status, requestId]);
      return { id: updatedRequest[0].id, status };
    } catch (error) {
      console.error('Error responding to friend request:', error);
      throw new HttpException(
        'Failed to respond to friend request. Please try again later.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
