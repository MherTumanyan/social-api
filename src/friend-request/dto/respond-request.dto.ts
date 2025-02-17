import { IsEnum } from 'class-validator';

enum RespondStatus {
  Accepted = 'accepted',
  Declined = 'declined',
}

export class RespondRequestDto {
  @IsEnum(RespondStatus)
  status: RespondStatus;
}
