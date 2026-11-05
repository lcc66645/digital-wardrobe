import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FeedbackType } from '@dw/shared';
import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

/** 提交意见反馈入参：类型、内容必填；截图、联系方式可选 */
export class CreateFeedbackDto {
  @ApiProperty({
    description: '反馈类型：BUG 故障 / SUGGESTION 建议 / COMPLAINT 投诉 / OTHER 其他',
    enum: FeedbackType,
    example: FeedbackType.BUG,
  })
  @IsEnum(FeedbackType, { message: '反馈类型取值不合法' })
  type!: FeedbackType;

  @ApiProperty({
    description: '反馈内容，1–500 字',
    example: '拍照识别后点击保存偶尔会闪退',
  })
  @IsString()
  @MinLength(1, { message: '反馈内容至少 1 个字' })
  @MaxLength(500, { message: '反馈内容最多 500 个字' })
  content!: string;

  @ApiPropertyOptional({
    description: '问题截图 URL（可选）',
    example: 'https://cdn.example.com/feedback/shot.png',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: '截图地址过长' })
  screenshot?: string;

  @ApiPropertyOptional({
    description: '联系方式（手机号/邮箱/微信，可选），便于回访',
    example: '13800000000',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: '联系方式最多 100 个字' })
  contact?: string;
}
