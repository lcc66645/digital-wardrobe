import {
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
import {
  FavoriteItemVo,
  FavoriteToggleVo,
  FollowToggleVo,
  InteractionService,
  LikeToggleVo,
  RelationStatusVo,
  UserBriefVo,
} from './interaction.service';
import { QueryInteractionDto } from './dto/query-interaction.dto';

@ApiTags('interaction')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class InteractionController {
  constructor(private readonly interactionService: InteractionService) {}

  // ---------------- 点赞 ----------------

  @Post('outfit/:id/like')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '点赞穿搭（幂等）' })
  like(
    @CurrentUser() current: RequestUser,
    @Param('id') outfitId: string,
  ): Promise<LikeToggleVo> {
    return this.interactionService.like(current.userId, outfitId);
  }

  @Delete('outfit/:id/like')
  @ApiOperation({ summary: '取消点赞（幂等）' })
  unlike(
    @CurrentUser() current: RequestUser,
    @Param('id') outfitId: string,
  ): Promise<LikeToggleVo> {
    return this.interactionService.unlike(current.userId, outfitId);
  }

  // ---------------- 收藏 ----------------

  @Post('outfit/:id/favorite')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '收藏穿搭（幂等）' })
  favorite(
    @CurrentUser() current: RequestUser,
    @Param('id') outfitId: string,
  ): Promise<FavoriteToggleVo> {
    return this.interactionService.favorite(current.userId, outfitId);
  }

  @Delete('outfit/:id/favorite')
  @ApiOperation({ summary: '取消收藏（幂等）' })
  unfavorite(
    @CurrentUser() current: RequestUser,
    @Param('id') outfitId: string,
  ): Promise<FavoriteToggleVo> {
    return this.interactionService.unfavorite(current.userId, outfitId);
  }

  @Get('users/me/favorites')
  @ApiOperation({ summary: '我的收藏列表（分页）' })
  listMyFavorites(
    @CurrentUser() current: RequestUser,
    @Query() query: QueryInteractionDto,
  ): Promise<PaginatedResult<FavoriteItemVo>> {
    return this.interactionService.listFavorites(current.userId, query);
  }

  // ---------------- 关注 ----------------

  @Post('users/:id/follow')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '关注用户（幂等，不能关注自己）' })
  follow(
    @CurrentUser() current: RequestUser,
    @Param('id') targetId: string,
  ): Promise<FollowToggleVo> {
    return this.interactionService.follow(current.userId, targetId);
  }

  @Delete('users/:id/follow')
  @ApiOperation({ summary: '取消关注（幂等）' })
  unfollow(
    @CurrentUser() current: RequestUser,
    @Param('id') targetId: string,
  ): Promise<FollowToggleVo> {
    return this.interactionService.unfollow(current.userId, targetId);
  }

  @Get('users/:id/follow')
  @ApiOperation({ summary: '查询与某用户的关系状态（是否关注+粉丝/关注数）' })
  relationStatus(
    @CurrentUser() current: RequestUser,
    @Param('id') targetId: string,
  ): Promise<RelationStatusVo> {
    return this.interactionService.relationStatus(current.userId, targetId);
  }

  @Get('users/:id/followers')
  @ApiOperation({ summary: '某用户的粉丝列表（分页）' })
  listFollowers(
    @Param('id') targetId: string,
    @Query() query: QueryInteractionDto,
  ): Promise<PaginatedResult<UserBriefVo>> {
    return this.interactionService.listFollowers(targetId, query);
  }

  @Get('users/:id/following')
  @ApiOperation({ summary: '某用户的关注列表（分页）' })
  listFollowing(
    @Param('id') targetId: string,
    @Query() query: QueryInteractionDto,
  ): Promise<PaginatedResult<UserBriefVo>> {
    return this.interactionService.listFollowing(targetId, query);
  }
}
