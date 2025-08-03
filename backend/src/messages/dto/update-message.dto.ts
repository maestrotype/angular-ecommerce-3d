
import { IsString, IsOptional, IsEnum, MinLength, MaxLength } from 'class-validator';

export class UpdateMessageDto {
  @IsOptional()
  @IsEnum(['new', 'in_progress', 'answered', 'closed'])
  status?: 'new' | 'in_progress' | 'answered' | 'closed';

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  adminResponse?: string;
}
