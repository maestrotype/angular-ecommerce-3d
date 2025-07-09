
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ReplyMessageDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(2000)
  reply: string;
}
