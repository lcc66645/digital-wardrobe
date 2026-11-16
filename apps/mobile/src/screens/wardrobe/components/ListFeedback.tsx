import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import Button from '../../../components/Button';
import { colors, fontSize, radius, spacing } from '../../../theme/tokens';

/** 首次加载骨架屏（五状态之「加载中」），纯静态占位，不引入动画依赖 */
export function SkeletonList() {
  return (
    <View style={styles.wrap}>
      {[0, 1, 2, 3].map((i) => (
        <View key={i} style={styles.card}>
          <View style={styles.thumb} />
          <View style={styles.lines}>
            <View style={[styles.line, styles.lineLong]} />
            <View style={[styles.line, styles.lineShort]} />
          </View>
        </View>
      ))}
    </View>
  );
}

/** 加载失败 / 网络异常状态（五状态之「加载失败」），提供重试入口 */
export function LoadError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.errorText}>{message}</Text>
      <Button label="重新加载" onPress={onRetry} variant="ghost" style={styles.retryBtn} />
    </View>
  );
}

/** 列表底部：分页加载更多指示 / 没有更多兜底 */
export function ListFooter({
  loadingMore,
  hasMore,
  hasData,
}: {
  loadingMore: boolean;
  hasMore: boolean;
  hasData: boolean;
}) {
  if (loadingMore) {
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={colors.brown} />
        <Text style={styles.footerText}>加载中…</Text>
      </View>
    );
  }
  if (hasData && !hasMore) {
    return (
      <View style={styles.footer}>
        <Text style={styles.footerText}>已经到底啦</Text>
      </View>
    );
  }
  return null;
}

const styles = StyleSheet.create({
  wrap: { paddingVertical: spacing.md },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  thumb: { width: 64, height: 64, borderRadius: radius.md, backgroundColor: colors.line },
  lines: { flex: 1, marginLeft: spacing.md, justifyContent: 'center', gap: spacing.sm },
  line: { height: 12, borderRadius: radius.sm, backgroundColor: colors.line },
  lineLong: { width: '55%' },
  lineShort: { width: '80%' },
  errorText: { fontSize: fontSize.sm, color: colors.brownSub, textAlign: 'center', lineHeight: 20, marginBottom: spacing.md },
  retryBtn: { alignSelf: 'center', minWidth: 140 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.md, gap: spacing.xs },
  footerText: { fontSize: fontSize.xs, color: colors.brownSub },
});
