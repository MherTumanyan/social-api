import { JwtAuthGuard } from './../auth/jwt-auth.guard';
import {
  Controller,
  Post,
  Param,
  Get,
  Req,
  UseGuards,
  Body,
} from '@nestjs/common';
import { FriendRequestService } from './friend-request.service';
import { AuthRequest } from 'src/auth/auth-request.interface';
import { RespondRequestDto } from './dto/respond-request.dto';

@Controller('friend-request')
@UseGuards(JwtAuthGuard)
export class FriendRequestController {
  constructor(private readonly friendRequestService: FriendRequestService) {}

  @Post(':receiverId')
  async sendRequest(
    @Param('receiverId') receiverId: number,
    @Req() request: AuthRequest,
  ) {
    const senderId = request.user.userId;
    return this.friendRequestService.sendRequest(senderId, +receiverId);
  }

  @Get('my')
  async getRequests(@Req() request: AuthRequest) {
    const userId = request.user.userId;
    return this.friendRequestService.getRequests(userId);
  }

  @Post(':requestId/respond')
  async respondToRequest(
    @Param('requestId') requestId: number,
    @Body() body: RespondRequestDto,
    @Req() request: AuthRequest,
  ) {
    const userId = request.user.userId;
    return this.friendRequestService.respondToRequest(
      requestId,
      body.status,
      userId,
    );
  }
}
