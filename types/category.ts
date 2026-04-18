/**
 * 类别实体
 */
export interface Category {
  id: number;
  name: string;
  color: string;
  sortOrder: number;
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
}

/**
 * 更新类别DTO
 */
export interface UpdateCategoryDTO {
  name?: string;
  color?: string;
}

/**
 * 类别数据库原始行（snake_case字段）
 */
export interface CategoryRow {
  id: number;
  name: string;
  color: string;
  sort_order: number;
  created_at: number;
  updated_at: number;
}
