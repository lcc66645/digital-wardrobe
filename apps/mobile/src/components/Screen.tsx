import type { ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fontSize, spacing } from '../theme/tokens';

interface ScreenProps {
  title?: string;
  headerRight?: ReactNode;
  children: ReactNode;
}

/** 主 Tab 页面通用容器：奶油白背景、顶部安全区、统一标题栏与水平内边距 */
export default function Screen({ title, headerRight, children }: ScreenProps) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {title ? (
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {headerRight}
        </View>
      ) : null}
      <View style={styles.body}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.brown,
  },
  body: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
});
