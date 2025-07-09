
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateMessageDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  senderName: string;

  @IsEmail()
  senderEmail: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  subject: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(2000)
  message: string;
}
