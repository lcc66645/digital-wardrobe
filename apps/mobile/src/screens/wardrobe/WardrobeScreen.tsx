import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import type { ClothingCategory } from '@dw/shared';
import Screen from '../../components/Screen';
import EmptyState from '../../components/EmptyState';
import ClothingCard from './components/ClothingCard';
import { SkeletonList, LoadError, ListFooter } from './components/ListFeedback';
import { CATEGORY_FILTERS, getMyClothing } from '../../api/clothing';
import type { ClothingDto, ClothingQuery } from '../../api/clothing';
import { colors, fontSize, radius, spacing } from '../../theme/tokens';

const PAGE_SIZE = 10;

/** 列表阶段：首次/切品类加载中、加载失败、就绪（含空列表） */
type Phase = 'loading' | 'error' | 'ready';

export default function WardrobeScreen() {
  const [phase, setPhase] = useState<Phase>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [list, setList] = useState<ClothingDto[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [active, setActive] = useState<ClothingCategory | undefined>(undefined);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  /** 拉取第一页（首次进入 / 切换品类 / 失败重试） */
  const fetchFirst = useCallback(async (category?: ClothingCategory) => {
    setPhase('loading');
    setErrorMsg('');
    try {
      const query: ClothingQuery = { page: 1, pageSize: PAGE_SIZE };
      if (category) query.category = category;
      const res = await getMyClothing(query);
      setList(res.list);
      setTotal(res.total);
      setPage(res.page);
      setTotalPages(res.totalPages);
      setPhase('ready');
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : '衣物加载失败，请稍后重试');
      setPhase('error');
    }
  }, []);

  useEffect(() => {
    fetchFirst(undefined);
  }, [fetchFirst]);

  const onSelectCategory = (value?: ClothingCategory) => {
    if (value === active) return;
    setActive(value);
    setHint(null);
    // 清空旧列表以展示骨架屏，避免品类切换时仍显示上一品类数据
    setList([]);
    fetchFirst(value);
  };

  /** 下拉刷新：保留当前列表，成功后整体替换第一页 */
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const query: ClothingQuery = { page: 1, pageSize: PAGE_SIZE };
      if (active) query.category = active;
      const res = await getMyClothing(query);
      setList(res.list);
      setTotal(res.total);
      setPage(res.page);
      setTotalPages(res.totalPages);
    } catch {
      setHint('刷新失败，请稍后下拉重试');
    } finally {
      setRefreshing(false);
    }
  };

  /** 上拉触底加载下一页，追加去重由后端分页保证 */
  const onEndReached = async () => {
    if (loadingMore || refreshing || phase !== 'ready' || page >= totalPages) return;
    setLoadingMore(true);
    try {
      const next = page + 1;
      const query: ClothingQuery = { page: next, pageSize: PAGE_SIZE };
      if (active) query.category = active;
      const res = await getMyClothing(query);
      setList((prev) => [...prev, ...res.list]);
      setPage(res.page);
      setTotalPages(res.totalPages);
      setTotal(res.total);
    } catch {
      setHint('加载更多失败，请稍后上拉重试');
    } finally {
      setLoadingMore(false);
    }
  };

  const hasMore = page < totalPages;

  const header = (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {CATEGORY_FILTERS.map((filter) => {
          const selected = filter.value === active;
          return (
            <Pressable
              key={filter.label}
              accessibilityRole="button"
              onPress={() => onSelectCategory(filter.value)}
              style={[styles.chip, selected && styles.chipActive]}
            >
              <Text style={[styles.chipText, selected && styles.chipTextActive]}>
                {filter.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      {phase === 'ready' ? <Text style={styles.countText}>共 {total} 件衣物</Text> : null}
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );

  return (
    <Screen title="我的衣橱">
      <FlatList
        style={styles.list}
        data={list}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ClothingCard item={item} />}
        ListHeaderComponent={header}
        ListEmptyComponent={
          phase === 'loading' ? (
            <SkeletonList />
          ) : phase === 'error' ? (
            <LoadError message={errorMsg} onRetry={() => fetchFirst(active)} />
          ) : (
            <EmptyState
              title={active ? '该品类下还没有衣物' : '衣橱还是空的'}
              description="先把常穿的衣物拍下来，AI 会自动识别品类、颜色与季节，帮你组合每日穿搭。"
              actionText="拍照录入（即将接入）"
              onAction={() => setHint('拍照识别与衣物编辑页将在后续版本开放')}
            />
          )
        }
        ListFooterComponent={
          phase === 'ready' && list.length > 0 ? (
            <ListFooter loadingMore={loadingMore} hasMore={hasMore} hasData={list.length > 0} />
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.brown}
            colors={[colors.yellow]}
          />
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={0.3}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { flex: 1 },
  listContent: { flexGrow: 1, paddingBottom: spacing.xl },
  chipRow: { paddingVertical: spacing.sm, gap: spacing.xs, paddingRight: spacing.md },
  chip: {
    paddingHorizontal: spacing.md,
    height: 34,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: { backgroundColor: colors.yellow, borderColor: colors.yellow },
  chipText: { fontSize: fontSize.sm, color: colors.brownSub },
  chipTextActive: { color: colors.brown, fontWeight: '600' },
  countText: { fontSize: fontSize.xs, color: colors.brownSub, marginBottom: spacing.xs, marginLeft: spacing.xxs },
  hint: {
    fontSize: fontSize.sm,
    color: colors.info,
    backgroundColor: colors.pinkLight,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.xs,
  },
});
