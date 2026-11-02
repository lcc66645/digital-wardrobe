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
import type { Clothing as ClothingVo, PaginatedResult } from '@dw/shared';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { RequestUser } from '../auth/jwt.strategy';
import { ClothingService } from './clothing.service';
import { CreateClothingDto } from './dto/create-clothing.dto';
import { UpdateClothingDto } from './dto/update-clothing.dto';
import { QueryClothingDto } from './dto/query-clothing.dto';

@ApiTags('clothing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('clothing')
export class ClothingController {
  constructor(private readonly clothingService: ClothingService) {}

  @Post()
  @ApiOperation({ summary: '新增衣物' })
  create(
    @CurrentUser() current: RequestUser,
    @Body() dto: CreateClothingDto,
  ): Promise<ClothingVo> {
    return this.clothingService.create(current.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: '分页查询我的衣物（支持筛选）' })
  findAll(
    @CurrentUser() current: RequestUser,
    @Query() query: QueryClothingDto,
  ): Promise<PaginatedResult<ClothingVo>> {
    return this.clothingService.findAll(current.userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: '查询单件衣物' })
  findOne(
    @CurrentUser() current: RequestUser,
    @Param('id') id: string,
  ): Promise<ClothingVo> {
    return this.clothingService.findOne(current.userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新衣物' })
  update(
    @CurrentUser() current: RequestUser,
    @Param('id') id: string,
    @Body() dto: UpdateClothingDto,
  ): Promise<ClothingVo> {
    return this.clothingService.update(current.userId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除衣物' })
  remove(
    @CurrentUser() current: RequestUser,
    @Param('id') id: string,
  ): Promise<void> {
    return this.clothingService.remove(current.userId, id);
  }
}
