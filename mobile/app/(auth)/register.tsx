import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Button, colors, Input } from '@/components/ui';

import { api } from '@/lib/api';
import { registerPushToken, useAuth } from '@/lib/auth-context';
import { Language, useI18n } from '@/lib/i18n';
import { getExpoPushTokenSafely } from '@/lib/push';

type Role = 'patient' | 'nurse';

const LANGUAGES = [
  { code: 'fr' as Language, label: 'Français', flag: 'fr' },
  { code: 'en' as Language, label: 'English', flag: 'gb' },
  { code: 'ar' as Language, label: 'Arabic', flag: 'sa' },
];

export default function RegisterScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const { t, language, setLanguage } = useI18n();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('patient');
  const [nurseEmail, setNurseEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const onRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert(t('error'), t('fillRequired'));
      return;
    }
    try {
      setLoading(true);
      const res = await api.post('/auth/register', {
        name,
        email,
        password,
        role,
        nurseEmail: role === 'patient' ? nurseEmail : undefined,
      });

      const token: string = res.data.token;
      const savedRole: Role = res.data.user.role;
      await signIn(token, savedRole);

      const pushToken = await getExpoPushTokenSafely();
      if (pushToken) {
        await registerPushToken(pushToken);
      }

      router.replace('/');
    } catch (e: any) {
      Alert.alert(t('error'), e?.response?.data?.error || t('registerError'));
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

        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}> {t('back')}</Text>
        </TouchableOpacity>
        <Text style={styles.logo}>✨</Text>
        <Text style={styles.title}>{t('registerTitle')}</Text>
        <Text style={styles.subtitle}>{t('registerSubtitle')}</Text>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>{t('personalInfo')}</Text>

          <Input
            label={t('fullName')}
            value={name}
            onChangeText={setName}
            placeholder={t('namePlaceholder')}
            icon={<Text style={{ fontSize: 18 }}>👤</Text>}
          />

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

          <Text style={styles.sectionTitle}>{t('accountType')}</Text>

          <View style={styles.roleContainer}>
            <TouchableOpacity
              onPress={() => setRole('patient')}
              style={[
                styles.roleCard,
                role === 'patient' && styles.roleCardActive,
              ]}
            >
              <Text style={styles.roleIcon}>👤</Text>
              <Text style={[styles.roleTitle, role === 'patient' && styles.roleTitleActive]}>{t('patient')}</Text>
              <Text style={styles.roleDesc}>{t('followHealth')}</Text>
              {role === 'patient' && <View style={styles.roleCheck} />}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setRole('nurse')}
              style={[
                styles.roleCard,
                role === 'nurse' && styles.roleCardActive,
              ]}
            >
              <Text style={styles.roleIcon}>👩‍⚕️</Text>
              <Text style={[styles.roleTitle, role === 'nurse' && styles.roleTitleActive]}>{t('nurse')}</Text>
              <Text style={styles.roleDesc}>{t('managePatients')}</Text>
              {role === 'nurse' && <View style={styles.roleCheck} />}
            </TouchableOpacity>
          </View>

          {role === 'patient' && (
            <View style={styles.nurseSection}>
              <Text style={styles.sectionTitle}>{t('yourNurse')}</Text>
              <Input
                label={t('nurseEmail')}
                value={nurseEmail}
                onChangeText={setNurseEmail}
                placeholder={t('nurseEmailPlaceholder')}
                keyboardType="email-address"
                autoCapitalize="none"
                icon={<Text style={{ fontSize: 18 }}>👨‍⚕️</Text>}
              />
            </View>
          )}

          <Button
            title={loading ? t('registering') : t('registerButton')}
            onPress={onRegister}
            loading={loading}
            size="large"
            style={{ marginTop: 16 }}
          />
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
    paddingBottom: 32,
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
  backBtn: {
    marginBottom: 16,
  },
  backText: {
    fontSize: 16,
    color: colors.white,
    fontWeight: '600',
  },
  logo: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 24,
    paddingTop: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    marginTop: 8,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  roleCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
  },
  roleCardActive: {
    borderColor: colors.primary,
    backgroundColor: '#F0F9FF',
  },
  roleIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  roleTitleActive: {
    color: colors.primary,
  },
  roleDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  roleCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nurseSection: {
    marginTop: 8,
  },
});
