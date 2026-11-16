import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, ScrollView } from 'react-native';
import Screen from '../../components/Screen';
import Button from '../../components/Button';
import { useAuthStore } from '../../store/authStore';
import { colors, fontSize, radius, spacing, shadow } from '../../theme/tokens';

const MENU_ITEMS = [
  '我的收藏',
  '我的关注',
  '消息通知',
  '帮助与反馈',
  '设置（账号与安全 / 隐私 / 关于）',
];

function maskPhone(phone?: string): string {
  if (!phone || phone.length !== 11) {
    return phone ? phone : '未绑定手机号';
  }
  return `${phone.slice(0, 3)}****${phone.slice(7)}`;
}

export default function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [tip, setTip] = useState<string | null>(null);

  const onLogout = () => {
    Alert.alert('退出登录', '退出后需重新登录，确定退出吗？', [
      { text: '取消', style: 'cancel' },
      { text: '退出', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <Screen title="我的">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.userCard}>
          <View style={styles.avatar} />
          <View style={styles.userInfo}>
            <Text style={styles.nickname}>{user?.nickname ?? '未登录'}</Text>
            <Text style={styles.phone}>{maskPhone(user?.phone)}</Text>
            <Text style={styles.meta}>
              {user?.city ? user.city : '城市未设置'} ·{' '}
              {user?.stylePreference ? user.stylePreference : '穿搭风格未设置'}
            </Text>
          </View>
        </View>

        <View style={styles.menuCard}>
          {MENU_ITEMS.map((item, index) => (
            <Pressable
              key={item}
              accessibilityRole="button"
              style={[styles.menuRow, index !== MENU_ITEMS.length - 1 && styles.menuBorder]}
              onPress={() => setTip('该模块将在后续版本开放')}
            >
              <Text style={styles.menuText}>{item}</Text>
              <Text style={styles.menuArrow}>›</Text>
            </Pressable>
          ))}
        </View>

        {tip ? <Text style={styles.tip}>{tip}</Text> : null}

        <Button label="退出登录" onPress={onLogout} variant="danger" style={styles.logout} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadow.card,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: radius.pill,
    backgroundColor: colors.pinkLight,
    marginRight: spacing.md,
  },
  userInfo: { flex: 1 },
  nickname: { fontSize: fontSize.lg, fontWeight: '700', color: colors.brown },
  phone: { fontSize: fontSize.sm, color: colors.brownSub, marginTop: spacing.xxs },
  meta: { fontSize: fontSize.xs, color: colors.brownSub, marginTop: spacing.xxs },
  menuCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md,
    ...shadow.card,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  menuBorder: { borderBottomWidth: 1, borderBottomColor: colors.line },
  menuText: { fontSize: fontSize.md, color: colors.brown },
  menuArrow: { fontSize: fontSize.xl, color: colors.brownSub },
  tip: {
    marginTop: spacing.md,
    fontSize: fontSize.sm,
    color: colors.info,
    textAlign: 'center',
  },
  logout: { marginTop: spacing.xl },
});
