import { useState, useCallback, useEffect } from 'react';
import { RedemptionCode, CreateCodeDTO, UpdateCodeDTO } from '@/types';
import { useCodes } from './useCodes';
import { useCategoryStore } from '@/store/category.store';
import { useSettingsStore } from '@/store/settings.store';
import { validateCode, validateDescription, validateNotifyDays } from '@/utils/validation';
import { NotificationConstants } from '@/constants';

/**
 * 表单字段
 */
interface CodeFormData {
  code: string;
  categoryId: number | null;
  description: string;
  expireDate: Date | null;
  notifyDays: number;
  isNotifyEnabled: boolean;
}

/**
 * 表单错误
 */
interface FormErrors {
  code?: string;
  description?: string;
  notifyDays?: string;
}

/**
 * 兑换码表单Hook
 */
export function useCodeForm(initialCode?: RedemptionCode | null) {
  const [formData, setFormData] = useState<CodeFormData>({
    code: '',
    categoryId: null,
    description: '',
    expireDate: null,
    notifyDays: NotificationConstants.DEFAULT_NOTIFY_DAYS,
    isNotifyEnabled: true,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const { createCode, updateCode } = useCodes();
  const { categories, fetchCategories } = useCategoryStore();
  const { defaultNotifyDays, loadSettings } = useSettingsStore();

  // 初始化表单数据
  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchCategories(), loadSettings()]);
    };
    init();
  }, [fetchCategories, loadSettings]);

  // 设置初始值
  useEffect(() => {
    if (initialCode) {
      setFormData({
        code: initialCode.code,
        categoryId: initialCode.categoryId,
        description: initialCode.description ?? '',
        expireDate: initialCode.expireDate ? new Date(initialCode.expireDate) : null,
        notifyDays: initialCode.notifyDays ?? NotificationConstants.DEFAULT_NOTIFY_DAYS,
        isNotifyEnabled: initialCode.isNotifyEnabled,
      });
    } else {
      // 新建时使用默认通知天数
      setFormData((prev) => ({
        ...prev,
        notifyDays: defaultNotifyDays,
      }));
    }
  }, [initialCode, defaultNotifyDays]);

  /**
   * 更新表单字段
   */
  const updateField = useCallback(<K extends keyof CodeFormData>(
    field: K,
    value: CodeFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // 清除该字段的错误
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  /**
   * 验证表单
   */
  const validate = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    // 验证兑换码内容
    const codeValidation = validateCode(formData.code);
    if (!codeValidation.valid) {
      newErrors.code = codeValidation.message;
    }

    // 验证备注
    if (formData.description) {
      const descValidation = validateDescription(formData.description);
      if (!descValidation.valid) {
        newErrors.description = descValidation.message;
      }
    }

    // 验证通知天数
    if (formData.isNotifyEnabled && formData.notifyDays !== null) {
      const daysValidation = validateNotifyDays(formData.notifyDays);
      if (!daysValidation.valid) {
        newErrors.notifyDays = daysValidation.message;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  /**
   * 提交表单
   */
  const submit = useCallback(async (): Promise<boolean> => {
    if (!validate()) {
      return false;
    }

    setLoading(true);

    const data: CreateCodeDTO | UpdateCodeDTO = {
      code: formData.code,
      categoryId: formData.categoryId,
      description: formData.description || undefined,
      expireDate: formData.expireDate ? formData.expireDate.getTime() : undefined,
      notifyDays: formData.isNotifyEnabled ? formData.notifyDays : undefined,
      isNotifyEnabled: formData.isNotifyEnabled,
    };

    let success: boolean;
    if (initialCode) {
      success = await updateCode(initialCode.id, data as UpdateCodeDTO);
    } else {
      success = await createCode(data as CreateCodeDTO);
    }

    setLoading(false);
    return success;
  }, [formData, initialCode, validate, createCode, updateCode]);

  return {
    formData,
    errors,
    loading,
    categories,
    updateField,
    validate,
    submit,
  };
}
