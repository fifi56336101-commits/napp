import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Button, Card, colors, Header, Input, Slider } from '@/components/ui';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/lib/i18n';

export default function PatientTodayScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { t } = useI18n();

  const [motorDisorders, setMotorDisorders] = useState(0);
  const [balanceWalking, setBalanceWalking] = useState(0);
  const [urinaryDisorders, setUrinaryDisorders] = useState(0);
  const [cognitiveDisorders, setCognitiveDisorders] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  const submit = async () => {
    try {
      setLoading(true);
      await api.post('/reports', {
        motorDisorders,
        balanceWalking,
        urinaryDisorders,
        cognitiveDisorders,
        comment,
      });
      Alert.alert(t('success'), t('reportSaved'));
      setComment('');
    } catch (e: any) {
      Alert.alert(t('error'), e?.response?.data?.error || t('reportError'));
    } finally {
      setLoading(false);
    }
  };

  const getOverallStatus = () => {
    const avg = (motorDisorders + balanceWalking + urinaryDisorders + cognitiveDisorders) / 4;
    if (avg <= 3) return { label: t('good'), color: colors.success, icon: '' };
    if (avg <= 6) return { label: t('medium'), color: colors.warning, icon: '' };
    return { label: t('toWatch'), color: colors.danger, icon: '' };
  };

  const status = getOverallStatus();

  return (
    <View style={styles.container}>
      <Header
        title={t('today')}
        subtitle={t('howAreYou')}
        rightAction={
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>{t('logout')}</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <Card style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusIcon}>{status.icon}</Text>
            <View>
              <Text style={styles.statusLabel}>{t('generalStatus')}</Text>
              <Text style={[styles.statusValue, { color: status.color }]}>{status.label}</Text>
            </View>
          </View>
          <View style={styles.statusBars}>
            <View style={[styles.statusBar, { backgroundColor: status.color, width: `${(motorDisorders + balanceWalking + urinaryDisorders + cognitiveDisorders) / 40 * 100}%` }]} />
          </View>
        </Card>

        {/* Health Metrics Card */}
        <Card>
          <Text style={styles.cardTitle}>{t('healthIndicators')}</Text>
          <Text style={styles.cardSubtitle}>{t('rateSymptoms')}</Text>

          <Slider
            label={t('motorDisorders')}
            value={motorDisorders}
            onValueChange={setMotorDisorders}
            icon=""
          />

          <Slider
            label={t('balanceWalking')}
            value={balanceWalking}
            onValueChange={setBalanceWalking}
            icon=""
          />

          <Slider
            label={t('urinaryDisorders')}
            value={urinaryDisorders}
            onValueChange={setUrinaryDisorders}
            icon=""
          />

          <Slider
            label={t('cognitiveDisorders')}
            value={cognitiveDisorders}
            onValueChange={setCognitiveDisorders}
            icon=""
          />
        </Card>

        {/* Treatment Card */}
        <Card>
          <Text style={styles.cardTitle}>{t('myTreatment')}</Text>
          <Text style={styles.cardSubtitle}>{t('treatmentInfo')}</Text>

          <View style={styles.treatmentSection}>
            <Text style={styles.treatmentCategory}>{t('relapseTreatment')}</Text>
            <Text style={styles.treatmentDetail}>{t('relapseTreatmentDesc')}</Text>
          </View>

          <View style={styles.treatmentSection}>
            <Text style={styles.treatmentCategory}>{t('maintenanceTreatment')}</Text>
            <Text style={styles.treatmentDetail}>{t('maintenanceTreatmentDesc')}</Text>
          </View>

          <View style={styles.treatmentSection}>
            <Text style={styles.treatmentCategory}>{t('symptomaticTreatment')}</Text>
            <Text style={styles.treatmentDetail}>{t('symptomaticTreatmentDesc')}</Text>
          </View>
        </Card>

        {/* Comment Card */}
        <Card>
          <Text style={styles.cardTitle}>{t('additionalNotes')}</Text>
          <Input
            value={comment}
            onChangeText={setComment}
            placeholder={t('describeFeeling')}
            multiline
            numberOfLines={4}
          />
        </Card>

        {/* Submit Button */}
        <Button
          title={loading ? t('submitting') : t('submitReport')}
          onPress={submit}
          loading={loading}
          size="large"
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
  logoutBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  logoutText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusIcon: {
    fontSize: 40,
    marginRight: 16,
  },
  statusLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statusBars: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    marginTop: 12,
    overflow: 'hidden',
  },
  statusBar: {
    height: '100%',
    borderRadius: 4,
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
    marginBottom: 20,
  },
  submitBtn: {
    marginTop: 8,
  },
  treatmentSection: {
    marginBottom: 12,
  },
  treatmentCategory: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  treatmentDetail: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
