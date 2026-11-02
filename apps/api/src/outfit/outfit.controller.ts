import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Outfit as OutfitVo, PaginatedResult } from '@dw/shared';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { RequestUser } from '../auth/jwt.strategy';
import { OutfitDetailVo, OutfitService } from './outfit.service';
import { CreateOutfitDto } from './dto/create-outfit.dto';
import { UpdateOutfitDto } from './dto/update-outfit.dto';
import { QueryOutfitDto } from './dto/query-outfit.dto';

@ApiTags('outfit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('outfit')
export class OutfitController {
  constructor(private readonly outfitService: OutfitService) {}

  @Post()
  @ApiOperation({ summary: '创建穿搭（打卡，含单品关联）' })
  create(
    @CurrentUser() current: RequestUser,
    @Body() dto: CreateOutfitDto,
  ): Promise<OutfitDetailVo> {
    return this.outfitService.create(current.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: '分页查询我的穿搭（支持筛选）' })
  findAll(
    @CurrentUser() current: RequestUser,
    @Query() query: QueryOutfitDto,
  ): Promise<PaginatedResult<OutfitVo>> {
    return this.outfitService.findAll(current.userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: '查询穿搭详情（含单品明细）' })
  findOne(
    @CurrentUser() current: RequestUser,
    @Param('id') id: string,
  ): Promise<OutfitDetailVo> {
    return this.outfitService.findOne(current.userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新穿搭（可重新关联单品/发布）' })
  update(
    @CurrentUser() current: RequestUser,
    @Param('id') id: string,
    @Body() dto: UpdateOutfitDto,
  ): Promise<OutfitDetailVo> {
    return this.outfitService.update(current.userId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除穿搭' })
  remove(
    @CurrentUser() current: RequestUser,
    @Param('id') id: string,
  ): Promise<void> {
    return this.outfitService.remove(current.userId, id);
  }
}
