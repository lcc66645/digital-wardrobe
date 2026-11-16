import { View, Text, StyleSheet } from 'react-native';
import type { ClothingDto } from '../../../api/clothing';
import {
  CLOTHING_STATUS_META,
  CATEGORY_LABEL,
  OCCASION_LABEL,
  SEASON_LABEL,
} from '../../../api/clothing';
import { colors, fontSize, radius, spacing, shadow } from '../../../theme/tokens';

/** 单次穿着成本 = 购入价 / 累计穿着次数；无购入价或尚未穿着时不展示，避免无意义数值 */
function resolveCostPerWear(item: ClothingDto): string | null {
  if (
    typeof item.purchasePrice === 'number' &&
    item.purchasePrice > 0 &&
    item.wearCount > 0
  ) {
    return `单次成本 ¥${(item.purchasePrice / item.wearCount).toFixed(1)}`;
  }
  return null;
}

/** 衣橱列表衣物卡片：图片位 + 名称/状态 + 品类颜色场合 + 季节 + 穿着与成本指标 */
export default function ClothingCard({ item }: { item: ClothingDto }) {
  const statusMeta = CLOTHING_STATUS_META[item.status];
  const cost = resolveCostPerWear(item);
  const subtitle = [
    CATEGORY_LABEL[item.category] ?? '其他',
    item.color,
    item.occasion ? OCCASION_LABEL[item.occasion] : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <View style={styles.card}>
      <View style={styles.thumb}>
        <Text style={styles.thumbText}>{item.name.trim().slice(0, 1) || '衣'}</Text>
      </View>
      <View style={styles.main}>
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={[styles.statusTag, { backgroundColor: statusMeta.bg }]}>
            <Text style={[styles.statusText, { color: statusMeta.fg }]}>
              {statusMeta.label}
            </Text>
          </View>
        </View>

        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle || '未填写品类 / 颜色'}
        </Text>

        {item.seasons.length > 0 ? (
          <View style={styles.tagRow}>
            {item.seasons.map((season) => (
              <View key={season} style={styles.seasonTag}>
                <Text style={styles.seasonText}>{SEASON_LABEL[season] ?? season}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.footerRow}>
          <Text style={styles.metric}>穿着 {item.wearCount} 次</Text>
          {typeof item.purchasePrice === 'number' && item.purchasePrice > 0 ? (
            <Text style={styles.metric}>购入价 ¥{item.purchasePrice}</Text>
          ) : null}
          {cost ? <Text style={styles.cost}>{cost}</Text> : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadow.card,
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    backgroundColor: colors.yellowLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbText: { fontSize: fontSize.xl, color: colors.brown, fontWeight: '600' },
  main: { flex: 1, marginLeft: spacing.md },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  name: { flex: 1, fontSize: fontSize.md, fontWeight: '600', color: colors.brown, marginRight: spacing.sm },
  statusTag: { paddingHorizontal: spacing.xs, paddingVertical: 2, borderRadius: radius.pill },
  statusText: { fontSize: fontSize.xs },
  subtitle: { fontSize: fontSize.xs, color: colors.brownSub, marginTop: spacing.xxs },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.xs },
  seasonTag: { backgroundColor: colors.pinkLight, borderRadius: radius.sm, paddingHorizontal: spacing.xs, paddingVertical: 1 },
  seasonText: { fontSize: fontSize.xs, color: colors.brownSub },
  footerRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.md, marginTop: spacing.xs },
  metric: { fontSize: fontSize.xs, color: colors.brownSub },
  cost: { fontSize: fontSize.xs, color: colors.brown, fontWeight: '600' },
});
