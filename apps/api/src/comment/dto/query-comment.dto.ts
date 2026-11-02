import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

/** 评论列表分页+排序参数 */
export class QueryCommentDto extends PaginationDto {
  @ApiPropertyOptional({
    description: '排序方式：latest=最新优先（默认），hot=点赞最多优先',
    enum: ['latest', 'hot'],
    default: 'latest',
  })
  @IsOptional()
  @IsIn(['latest', 'hot'], { message: '排序方式只支持 latest 或 hot' })
  sort?: 'latest' | 'hot';
}
