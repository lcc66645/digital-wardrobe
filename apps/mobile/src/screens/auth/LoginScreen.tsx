import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { colors, fontSize, radius, spacing, shadow } from '../../theme/tokens';
import Button from '../../components/Button';

const PHONE_RE = /^1\d{10}$/;

export default function LoginScreen() {
  const login = useAuthStore((state) => state.login);
  const loading = useAuthStore((state) => state.loading);
  const storeError = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  const [phone, setPhone] = useState('13900000001');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const validate = (): boolean => {
    if (!phone.trim()) {
      setFormError('请输入手机号');
      return false;
    }
    if (!PHONE_RE.test(phone.trim())) {
      setFormError('请输入正确的 11 位手机号');
      return false;
    }
    if (!password) {
      setFormError('请输入密码');
      return false;
    }
    if (password.length < 6) {
      setFormError('密码长度至少 6 位');
      return false;
    }
    setFormError(null);
    return true;
  };

  const onSubmit = async () => {
    if (!validate()) {
      return;
    }
    await login(phone, password);
  };

  const errorText = formError ?? storeError;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.kb}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.brand}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>衣</Text>
            </View>
            <Text style={styles.appName}>数字衣橱</Text>
            <Text style={styles.slogan}>手机一碰，穿搭有数</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.field}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>手机号</Text>
                <Text style={styles.required}>*</Text>
              </View>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={(text) => {
                    setPhone(text);
                    setFormError(null);
                    clearError();
                  }}
                  placeholder="请输入手机号"
                  placeholderTextColor={colors.brownSub}
                  keyboardType="phone-pad"
                  maxLength={11}
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.field}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>密码</Text>
                <Text style={styles.required}>*</Text>
              </View>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setFormError(null);
                    clearError();
                  }}
                  placeholder="请输入密码（至少 6 位）"
                  placeholderTextColor={colors.brownSub}
                  secureTextEntry={!showPassword}
                  maxLength={32}
                  autoCapitalize="none"
                />
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setShowPassword((v) => !v)}
                  hitSlop={8}
                >
                  <Text style={styles.eye}>{showPassword ? '隐藏' : '显示'}</Text>
                </Pressable>
              </View>
            </View>

            {errorText ? <Text style={styles.error}>{errorText}</Text> : null}

            <Button
              label="登录"
              onPress={onSubmit}
              loading={loading}
              style={styles.submit}
            />

            <Text style={styles.agreement}>
              登录即代表同意《用户协议》与《隐私政策》，我们将依法保护你的个人信息
            </Text>
          </View>

          <Text style={styles.devHint}>联调账号 13900000001 / 123456（开发期辅助，正式版移除）</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  kb: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    justifyContent: 'center',
  },
  brand: { alignItems: 'center', marginBottom: spacing.xl },
  logo: {
    width: 76,
    height: 76,
    borderRadius: radius.xl,
    backgroundColor: colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  logoText: { fontSize: 34, fontWeight: '700', color: colors.brown },
  appName: { fontSize: fontSize.xxl, fontWeight: '700', color: colors.brown },
  slogan: { fontSize: fontSize.sm, color: colors.brownSub, marginTop: spacing.xxs },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.lg,
    ...shadow.card,
  },
  field: { marginBottom: spacing.md },
  labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs },
  label: { fontSize: fontSize.md, fontWeight: '600', color: colors.brown },
  required: { color: colors.danger, marginLeft: 2 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 48,
  },
  input: { flex: 1, fontSize: fontSize.md, color: colors.brown, paddingVertical: 0 },
  eye: { fontSize: fontSize.sm, color: colors.info, paddingLeft: spacing.sm },
  error: { color: colors.danger, fontSize: fontSize.sm, marginBottom: spacing.sm },
  submit: { marginTop: spacing.xs },
  agreement: {
    marginTop: spacing.md,
    fontSize: fontSize.xs,
    color: colors.brownSub,
    lineHeight: 18,
    textAlign: 'center',
  },
  devHint: {
    marginTop: spacing.lg,
    fontSize: fontSize.xs,
    color: colors.brownSub,
    textAlign: 'center',
  },
});
