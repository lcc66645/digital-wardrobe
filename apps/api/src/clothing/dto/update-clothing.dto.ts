import { PartialType } from '@nestjs/swagger';
import { CreateClothingDto } from './create-clothing.dto';

/** 更新衣物入参：全部字段可选，仅更新传入字段 */
export class UpdateClothingDto extends PartialType(CreateClothingDto) {}
