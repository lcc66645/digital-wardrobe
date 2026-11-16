import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Screen from '../../components/Screen';
import Button from '../../components/Button';
import { colors, fontSize, radius, spacing, shadow } from '../../theme/tokens';

const MOCK_TAGS = ['日常休闲', '春秋', '通勤'];

export default function RecommendScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const onRefresh = () => {
    setRefreshing(true);
    setFeedback(null);
    // 纯界面加载反馈：推荐接口接入后替换为真实请求，并补充骨架屏加载态
    setTimeout(() => setRefreshing(false), 600);
  };

  const onDislike = () => {
    // 负反馈规则：点击后降低相似搭配权重（接口接入后上报 recommendation/feedback）
    setFeedback('已减少类似搭配的推荐');
  };

  return (
    <Screen title="搭配推荐">
      <View style={styles.card}>
        <View style={styles.cover} />
        <Text style={styles.cardTitle}>今日搭配方案</Text>
        <Text style={styles.cardDesc}>结合衣橱内在用单品、当前季节与出行场合生成</Text>
        <View style={styles.tags}>
          {MOCK_TAGS.map((tag) => (
            <Text key={tag} style={styles.tag}>
              {tag}
            </Text>
          ))}
        </View>
        <View style={styles.actions}>
          <Button
            label="换一批"
            onPress={onRefresh}
            loading={refreshing}
            variant="primary"
            style={styles.flexBtn}
          />
          <Button
            label="不喜欢"
            onPress={onDislike}
            variant="ghost"
            style={styles.flexBtn}
          />
        </View>
        {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}
      </View>
      <Text style={styles.note}>
        推荐候选仅来自衣橱「在用」衣物；闲置单品利用率与单次穿着成本作为排序因子，丢弃/捐赠/转卖/收纳状态的衣物不参与推荐。
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.lg,
    ...shadow.card,
  },
  cover: {
    height: 180,
    borderRadius: radius.lg,
    backgroundColor: colors.pinkLight,
    marginBottom: spacing.md,
  },
  cardTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.brown },
  cardDesc: { fontSize: fontSize.sm, color: colors.brownSub, marginTop: spacing.xs },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.md },
  tag: {
    fontSize: fontSize.xs,
    color: colors.brown,
    backgroundColor: colors.yellowLight,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    overflow: 'hidden',
  },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  flexBtn: { flex: 1 },
  feedback: { marginTop: spacing.md, fontSize: fontSize.sm, color: colors.success },
  note: {
    fontSize: fontSize.xs,
    color: colors.brownSub,
    lineHeight: 18,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xs,
  },
});
