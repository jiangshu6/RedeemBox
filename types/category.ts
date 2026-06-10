/**
 * 类别实体
 */
export interface Category {
  id: number;
  uuid: string;
  name: string;
  color: string;
  sortOrder: number;
  expireDate: number | null;
  createdAt: number;
  updatedAt: number;
}

/**
 * 类别（含兑换码数量）
 */
export interface CategoryWithCount extends Category {
  codeCount: number;
}

/**
 * 创建类别DTO
 */
export interface CreateCategoryDTO {
  name: string;
  color?: string;
  expireDate?: number | null;
}

/**
 * 更新类别DTO
 */
export interface UpdateCategoryDTO {
  name?: string;
  color?: string;
  expireDate?: number | null;
}

/**
 * 类别数据库原始行（snake_case字段）
 */
export interface CategoryRow {
  id: number;
  uuid: string | null;
  name: string;
  color: string;
  sort_order: number;
  expire_date: number | null;
  created_at: number;
  updated_at: number;
}
