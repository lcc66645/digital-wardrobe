import { ApiProperty } from '@nestjs/swagger';
import { AuditStatus } from '@dw/shared';
import { IsIn } from 'class-validator';

/** 管理端穿搭审核请求体（仅允许通过/驳回，不允许直接置回待审核） */
export class AuditOutfitDto {
  @ApiProperty({
    description: '审核结果：APPROVED 通过 / REJECTED 驳回',
    enum: AuditStatus,
  })
  @IsIn([AuditStatus.APPROVED, AuditStatus.REJECTED], {
    message: '审核结果只能为通过(APPROVED)或驳回(REJECTED)',
  })
  auditStatus!: AuditStatus;
}
