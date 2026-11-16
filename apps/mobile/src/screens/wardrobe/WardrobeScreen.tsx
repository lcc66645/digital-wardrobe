import { useState } from 'react';
import { ScrollView, Text, Pressable, StyleSheet } from 'react-native';
import Screen from '../../components/Screen';
import EmptyState from '../../components/EmptyState';
import { colors, fontSize, radius, spacing } from '../../theme/tokens';

const CATEGORIES = ['全部', '上衣', '裤装', '外套', '裙装', '鞋履', '配饰'];

export default function WardrobeScreen() {
  const [active, setActive] = useState('全部');
  const [hint, setHint] = useState<string | null>(null);

  return (
    <Screen title="我的衣橱">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {CATEGORIES.map((category) => {
          const selected = active === category;
          return (
            <Pressable
              key={category}
              accessibilityRole="button"
              onPress={() => setActive(category)}
              style={[styles.chip, selected && styles.chipActive]}
            >
              <Text style={[styles.chipText, selected && styles.chipTextActive]}>
                {category}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {hint ? <Text style={styles.hint}>{hint}</Text> : null}

      <EmptyState
        title="衣橱还是空的"
        description="先把常穿的衣物拍下来，AI 会自动识别品类、颜色与季节，帮你组合每日穿搭。"
        actionText="拍照录入（即将接入）"
        onAction={() => setHint('拍照识别与衣物编辑页将在接口对接轮次开放')}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
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
  hint: {
    fontSize: fontSize.sm,
    color: colors.info,
    backgroundColor: colors.pinkLight,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.xs,
  },
});
