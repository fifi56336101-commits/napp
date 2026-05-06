import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Button, Card, colors, Header, Input } from '@/components/ui';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/lib/i18n';

const QUICK_REASONS = [
  { icon: '', labelKey: 'motorWeakness' as const },
  { icon: '', labelKey: 'balanceLoss' as const },
  { icon: '', labelKey: 'urinaryUrgency' as const },
  { icon: '', labelKey: 'confusion' as const },
  { icon: '', labelKey: 'visionProblems' as const },
  { icon: '', labelKey: 'fever' as const },
];

export default function PatientAlertScreen() {
  useAuth();
  const { t } = useI18n();

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);

  const submit = async () => {
    if (!message.trim()) {
      Alert.alert(t('error'), t('describeChangeError'));
      return;
    }
    try {
      setLoading(true);
      const res = await api.post('/alerts', { message });
      Alert.alert(t('success'), res.data.push?.ok ? t('alertSent') : t('alertSaved'));
      setMessage('');
      setSelectedReason(null);
    } catch (e: any) {
      Alert.alert(t('error'), e?.response?.data?.error || t('sendError'));
    } finally {
      setLoading(false);
    }
  };

  const selectReason = useCallback((reasonKey: string) => {
    const reason = t(reasonKey as any);
    setSelectedReason(reason);
    const parts = message.split('\n').filter(p => !QUICK_REASONS.some(q => p.includes(t(q.labelKey as any))));
    setMessage([reason, ...parts].join('\n').trim());
  }, [message, t]);

  return (
    <View style={styles.container}>
      <Header
        title={t('alert')}
        subtitle={t('whenToAlert')}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Warning Card */}
        <LinearGradient
          colors={[colors.warning, '#D97706']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.warningCard}
        >
          <Text style={styles.warningIcon}>⚠️</Text>
          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>{t('whenToAlert')}</Text>
            <Text style={styles.warningText}>
              {t('whenToAlertDesc')}
            </Text>
          </View>
        </LinearGradient>

        {/* Quick Reasons */}
        <Card>
          <Text style={styles.cardTitle}>{t('mainReason')}</Text>
          <Text style={styles.cardSubtitle}>{t('selectOption')}</Text>

          <View style={styles.reasonsGrid}>
            {QUICK_REASONS.map((reason) => (
              <TouchableOpacity
                key={reason.labelKey}
                onPress={() => selectReason(reason.labelKey)}
                style={[
                  styles.reasonChip,
                  selectedReason === t(reason.labelKey as any) && styles.reasonChipActive,
                ]}
              >
                <Text style={styles.reasonIcon}>{reason.icon}</Text>
                <Text style={[
                  styles.reasonLabel,
                  selectedReason === t(reason.labelKey as any) && styles.reasonLabelActive,
                ]}>
                  {t(reason.labelKey as any)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Description */}
        <Card>
          <Text style={styles.cardTitle}>{t('description')}</Text>
          <Input
            value={message}
            onChangeText={setMessage}
            placeholder={t('describeChange')}
            multiline
            numberOfLines={5}
          />
        </Card>

        {/* Submit */}
        <Button
          title={loading ? t('sending') : t('sendAlert')}
          onPress={submit}
          loading={loading}
          variant="danger"
          size="large"
          disabled={!message.trim()}
          style={styles.submitBtn}
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
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  warningIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 4,
  },
  warningText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 18,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  reasonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  reasonChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  reasonChipActive: {
    backgroundColor: colors.danger + '15',
    borderColor: colors.danger,
  },
  reasonIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  reasonLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  reasonLabelActive: {
    color: colors.danger,
    fontWeight: '600',
  },
  submitBtn: {
    marginTop: 8,
  },
});
