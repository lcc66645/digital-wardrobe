import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import { colors, fontSize, radius, spacing } from '../theme/tokens';

interface ButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'ghost' | 'danger';
  style?: ViewStyle;
}

export default function Button({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  style,
}: ButtonProps) {
  const palette =
    variant === 'primary'
      ? { bg: colors.yellow, fg: colors.brown, border: colors.yellow }
      : variant === 'danger'
        ? { bg: colors.card, fg: colors.danger, border: colors.danger }
        : { bg: colors.card, fg: colors.brown, border: colors.line };

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
          opacity: disabled ? 0.5 : pressed ? 0.82 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.fg} size="small" />
      ) : (
        <Text style={[styles.label, { color: palette.fg }]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 48,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  label: {
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
});
