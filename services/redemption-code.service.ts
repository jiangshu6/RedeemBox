import {
  RedemptionCode,
  CreateCodeDTO,
  UpdateCodeDTO,
  CodeFilter,
  SortOption,
  RedemptionCodeStatus,
} from '@/types';
import { CodeRepository } from '@/repositories/code.repository';
import { validateCode, validateDescription, validateNotifyDays } from '@/utils/validation';
import { copyToClipboard } from './clipboard.service';

/**
 * 验证结果
 */
interface ServiceResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * 兑换码业务服务
 */
export const RedemptionCodeService = {
  /**
   * 创建兑换码
   */
  async createCode(data: CreateCodeDTO): Promise<ServiceResult<RedemptionCode>> {
    // 验证兑换码内容
    const codeValidation = validateCode(data.code);
    if (!codeValidation.valid) {
      return { success: false, error: codeValidation.message };
    }

    // 验证备注
    if (data.description) {
      const descValidation = validateDescription(data.description);
      if (!descValidation.valid) {
        return { success: false, error: descValidation.message };
      }
    }

    // 验证通知天数
    if (data.notifyDays !== null && data.notifyDays !== undefined) {
      const daysValidation = validateNotifyDays(data.notifyDays);
      if (!daysValidation.valid) {
        return { success: false, error: daysValidation.message };
      }
    }

    try {
      const code = await CodeRepository.create(data);
      if (!code) {
        return { success: false, error: '创建兑换码失败' };
      }
      return { success: true, data: code };
    } catch (error) {
      return { success: false, error: '创建兑换码失败' };
    }
  },

  /**
   * 更新兑换码
   */
  async updateCode(id: number, data: UpdateCodeDTO): Promise<ServiceResult<RedemptionCode>> {
    // 验证兑换码内容
    if (data.code !== undefined) {
      const codeValidation = validateCode(data.code);
      if (!codeValidation.valid) {
        return { success: false, error: codeValidation.message };
      }
    }

    // 验证备注
    if (data.description !== undefined) {
      const descValidation = validateDescription(data.description);
      if (!descValidation.valid) {
        return { success: false, error: descValidation.message };
      }
    }

    // 验证通知天数
    if (data.notifyDays !== null && data.notifyDays !== undefined) {
      const daysValidation = validateNotifyDays(data.notifyDays);
      if (!daysValidation.valid) {
        return { success: false, error: daysValidation.message };
      }
    }

    try {
      const code = await CodeRepository.update(id, data);
      if (!code) {
        return { success: false, error: '兑换码不存在' };
      }
      return { success: true, data: code };
    } catch (error) {
      return { success: false, error: '更新兑换码失败' };
    }
  },

  /**
   * 删除兑换码
   */
  async deleteCode(id: number): Promise<ServiceResult> {
    try {
      const deleted = await CodeRepository.delete(id);
      if (!deleted) {
        return { success: false, error: '兑换码不存在' };
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: '删除兑换码失败' };
    }
  },

  /**
   * 批量删除兑换码
   */
  async deleteCodes(ids: number[]): Promise<ServiceResult<number>> {
    try {
      const count = await CodeRepository.deleteMany(ids);
      return { success: true, data: count };
    } catch (error) {
      return { success: false, error: '批量删除失败' };
    }
  },

  /**
   * 获取兑换码详情
   */
  async getCodeById(id: number): Promise<ServiceResult<RedemptionCode>> {
    try {
      const code = await CodeRepository.getById(id);
      if (!code) {
        return { success: false, error: '兑换码不存在' };
      }
      return { success: true, data: code };
    } catch (error) {
      return { success: false, error: '获取兑换码失败' };
    }
  },

  /**
   * 获取兑换码列表
   */
  async getCodes(filter?: CodeFilter, sort?: SortOption): Promise<ServiceResult<RedemptionCode[]>> {
    try {
      const codes = await CodeRepository.getAll(filter, sort);
      return { success: true, data: codes };
    } catch (error) {
      return { success: false, error: '获取兑换码列表失败' };
    }
  },

  /**
   * 搜索兑换码
   */
  async searchCodes(keyword: string): Promise<ServiceResult<RedemptionCode[]>> {
    if (!keyword || keyword.trim().length === 0) {
      return this.getCodes();
    }
    try {
      const codes = await CodeRepository.search(keyword.trim());
      return { success: true, data: codes };
    } catch (error) {
      return { success: false, error: '搜索失败' };
    }
  },

  /**
   * 复制兑换码到剪贴板
   */
  async copyCode(code: string): Promise<ServiceResult> {
    try {
      await copyToClipboard(code);
      return { success: true };
    } catch (error) {
      return { success: false, error: '复制失败' };
    }
  },

  /**
   * 标记为已使用
   */
  async markAsUsed(id: number): Promise<ServiceResult<RedemptionCode>> {
    try {
      const code = await CodeRepository.markAsUsed(id);
      if (!code) {
        return { success: false, error: '兑换码不存在' };
      }
      return { success: true, data: code };
    } catch (error) {
      return { success: false, error: '标记失败' };
    }
  },

  /**
   * 检查并更新过期状态
   */
  async checkAndUpdateExpired(): Promise<ServiceResult<number>> {
    try {
      const count = await CodeRepository.updateExpiredStatus();
      return { success: true, data: count };
    } catch (error) {
      return { success: false, error: '更新过期状态失败' };
    }
  },

  /**
   * 获取即将到期的兑换码
   */
  async getExpiringCodes(days: number): Promise<ServiceResult<RedemptionCode[]>> {
    try {
      const codes = await CodeRepository.getExpiringCodes(days);
      return { success: true, data: codes };
    } catch (error) {
      return { success: false, error: '获取即将到期兑换码失败' };
    }
  },

  /**
   * 获取兑换码总数
   */
  async getCodeCount(): Promise<ServiceResult<number>> {
    try {
      const count = await CodeRepository.getCount();
      return { success: true, data: count };
    } catch (error) {
      return { success: false, error: '获取数量失败' };
    }
  },
};
