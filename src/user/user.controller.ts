import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { SearchDto } from './dto/search.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Get('search')
  async search(@Query() query: SearchDto) {
    const { firstName, lastName, age } = query;
    return this.userService.searchUsers(firstName, lastName, age);
  }
}
