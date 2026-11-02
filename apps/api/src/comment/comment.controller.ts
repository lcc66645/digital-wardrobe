import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { PaginatedResult } from '@dw/shared';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { RequestUser } from '../auth/jwt.strategy';
import { CommentService, CommentVo } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { QueryCommentDto } from './dto/query-comment.dto';

@ApiTags('comment')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post('outfit/:id/comments')
  @ApiOperation({ summary: '发表评论/回复（针对已发布且审核通过的穿搭）' })
  create(
    @CurrentUser() current: RequestUser,
    @Param('id') outfitId: string,
    @Body() dto: CreateCommentDto,
  ): Promise<CommentVo> {
    return this.commentService.create(current.userId, outfitId, dto);
  }

  @Get('outfit/:id/comments')
  @ApiOperation({ summary: '分页查询某穿搭的评论（最新/最热）' })
  findAll(
    @Param('id') outfitId: string,
    @Query() query: QueryCommentDto,
  ): Promise<PaginatedResult<CommentVo>> {
    return this.commentService.findAll(outfitId, query);
  }

  @Delete('comments/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除自己的评论' })
  remove(
    @CurrentUser() current: RequestUser,
    @Param('id') commentId: string,
  ): Promise<void> {
    return this.commentService.remove(current.userId, commentId);
  }
}
