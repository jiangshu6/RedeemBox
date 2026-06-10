import { Category, CategoryWithCount, CreateCategoryDTO, UpdateCategoryDTO } from '@/types';
import { CategoryRepository } from '@/repositories/category.repository';
import { validateCategoryName, validateColor } from '@/utils/validation';

/**
 * 验证结果
 */
interface ServiceResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * 类别业务服务
 */
export const CategoryService = {
  /**
   * 创建类别
   */
  async createCategory(data: CreateCategoryDTO): Promise<ServiceResult<Category>> {
    // 验证类别名称
    const nameValidation = validateCategoryName(data.name);
    if (!nameValidation.valid) {
      return { success: false, error: nameValidation.message };
    }

    // 验证颜色格式
    if (data.color) {
      const colorValidation = validateColor(data.color);
      if (!colorValidation.valid) {
        return { success: false, error: colorValidation.message };
      }
    }

    // 检查名称是否重复
    const exists = await CategoryRepository.existsByName(data.name.trim());
    if (exists) {
      return { success: false, error: '类别名称已存在' };
    }

    try {
      const category = await CategoryRepository.create({
        name: data.name.trim(),
        color: data.color,
        expireDate: data.expireDate,
      });
      if (!category) {
        return { success: false, error: '创建类别失败' };
      }
      return { success: true, data: category };
    } catch (error) {
      return { success: false, error: '创建类别失败' };
    }
  },

  /**
   * 更新类别
   */
  async updateCategory(id: number, data: UpdateCategoryDTO): Promise<ServiceResult<Category>> {
    // 验证类别名称
    if (data.name !== undefined) {
      const nameValidation = validateCategoryName(data.name);
      if (!nameValidation.valid) {
        return { success: false, error: nameValidation.message };
      }

      // 检查名称是否重复（排除当前ID）
      const exists = await CategoryRepository.existsByName(data.name.trim(), id);
      if (exists) {
        return { success: false, error: '类别名称已存在' };
      }
    }

    // 验证颜色格式
    if (data.color !== undefined) {
      const colorValidation = validateColor(data.color);
      if (!colorValidation.valid) {
        return { success: false, error: colorValidation.message };
      }
    }

    try {
      const category = await CategoryRepository.update(id, {
        name: data.name?.trim(),
        color: data.color,
        expireDate: data.expireDate,
      });
      if (!category) {
        return { success: false, error: '类别不存在' };
      }
      return { success: true, data: category };
    } catch (error) {
      return { success: false, error: '更新类别失败' };
    }
  },

  /**
   * 删除类别
   */
  async deleteCategory(id: number): Promise<ServiceResult> {
    try {
      const deleted = await CategoryRepository.delete(id);
      if (!deleted) {
        return { success: false, error: '类别不存在' };
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: '删除类别失败' };
    }
  },

  /**
   * 获取所有类别
   */
  async getCategories(): Promise<ServiceResult<Category[]>> {
    try {
      const categories = await CategoryRepository.getAll();
      return { success: true, data: categories };
    } catch (error) {
      return { success: false, error: '获取类别列表失败' };
    }
  },

  /**
   * 获取所有类别（含兑换码数量）
   */
  async getCategoriesWithCount(): Promise<ServiceResult<CategoryWithCount[]>> {
    try {
      const categories = await CategoryRepository.getAllWithCount();
      return { success: true, data: categories };
    } catch (error) {
      return { success: false, error: '获取类别列表失败' };
    }
  },

  /**
   * 更新类别排序
   */
  async reorderCategories(ids: number[]): Promise<ServiceResult> {
    try {
      await CategoryRepository.updateSortOrder(ids);
      return { success: true };
    } catch (error) {
      return { success: false, error: '更新排序失败' };
    }
  },

  /**
   * 根据ID获取类别
   */
  async getCategoryById(id: number): Promise<ServiceResult<Category>> {
    try {
      const category = await CategoryRepository.getById(id);
      if (!category) {
        return { success: false, error: '类别不存在' };
      }
      return { success: true, data: category };
    } catch (error) {
      return { success: false, error: '获取类别失败' };
    }
  },
};
