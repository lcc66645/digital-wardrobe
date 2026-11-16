import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSize, radius, spacing } from '../theme/tokens';
import Button from './Button';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

/** 列表空状态统一组件（五状态之一：空数据；其余加载/异常/无结果后续轮次补齐） */
export default function EmptyState({
  title,
  description,
  actionText,
  onAction,
}: EmptyStateProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.badge} />
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.desc}>{description}</Text> : null}
      {actionText && onAction ? (
        <Button
          label={actionText}
          onPress={onAction}
          variant="ghost"
          style={styles.action}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
    paddingHorizontal: spacing.xl,
  },
  badge: {
    width: 88,
    height: 88,
    borderRadius: radius.xl,
    backgroundColor: colors.yellowLight,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.brown,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  desc: {
    fontSize: fontSize.sm,
    color: colors.brownSub,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  action: {
    marginTop: spacing.sm,
    minWidth: 160,
  },
});
