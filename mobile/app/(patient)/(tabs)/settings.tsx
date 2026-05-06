import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Button, Card, colors, Header, Input } from '@/components/ui';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/lib/i18n';

type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  nurseEmail?: string;
};

const LANGUAGES = [
  { code: 'fr', label: 'Français', flag: 'fr' },
  { code: 'en', label: 'English', flag: 'gb' },
  { code: 'ar', label: 'Arabic', flag: 'sa' },
] as const;

export default function PatientSettingsScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { t, language, setLanguage } = useI18n();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [nurseEmail, setNurseEmail] = useState('');

  const handleLogout = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/me');
      setUser(res.data.user);
      setName(res.data.user.name);
      setNurseEmail(res.data.user.nurseEmail || '');
    } catch (e: any) {
      Alert.alert(t('error'), e?.response?.data?.error || t('loadProfileError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const saveProfile = async () => {
    if (!name.trim()) {
      Alert.alert(t('error'), t('name') + ' ' + t('required').toLowerCase());
      return;
    }
    try {
      setSaving(true);
      await api.patch('/me', { name: name.trim(), nurseEmail: nurseEmail.trim() || undefined });
      if (user) {
        setUser({ ...user, name: name.trim(), nurseEmail: nurseEmail.trim() });
      }
      Alert.alert(t('success'), t('profileUpdated'));
    } catch (e: any) {
      Alert.alert(t('error'), e?.response?.data?.error || t('updateError'));
    } finally {
      setSaving(false);
    }
  };

  const getFlag = (code: string) => {
    const lang = LANGUAGES.find((l) => l.code === code);
    const flags: Record<string, string> = { fr: 'fr', en: 'gb', ar: 'sa' };
    return flags[code] || 'fr';
  };

  return (
    <View style={styles.container}>
      <Header title={t('settings')} subtitle={t('account')} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <Card>
          <Text style={styles.cardTitle}>{t('profile')}</Text>

          {loading ? (
            <Text style={styles.loadingText}>{t('loading')}</Text>
          ) : (
            <>
              <Input
                label={t('name')}
                value={name}
                onChangeText={setName}
                placeholder={t('name')}
              />

              <Input
                label={t('email')}
                value={user?.email || ''}
                editable={false}
                placeholder={t('email')}
              />

              <Input
                label={t('role')}
                value={user?.role || ''}
                editable={false}
                placeholder={t('role')}
              />

              <Input
                label={t('nurseEmail')}
                value={nurseEmail}
                onChangeText={setNurseEmail}
                placeholder={t('nurseEmailPlaceholder')}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Button
                title={saving ? t('loading') : t('save')}
                onPress={saveProfile}
                loading={saving}
                style={styles.saveBtn}
              />
            </>
          )}
        </Card>

        {/* Language Card */}
        <Card>
          <Text style={styles.cardTitle}>{t('language')}</Text>

          <View style={styles.languageGrid}>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageChip,
                  language === lang.code && styles.languageChipActive,
                ]}
                onPress={() => setLanguage(lang.code)}
              >
                <Text style={styles.languageFlag}>{getFlag(lang.code)}</Text>
                <Text
                  style={[
                    styles.languageLabel,
                    language === lang.code && styles.languageLabelActive,
                  ]}
                >
                  {lang.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Logout Button */}
        <Button
          title={t('logout')}
          onPress={handleLogout}
          variant="outline"
          size="large"
          style={styles.logoutBtn}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 16,
  },
  saveBtn: {
    marginTop: 12,
  },
  languageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  languageChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  languageChipActive: {
    backgroundColor: colors.primary + '15',
    borderColor: colors.primary,
  },
  languageFlag: {
    fontSize: 20,
    marginRight: 8,
  },
  languageLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  languageLabelActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  logoutBtn: {
    marginTop: 16,
  },
});
