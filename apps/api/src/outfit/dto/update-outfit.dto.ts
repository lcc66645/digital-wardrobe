import { PartialType } from '@nestjs/swagger';
import { CreateOutfitDto } from './create-outfit.dto';

/** 更新穿搭入参：全部字段可选，仅更新传入字段；传入 items 时重新关联单品 */
export class UpdateOutfitDto extends PartialType(CreateOutfitDto) {}
