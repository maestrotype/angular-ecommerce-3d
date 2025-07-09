
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateMessageDto {
  @IsOptional()
  @IsEnum(['new', 'read', 'archived'])
  status?: 'new' | 'read' | 'archived';

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  adminReply?: string;
}
