import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Badge, Button, Card, colors, EmptyState, Header, Input } from '@/components/ui';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/lib/i18n';

type CarePlan = {
  problemKey: string | null;
  objective: string;
  interventions: string[];
};

const PROBLEM_OPTIONS = [
  { key: 'chronicFatigue', label: "Fatigue chronique" },
  { key: 'motorDisorders', label: 'Troubles moteurs' },
  { key: 'balanceWalking', label: "Troubles de l'équilibre / marche" },
  { key: 'urinaryDisorders', label: 'Troubles urinaires' },
  { key: 'cognitiveDisorders', label: 'Troubles cognitifs' },
] as const;

const INTERVENTION_OPTIONS = [
  { key: 'encourageRest', label: 'Encourager les périodes de repos' },
  { key: 'planActivities', label: 'Planifier les activités selon les capacités' },
  { key: 'fatigueEducation', label: 'Éduquer sur la gestion de la fatigue' },
  { key: 'fallPrevention', label: 'Prévention des chutes / sécurisation du domicile' },
  { key: 'urinaryManagement', label: 'Surveillance et gestion des troubles urinaires' },
  { key: 'cognitiveSupport', label: 'Stimulation cognitive et soutien psychologique' },
] as const;

export default function NursePatientDetailScreen() {
  const { patientId } = useLocalSearchParams<{ patientId: string }>();
  const router = useRouter();
  useAuth();
  const { t } = useI18n();

  const [patient, setPatient] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [savingCarePlan, setSavingCarePlan] = useState(false);
  const [carePlan, setCarePlan] = useState<CarePlan>({ problemKey: null, objective: '', interventions: [] });

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/nurse/patients/${patientId}/history`);
      setPatient(res.data.patient);
      setReports(res.data.reports || []);
      setAlerts(res.data.alerts || []);

      const loaded = res.data.patient?.carePlan;
      setCarePlan({
        problemKey: loaded?.problemKey ?? null,
        objective: loaded?.objective ?? '',
        interventions: Array.isArray(loaded?.interventions) ? loaded.interventions : [],
      });
    } catch (e: any) {
      Alert.alert(t('error'), e?.response?.data?.error || t('loadError'));
    } finally {
      setLoading(false);
    }
  };

  const toggleIntervention = (key: string) => {
    setCarePlan((prev) => {
      const exists = prev.interventions.includes(key);
      return {
        ...prev,
        interventions: exists ? prev.interventions.filter((k) => k !== key) : [...prev.interventions, key],
      };
    });
  };

  const saveCarePlan = async () => {
    try {
      setSavingCarePlan(true);
      const res = await api.patch(`/nurse/patients/${patientId}/care-plan`, {
        problemKey: carePlan.problemKey,
        objective: carePlan.objective,
        interventions: carePlan.interventions,
      });
      setPatient(res.data.patient);
      Alert.alert(t('success'), t('carePlanSaved'));
    } catch (e: any) {
      Alert.alert(t('error'), e?.response?.data?.error || t('updateError'));
    } finally {
      setSavingCarePlan(false);
    }
  };

  useEffect(() => {
    load();
  }, [patientId]);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getScoreColor = (value: number) => {
    if (value <= 3) return colors.success;
    if (value <= 6) return colors.warning;
    return colors.danger;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const pendingAlerts = alerts.filter(a => !a.resolved);

  const getReportAvg = (r: any) => {
    const m = r.motorDisorders || 0;
    const b = r.balanceWalking || 0;
    const u = r.urinaryDisorders || 0;
    const c = r.cognitiveDisorders || 0;
    return ((m + b + u + c) / 4).toFixed(1);
  };

  return (
    <View style={styles.container}>
      <Header
        title={patient?.name || t('patient')}
        subtitle={patient?.email || ''}
        onBack={() => router.back()}
        rightAction={
          <TouchableOpacity onPress={load} disabled={loading} style={styles.refreshBtn}>
            {loading ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.refreshText}>↻</Text>
            )}
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />
        }
      >
        {/* Patient Info Card */}
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.patientCard}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{patient ? getInitials(patient.name) : '?'}</Text>
          </View>
          <View style={styles.patientInfo}>
            <Text style={styles.patientName}>{patient?.name || t('patient')}</Text>
            <Text style={styles.patientEmail}>{patient?.email || ''}</Text>
          </View>
          {pendingAlerts.length > 0 && (
            <View style={styles.alertBadge}>
              <Text style={styles.alertBadgeText}>{pendingAlerts.length}</Text>
            </View>
          )}
        </LinearGradient>

        {/* Nursing Interventions Card */}
        <Card style={styles.interventionsCard}>
          <View style={styles.interventionsHeader}>
            <Text style={styles.sectionTitle}>{t('nursingInterventions')}</Text>
            <Button title={savingCarePlan ? t('submitting') : t('save')} onPress={saveCarePlan} loading={savingCarePlan} />
          </View>

          <View style={styles.interventionBlock}>
            <Text style={styles.interventionLabel}>{t('problem')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.problemRow}>
              {PROBLEM_OPTIONS.map((p) => {
                const active = carePlan.problemKey === p.key;
                return (
                  <TouchableOpacity
                    key={p.key}
                    onPress={() => setCarePlan((prev) => ({ ...prev, problemKey: p.key }))}
                    style={[styles.problemChip, active && styles.problemChipActive]}
                  >
                    <Text style={[styles.problemChipText, active && styles.problemChipTextActive]}>{p.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.interventionBlock}>
            <Text style={styles.interventionLabel}>{t('objective')}</Text>
            <Input
              value={carePlan.objective}
              onChangeText={(txt) => setCarePlan((prev) => ({ ...prev, objective: txt }))}
              placeholder={t('objective')}
              multiline
              numberOfLines={2}
            />
          </View>

          <View style={styles.interventionBlock}>
            <Text style={styles.interventionLabel}>{t('interventions')}</Text>
            {INTERVENTION_OPTIONS.map((it) => {
              const checked = carePlan.interventions.includes(it.key);
              return (
                <TouchableOpacity key={it.key} onPress={() => toggleIntervention(it.key)} style={styles.checkRow}>
                  <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                    <Text style={styles.checkboxMark}>{checked ? '✓' : ''}</Text>
                  </View>
                  <Text style={styles.checkLabel}>{it.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* Alerts Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('recentAlerts')}</Text>
          {alerts.length === 0 ? (
            <Card>
              <Text style={styles.emptyText}>{t('noAlerts')}</Text>
            </Card>
          ) : (
            alerts.slice(0, 3).map((a) => (
              <Card key={a._id} style={styles.alertItem}>
                <View style={styles.alertHeader}>
                  <Badge label={a.resolved ? t('resolved') : t('new')} variant={a.resolved ? 'success' : 'danger'} />
                  <Text style={styles.alertDate}>{formatDate(a.createdAt)}</Text>
                </View>
                <Text style={styles.alertMessage}>{a.message}</Text>
              </Card>
            ))
          )}
        </View>

        {/* Reports Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('reportHistory')}</Text>
          {reports.length === 0 ? (
            <EmptyState
              icon="📊"
              title={t('noReports')}
              description={t('noReportsDesc')}
            />
          ) : (
            reports.map((r) => (
              <Card key={r._id} style={styles.reportCard}>
                <View style={styles.reportHeader}>
                  <Text style={styles.reportDate}>{formatDate(r.createdAt)}</Text>
                  <Badge
                    label={`${t('average')}: ${getReportAvg(r)}`}
                    variant={Number(getReportAvg(r)) <= 3 ? 'success' : Number(getReportAvg(r)) <= 6 ? 'warning' : 'danger'}
                  />
                </View>

                <View style={styles.metricsRow}>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricIcon}>�</Text>
                    <Text style={[styles.metricValue, { color: getScoreColor(r.motorDisorders || 0) }]}>{r.motorDisorders || 0}</Text>
                    <Text style={styles.metricLabel}>{t('motorDisorders')}</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricIcon}>�</Text>
                    <Text style={[styles.metricValue, { color: getScoreColor(r.balanceWalking || 0) }]}>{r.balanceWalking || 0}</Text>
                    <Text style={styles.metricLabel}>{t('balanceWalking')}</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricIcon}>�</Text>
                    <Text style={[styles.metricValue, { color: getScoreColor(r.urinaryDisorders || 0) }]}>{r.urinaryDisorders || 0}</Text>
                    <Text style={styles.metricLabel}>{t('urinaryDisorders')}</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricIcon}>🧠</Text>
                    <Text style={[styles.metricValue, { color: getScoreColor(r.cognitiveDisorders || 0) }]}>{r.cognitiveDisorders || 0}</Text>
                    <Text style={styles.metricLabel}>{t('cognitiveDisorders')}</Text>
                  </View>
                </View>

                {r.comment && (
                  <View style={styles.commentBox}>
                    <Text style={styles.commentLabel}>{t('note')}</Text>
                    <Text style={styles.commentText}>{r.comment}</Text>
                  </View>
                )}
              </Card>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  refreshBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshText: {
    fontSize: 20,
    color: colors.white,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  patientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
  },
  patientInfo: {
    flex: 1,
    marginLeft: 16,
  },
  patientName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 2,
  },
  patientEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
  },
  alertBadge: {
    backgroundColor: colors.danger,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  alertItem: {
    marginBottom: 8,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertDate: {
    fontSize: 12,
    color: colors.textMuted,
  },
  alertMessage: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  reportCard: {
    marginBottom: 12,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  reportDate: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  commentBox: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  commentLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  interventionsCard: {
    marginBottom: 20,
  },
  interventionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 8,
  },
  problemRow: {
    paddingVertical: 6,
    gap: 8,
  },
  problemChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  problemChipActive: {
    borderColor: colors.danger,
    backgroundColor: colors.danger + '15',
  },
  problemChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  problemChipTextActive: {
    color: colors.danger,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    borderColor: colors.success,
    backgroundColor: colors.success + '20',
  },
  checkboxMark: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.success,
    lineHeight: 16,
  },
  checkLabel: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  interventionBlock: {
    marginBottom: 12,
  },
  interventionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  interventionText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
});
