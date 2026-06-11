import { useState, useCallback, useEffect } from 'react';
import { StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useCategories } from '@/hooks/useCategories';
import { useCategoryStore } from '@/store/category.store';
import { useUIStore } from '@/store/ui.store';
import { CategoryListItem, CategoryFormModal } from '@/components/category';
import { EmptyState, ConfirmDialog, Toast, Toolbar } from '@/components/common';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { CategoryWithCount, CreateCategoryDTO, UpdateCategoryDTO } from '@/types';

/**
 * 类别管理页面
 * 使用自定义工具栏显示标题
 */
export default function CategoryScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  const {
    categories,
    loading,
    loadCategories,
    createCategory,
    updateCategory,
  } = useCategories();

  // 直接从 store 获取 deleteCategory 方法（接受 ID 参数）
  const deleteCategoryFromStore = useCategoryStore((state) => state.deleteCategory);

  const { confirmDialog, toast, hideToast } = useUIStore();

  const [formVisible, setFormVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryWithCount | null>(null);

  // 加载类别列表
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // 处理点击类别 - 打开编辑模态框
  const handlePressCategory = useCallback((category: CategoryWithCount) => {
    setEditingCategory(category);
    setFormVisible(true);
  }, []);

  // 打开新建表单
  const handleAddCategory = useCallback(() => {
    setEditingCategory(null);
    setFormVisible(true);
  }, []);

  // 关闭表单
  const handleCloseForm = useCallback(() => {
    setFormVisible(false);
    setEditingCategory(null);
  }, []);

  // 提交表单
  const handleSubmitForm = useCallback(async (data: CreateCategoryDTO | UpdateCategoryDTO) => {
    if (editingCategory) {
      return updateCategory(editingCategory.id, data as UpdateCategoryDTO);
    } else {
      return createCategory(data as CreateCategoryDTO);
    }
  }, [editingCategory, createCategory, updateCategory]);

  // 删除类别
  const handleDeleteCategory = useCallback(async () => {
    if (!editingCategory) return false;

    return new Promise<boolean>((resolve) => {
      useUIStore.getState().showConfirm({
        title: '删除类别',
        message: `确定要删除类别"${editingCategory.name}"吗？该类别下的兑换码将变为无类别状态。`,
        confirmText: '删除',
        cancelText: '取消',
        danger: true,
        onConfirm: async () => {
          useUIStore.getState().hideConfirm();
          const success = await deleteCategoryFromStore(editingCategory.id);
          if (success) {
            useUIStore.getState().showToast('类别已删除', 'success');
            resolve(true);
          } else {
            useUIStore.getState().showToast('删除失败', 'error');
            resolve(false);
          }
        },
        onCancel: () => {
          useUIStore.getState().hideConfirm();
          resolve(false);
        },
      });
    });
  }, [editingCategory, deleteCategoryFromStore]);

  const fabShadowColor = colorScheme === 'dark'
    ? 'rgba(0, 122, 255, 0.6)'
    : 'rgba(0, 122, 255, 0.4)';

  return (
    <ThemedView style={styles.container}>
      {/* 隐藏原生导航栏 */}
      <Stack.Screen options={{ headerShown: false }} />

      {/* 自定义工具栏 */}
      <Toolbar title="类别管理" />

      {/* 类别列表 */}
      {categories.length === 0 && !loading ? (
        <EmptyState
          title="暂无类别"
          description="点击右下角按钮创建第一个类别"
          icon={<IconSymbol name="folder" size={48} color={colors.icon} />}
        />
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <CategoryListItem
              category={item}
              onPress={handlePressCategory}
            />
          )}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: 100 + insets.bottom },
          ]}
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior="automatic"
        />
      )}

      {/* 悬浮添加按钮 */}
      {categories.length > 0 && (
        <TouchableOpacity
          style={[
            styles.fab,
            {
              backgroundColor: colorScheme === 'dark' ? '#0a7ea4' : colors.tint,
              bottom: insets.bottom + 20,
              boxShadow: `0 4px 16px ${fabShadowColor}`,
            },
          ]}
          onPress={handleAddCategory}
          activeOpacity={0.8}
        >
          <IconSymbol name="plus" size={28} color="#fff" />
        </TouchableOpacity>
      )}

      {/* 类别表单弹窗 */}
      <CategoryFormModal
        visible={formVisible}
        category={editingCategory}
        onClose={handleCloseForm}
        onSubmit={handleSubmitForm}
        onDelete={editingCategory ? handleDeleteCategory : undefined}
      />

      {/* 确认对话框 */}
      <ConfirmDialog
        visible={confirmDialog.visible}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        cancelText={confirmDialog.cancelText}
        danger={true}
        onConfirm={confirmDialog.onConfirm}
        onCancel={confirmDialog.onCancel ?? (() => {})}
      />

      {/* Toast提示 */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />
    </ThemedView>
  );
}

/**
 * 样式
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 12,
    paddingTop: 0,
  },
  fab: {
    position: 'absolute',
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderCurve: 'continuous',
  },
});
