
import { IsString, IsOptional, IsEnum, MinLength, MaxLength } from 'class-validator';
import { MessageStatus } from '../../shared/models/message.model';

export class UpdateMessageDto {
  @IsOptional()
  @IsEnum(MessageStatus)
  status?: MessageStatus;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  adminResponse?: string;
}
