import { IsString, IsInt, IsEmail, MinLength, Min } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(1)
  firstName: string;

  @IsString()
  @MinLength(1)
  lastName: string;

  @IsInt()
  @Min(1)
  age: number;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}
