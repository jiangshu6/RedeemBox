import { useState, useCallback, useEffect, useMemo } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useCodes } from '@/hooks/useCodes';
import { useCategoryStore } from '@/store/category.store';
import { useUIStore } from '@/store/ui.store';
import { CodeListItem, CodeSearchBar } from '@/components/code';
import { EmptyState, ConfirmDialog, Toast, Loading } from '@/components/common';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { RedemptionCode } from '@/types';

/**
 * 兑换码列表首页
 * 使用自定义工具栏显示标题
 */
export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const params = useLocalSearchParams<{ categoryId?: string }>();
  const insets = useSafeAreaInsets();

  const {
    filteredCodes,
    loading,
    hasFilter,
    loadCodes,
    search,
    setFilter,
    clearFilter,
    filter,
  } = useCodes();

  const { categories, fetchCategories } = useCategoryStore();
  const { confirmDialog, toast, hideToast, isLoading, loadingText } = useUIStore();

  const [refreshing, setRefreshing] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // 当前选中的类别ID（null表示全部）
  const selectedCategoryId = filter.categoryIds.length > 0 ? filter.categoryIds[0] : null;

  // 类别ID到名称的映射
  const categoryNameMap = useMemo(() => {
    const map: Record<number, string> = {};
    categories.forEach((cat) => {
      map[cat.id] = cat.name;
    });
    return map;
  }, [categories]);

  // 初始化加载 - 只在首次挂载时执行
  useEffect(() => {
    if (!initialized) {
      const init = async () => {
        await Promise.all([loadCodes(), fetchCategories()]);
        setInitialized(true);
      };
      init();
    }
  }, [initialized, loadCodes, fetchCategories]);

  // 处理URL参数中的类别筛选
  useEffect(() => {
    if (params.categoryId) {
      const categoryId = parseInt(params.categoryId, 10);
      if (!Number.isNaN(categoryId)) {
        setFilter({ categoryIds: [categoryId] });
      }
    }
  }, [params.categoryId, setFilter]);

  // 下拉刷新
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCodes();
    setRefreshing(false);
  }, [loadCodes]);

  // 点击兑换码
  const handlePressCode = useCallback((code: RedemptionCode) => {
    router.push(`/code/${code.id}`);
  }, []);

  // 长按兑换码
  const handleLongPressCode = useCallback((code: RedemptionCode) => {
    router.push(`/code/${code.id}`);
  }, []);

  // 新建兑换码
  const handleAddCode = useCallback(() => {
    router.push('/code/new');
  }, []);

  // 清除筛选
  const handleClearFilter = useCallback(() => {
    clearFilter();
  }, [clearFilter]);

  // 选择类别筛选
  const handleSelectCategory = useCallback((categoryId: number | null) => {
    if (categoryId === null) {
      // 选择"全部"
      setFilter({ categoryIds: [] });
    } else {
      setFilter({ categoryIds: [categoryId] });
    }
  }, [setFilter]);

  // 悬浮按钮阴影颜色
  const fabShadowColor = colorScheme === 'dark' 
    ? 'rgba(0, 122, 255, 0.6)' 
    : 'rgba(0, 122, 255, 0.4)';

  // 是否显示空状态（已初始化且没有数据且不在加载中）
  const showEmpty = initialized && filteredCodes.length === 0 && !loading;

  return (
    <ThemedView style={styles.container}>
      {/* 隐藏原生导航栏 */}
      <Stack.Screen options={{ headerShown: false }} />

      {/* 自定义工具栏 */}
      <View style={[styles.toolbar, { paddingTop: insets.top }]}>
        <ThemedText type="title" style={styles.toolbarTitle}>兑换码</ThemedText>
      </View>

      {/* 搜索栏 */}
      <View style={styles.searchBar}>
        <CodeSearchBar onSearch={search} />
      </View>

      {/* 类别筛选标签 */}
      {categories.length > 0 && (
        <View style={styles.categoryFilterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryFilterContent}
          >
            {/* 全部选项 */}
            <TouchableOpacity
              style={[
                styles.categoryTag,
                selectedCategoryId === null && styles.categoryTagActive,
                {
                  backgroundColor: selectedCategoryId === null
                    ? '#0a7ea4'
                    : colorScheme === 'dark'
                      ? 'rgba(255,255,255,0.08)'
                      : 'rgba(0,0,0,0.05)',
                },
              ]}
              onPress={() => handleSelectCategory(null)}
            >
              <ThemedText
                style={[
                  styles.categoryTagText,
                  selectedCategoryId === null && styles.categoryTagTextActive,
                ]}
              >
                全部
              </ThemedText>
            </TouchableOpacity>

            {/* 各个类别 */}
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryTag,
                  selectedCategoryId === category.id && styles.categoryTagActive,
                  {
                    backgroundColor: selectedCategoryId === category.id
                      ? category.color
                      : colorScheme === 'dark'
                        ? 'rgba(255,255,255,0.08)'
                        : 'rgba(0,0,0,0.05)',
                  },
                ]}
                onPress={() => handleSelectCategory(category.id)}
              >
                <ThemedText
                  style={[
                    styles.categoryTagText,
                    selectedCategoryId === category.id && styles.categoryTagTextActive,
                  ]}
                >
                  {category.name}
                </ThemedText>
                {category.count !== undefined && category.count > 0 && (
                  <ThemedText
                    style={[
                      styles.categoryCount,
                      selectedCategoryId === category.id && styles.categoryCountActive,
                    ]}
                  >
                    {category.count}
                  </ThemedText>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* 加载中状态 */}
      {!initialized && loading && <Loading visible={true} text="加载中..." />}

      {/* 兑换码列表 */}
      {showEmpty ? (
        <EmptyState
          title="暂无兑换码"
          description={hasFilter ? '没有符合条件的兑换码' : '点击右下角按钮添加第一个兑换码'}
          actionText={hasFilter ? '清除筛选' : '添加兑换码'}
          onAction={hasFilter ? handleClearFilter : handleAddCode}
          icon={<IconSymbol name="ticket" size={48} color={colors.icon} />}
        />
      ) : initialized && (
        <FlatList
          data={filteredCodes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <CodeListItem
              code={item}
              categoryName={item.categoryId ? categoryNameMap[item.categoryId] : undefined}
              onPress={handlePressCode}
              onLongPress={handleLongPressCode}
            />
          )}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: 100 + insets.bottom },
          ]}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          contentInsetAdjustmentBehavior="automatic"
        />
      )}

      {/* 悬浮添加按钮 - 只在有兑换码时显示 */}
      {filteredCodes.length > 0 && (
        <TouchableOpacity
          style={[
            styles.fab,
            {
              backgroundColor: colorScheme === 'dark' ? '#0a7ea4' : colors.tint,
              bottom: insets.bottom + 20,
              boxShadow: `0 4px 16px ${fabShadowColor}`,
            },
          ]}
          onPress={handleAddCode}
          activeOpacity={0.8}
        >
          <IconSymbol name="plus" size={28} color="#fff" />
        </TouchableOpacity>
      )}

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
  toolbar: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  toolbarTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  searchBar: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  categoryFilterContainer: {
    paddingBottom: 8,
  },
  categoryFilterContent: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: 'row',
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  categoryTagActive: {
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  categoryTagText: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoryTagTextActive: {
    color: '#fff',
  },
  categoryCount: {
    fontSize: 12,
    opacity: 0.7,
  },
  categoryCountActive: {
    color: '#fff',
    opacity: 0.9,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderCurve: 'continuous',
  },
});
