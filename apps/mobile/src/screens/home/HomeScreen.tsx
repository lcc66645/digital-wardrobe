import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import Screen from '../../components/Screen';
import { useAuthStore } from '../../store/authStore';
import { colors, fontSize, radius, spacing, shadow } from '../../theme/tokens';
import type { MainTabParamList } from '../../navigation/types';

type HomeNavigation = BottomTabNavigationProp<MainTabParamList, 'HomeTab'>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeNavigation>();
  const user = useAuthStore((state) => state.user);
  const nickname = user?.nickname ?? '穿搭好友';

  return (
    <Screen title="首页">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.greeting}>
          <Text style={styles.hello}>你好，{nickname}</Text>
          <Text style={styles.sub}>今天也要穿得开心呀</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          style={styles.hero}
          onPress={() => navigation.navigate('RecommendTab')}
        >
          <Text style={styles.heroTitle}>今日穿搭推荐</Text>
          <Text style={styles.heroDesc}>结合天气、日程与你的衣橱生成</Text>
          <Text style={styles.heroCta}>去看看 ›</Text>
        </Pressable>

        <View style={styles.statRow}>
          <Pressable
            accessibilityRole="button"
            style={styles.statItem}
            onPress={() => navigation.navigate('WardrobeTab')}
          >
            <Text style={styles.statNum}>—</Text>
            <Text style={styles.statLabel}>我的衣物</Text>
          </Pressable>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>—</Text>
            <Text style={styles.statLabel}>我的穿搭</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>—</Text>
            <Text style={styles.statLabel}>连续打卡</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>快捷入口</Text>
        <Pressable
          accessibilityRole="button"
          style={styles.entry}
          onPress={() => navigation.navigate('WardrobeTab')}
        >
          <Text style={styles.entryText}>拍照录入衣物</Text>
          <Text style={styles.entryArrow}>›</Text>
        </Pressable>
        <View style={styles.entry}>
          <Text style={styles.entryText}>穿搭社区（接口后续轮次接入）</Text>
          <Text style={styles.entryArrow}>›</Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  greeting: { marginVertical: spacing.md },
  hello: { fontSize: fontSize.xl, fontWeight: '700', color: colors.brown },
  sub: { fontSize: fontSize.sm, color: colors.brownSub, marginTop: spacing.xxs },
  hero: {
    backgroundColor: colors.yellowLight,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  heroTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.brown },
  heroDesc: { fontSize: fontSize.sm, color: colors.brownSub, marginTop: spacing.xs },
  heroCta: { fontSize: fontSize.sm, fontWeight: '600', color: colors.brown, marginTop: spacing.sm },
  statRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  statItem: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    ...shadow.card,
  },
  statNum: { fontSize: fontSize.xl, fontWeight: '700', color: colors.brown },
  statLabel: { fontSize: fontSize.xs, color: colors.brownSub, marginTop: spacing.xxs },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.brown,
    marginBottom: spacing.sm,
  },
  entry: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  entryText: { fontSize: fontSize.md, color: colors.brown },
  entryArrow: { fontSize: fontSize.xl, color: colors.brownSub },
});
