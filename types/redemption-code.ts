/**
 * 兑换码状态枚举
 * ACTIVE: 有效
 * USED: 已使用
 * EXPIRED: 已过期
 */
export enum RedemptionCodeStatus {
  ACTIVE = 0,
  USED = 1,
  EXPIRED = 2,
}

/**
 * 兑换码实体
 */
export interface RedemptionCode {
  id: number;
  uuid: string;
  code: string;
  categoryId: number | null;
  description: string | null;
  expireDate: number | null;
  status: RedemptionCodeStatus;
  notifyDays: number | null;
  isNotifyEnabled: boolean;
  createdAt: number;
  updatedAt: number;
  usedAt: number | null;
}

/**
 * 创建兑换码DTO
 */
export interface CreateCodeDTO {
  code: string;
  categoryId?: number | null;
  description?: string;
  expireDate?: number | null;
  notifyDays?: number | null;
  isNotifyEnabled?: boolean;
}

/**
 * 更新兑换码DTO
 */
export interface UpdateCodeDTO extends Partial<CreateCodeDTO> {
  status?: RedemptionCodeStatus;
  usedAt?: number | null;
}

/**
 * 兑换码筛选条件
 */
export interface CodeFilter {
  categoryIds: number[];
  status: RedemptionCodeStatus | null;
  expireRange: 'expiring' | 'thisMonth' | null;
}

/**
 * 排序选项
 */
export interface SortOption {
  field: 'createdAt' | 'expireDate' | 'updatedAt';
  order: 'asc' | 'desc';
}

/**
 * 兑换码数据库原始行（snake_case字段）
 */
export interface RedemptionCodeRow {
  id: number;
  uuid: string | null;
  code: string;
  category_id: number | null;
  description: string | null;
  expire_date: number | null;
  status: number;
  notify_days: number | null;
  is_notify_enabled: number;
  created_at: number;
  updated_at: number;
  used_at: number | null;
}
