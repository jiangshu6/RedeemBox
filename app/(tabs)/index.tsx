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
import { RedemptionCode, RedemptionCodeStatus } from '@/types';
import { StatusColorMap } from '@/constants/status';

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
    loadCodes,
    search,
    setFilter,
    filter,
  } = useCodes();

  const { categories, fetchCategories } = useCategoryStore();
  const { confirmDialog, toast, hideToast } = useUIStore();

  const [refreshing, setRefreshing] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);

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

  // 切换搜索展开状态
  const toggleSearch = useCallback(() => {
    setSearchExpanded((prev) => !prev);
  }, []);

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
    if (selectedCategoryId !== null) {
      router.push(`/code/new?categoryId=${selectedCategoryId}`);
    } else {
      router.push('/code/new');
    }
  }, [selectedCategoryId]);

  // 选择类别筛选
  const handleSelectCategory = useCallback((categoryId: number | null) => {
    if (categoryId === null) {
      // 选择"全部"
      setFilter({ categoryIds: [] });
    } else {
      setFilter({ categoryIds: [categoryId] });
    }
  }, [setFilter]);

  // 选择状态筛选
  const handleSelectStatus = useCallback((status: RedemptionCodeStatus | null) => {
    setFilter({ status });
  }, [setFilter]);

  // 状态筛选选项
  const statusOptions: { value: RedemptionCodeStatus | null; label: string; color: string }[] = useMemo(() => [
    { value: RedemptionCodeStatus.ACTIVE, label: '有效', color: StatusColorMap[RedemptionCodeStatus.ACTIVE] },
    { value: RedemptionCodeStatus.USED, label: '已使用', color: StatusColorMap[RedemptionCodeStatus.USED] },
    { value: RedemptionCodeStatus.EXPIRED, label: '已过期', color: StatusColorMap[RedemptionCodeStatus.EXPIRED] },
  ], []);

  // 悬浮按钮阴影颜色
  const fabShadowColor = colorScheme === 'dark' 
    ? 'rgba(0, 122, 255, 0.6)' 
    : 'rgba(0, 122, 255, 0.4)';

  // 背景色 - 区分内容区域
  const filterBgColor = colorScheme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)';

  // 是否显示空状态（已初始化且没有数据且不在加载中）
  const showEmpty = initialized && filteredCodes.length === 0 && !loading;

  return (
    <ThemedView style={styles.container}>
      {/* 隐藏原生导航栏 */}
      <Stack.Screen options={{ headerShown: false }} />

      {/* 自定义工具栏 */}
      <View style={[styles.toolbar, { paddingTop: insets.top + 4 }]}>
        <View style={styles.toolbarRow}>
          <ThemedText type="title" style={styles.toolbarTitle}>兑换码</ThemedText>
          <TouchableOpacity
            style={styles.toolbarButton}
            onPress={toggleSearch}
            activeOpacity={0.7}
          >
            <IconSymbol
              name={searchExpanded ? 'chevron-down' : 'magnifying-glass'}
              size={22}
              color={colors.icon}
            />
          </TouchableOpacity>
        </View>
        <View style={[styles.divider, { backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]} />
      </View>

      {/* 搜索栏 - 展开时显示 */}
      <CodeSearchBar
        onSearch={search}
        onClose={() => setSearchExpanded(false)}
        expanded={searchExpanded}
      />

      {/* 筛选区域 - 组合在一起 */}
      <View style={[styles.filterSection, { backgroundColor: filterBgColor }]}>
        {/* 类别筛选 */}
        {categories.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {/* 全部选项 */}
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedCategoryId === null && styles.filterChipActive,
                {
                  backgroundColor: selectedCategoryId === null
                    ? '#0a7ea4'
                    : colorScheme === 'dark'
                      ? 'rgba(255,255,255,0.08)'
                      : 'rgba(0,0,0,0.05)',
                },
              ]}
              onPress={() => handleSelectCategory(null)}
              activeOpacity={0.7}
            >
              <IconSymbol name="tag" size={14} color={selectedCategoryId === null ? '#fff' : colors.icon} />
              <ThemedText
                style={[
                  styles.filterChipText,
                  selectedCategoryId === null && styles.filterChipTextActive,
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
                  styles.filterChip,
                  selectedCategoryId === category.id && styles.filterChipActive,
                  {
                    backgroundColor: selectedCategoryId === category.id
                      ? category.color
                      : colorScheme === 'dark'
                        ? 'rgba(255,255,255,0.08)'
                        : 'rgba(0,0,0,0.05)',
                  },
                ]}
                onPress={() => handleSelectCategory(category.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.categoryDot, { backgroundColor: selectedCategoryId === category.id ? '#fff' : category.color }]} />
                <ThemedText
                  style={[
                    styles.filterChipText,
                    selectedCategoryId === category.id && styles.filterChipTextActive,
                  ]}
                >
                  {category.name}
                </ThemedText>
                {category.codeCount !== undefined && category.codeCount > 0 && (
                  <ThemedText
                    style={[
                      styles.filterChipCount,
                      selectedCategoryId === category.id && styles.filterChipCountActive,
                    ]}
                  >
                    {category.codeCount}
                  </ThemedText>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* 分隔线 */}
        {categories.length > 0 && (
          <View style={[styles.filterDivider, { backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]} />
        )}

        {/* 状态筛选 */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {/* 全部状态 */}
          <TouchableOpacity
            style={[
              styles.statusChip,
              filter.status === null && styles.statusChipActive,
              {
                backgroundColor: filter.status === null
                  ? '#0a7ea4'
                  : colorScheme === 'dark'
                    ? 'rgba(255,255,255,0.05)'
                    : 'rgba(0,0,0,0.03)',
              },
            ]}
            onPress={() => handleSelectStatus(null)}
            activeOpacity={0.7}
          >
            <ThemedText
              style={[
                styles.statusChipText,
                filter.status === null && styles.statusChipTextActive,
              ]}
            >
              全部状态
            </ThemedText>
          </TouchableOpacity>

          {/* 各状态选项 */}
          {statusOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.statusChip,
                filter.status === option.value && styles.statusChipActive,
                {
                  backgroundColor: filter.status === option.value
                    ? option.color
                    : colorScheme === 'dark'
                      ? 'rgba(255,255,255,0.05)'
                      : 'rgba(0,0,0,0.03)',
                },
              ]}
              onPress={() => handleSelectStatus(option.value)}
              activeOpacity={0.7}
            >
              <View style={[styles.statusDot, { backgroundColor: option.color }]} />
              <ThemedText
                style={[
                  styles.statusChipText,
                  filter.status === option.value && styles.statusChipTextActive,
                ]}
              >
                {option.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 加载中状态 */}
      {!initialized && loading && <Loading visible={true} text="加载中..." />}

      {/* 兑换码列表 */}
      {showEmpty ? (
        <EmptyState
          title="暂无兑换码"
          description="点击右下角按钮添加第一个兑换码"
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

      {/* 悬浮添加按钮 */}
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
    paddingBottom: 8,
  },
  toolbarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toolbarTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  toolbarButton: {
    padding: 8,
    minHeight: 44,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginTop: 8,
  },
  filterSection: {
    marginBottom: 8,
  },
  filterRow: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterDivider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 16,
    marginVertical: 4,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    minWidth: 44,
    minHeight: 36,
  },
  filterChipActive: {
    shadowOpacity: 0.15,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  filterChipCount: {
    fontSize: 11,
    opacity: 0.7,
  },
  filterChipCountActive: {
    color: '#fff',
    opacity: 0.9,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
    minWidth: 44,
    minHeight: 32,
  },
  statusChipActive: {
    shadowOpacity: 0.15,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: '400',
  },
  statusChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
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
