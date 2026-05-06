import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Button, colors, Input } from '@/components/ui';

import { api } from '@/lib/api';
import { registerPushToken, useAuth } from '@/lib/auth-context';
import { Language, useI18n } from '@/lib/i18n';
import { getExpoPushTokenSafely } from '@/lib/push';

const LANGUAGES = [
  { code: 'fr' as Language, label: 'Français', flag: 'fr' },
  { code: 'en' as Language, label: 'English', flag: 'gb' },
  { code: 'ar' as Language, label: 'Arabic', flag: 'sa' },
];

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const { t, language, setLanguage } = useI18n();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    if (!email || !password) {
      Alert.alert(t('error'), t('fillAllFields'));
      return;
    }
    try {
      setLoading(true);
      const res = await api.post('/auth/login', { email, password });
      const token: string = res.data.token;
      const role: 'patient' | 'nurse' = res.data.user.role;

      await signIn(token, role);

      const pushToken = await getExpoPushTokenSafely();
      if (pushToken) {
        await registerPushToken(pushToken);
      }

      router.replace('/');
    } catch (e: any) {
      Alert.alert(t('error'), e?.response?.data?.error || t('loginError'));
    } finally {
      setLoading(false);
    }
  };

  const getFlag = (code: string) => {
    const flags: Record<string, string> = { fr: 'fr', en: 'gb', ar: 'sa' };
    return flags[code] || 'fr';
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Language Selector */}
        <View style={styles.langSelector}>
          {LANGUAGES.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.langChip,
                language === lang.code && styles.langChipActive,
              ]}
              onPress={() => setLanguage(lang.code)}
            >
              <Text style={styles.langFlag}>{getFlag(lang.code)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.logo}>🩺</Text>
        <Text style={styles.title}>{t('appName')}</Text>
        <Text style={styles.subtitle}>{t('appTagline')}</Text>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
          <Text style={styles.formTitle}>{t('loginTitle')}</Text>

          <Input
            label={t('email')}
            value={email}
            onChangeText={setEmail}
            placeholder={t('emailPlaceholder')}
            keyboardType="email-address"
            autoCapitalize="none"
            icon={<Text style={{ fontSize: 18 }}>📧</Text>}
          />

          <Input
            label={t('password')}
            value={password}
            onChangeText={setPassword}
            placeholder={t('passwordPlaceholder')}
            secureTextEntry
            icon={<Text style={{ fontSize: 18 }}>🔒</Text>}
          />

          <Button
            title={loading ? t('loggingIn') : t('loginButton')}
            onPress={onLogin}
            loading={loading}
            size="large"
            style={{ marginTop: 8 }}
          />

          <Link href="/(auth)/register" asChild>
            <Text style={styles.registerLink}>
              {t('noAccount')} <Text style={{ color: colors.primary, fontWeight: '600' }}>{t('createAccount')}</Text>
            </Text>
          </Link>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  langSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  langChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  langChipActive: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  langFlag: {
    fontSize: 16,
  },
  logo: {
    fontSize: 56,
    marginBottom: 12,
    textAlign: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 8,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 24,
    paddingTop: 32,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 24,
  },
  registerLink: {
    textAlign: 'center',
    marginTop: 32,
    fontSize: 15,
    color: colors.textSecondary,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: colors.textMuted,
  },
});
