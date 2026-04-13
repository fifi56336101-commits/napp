import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { Badge, Card, colors, EmptyState, Header } from '@/components/ui';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { demoGetAlerts, demoGetReports, DEMO_PATIENT, DemoReport, DemoAlert } from '@/lib/demo-storage';

export default function NursePatientDetailScreen() {
  const { patientId } = useLocalSearchParams<{ patientId: string }>();
  const router = useRouter();
  const { isDemo } = useAuth();

  const [patient, setPatient] = useState<any>(null);
  const [reports, setReports] = useState<DemoReport[]>([]);
  const [alerts, setAlerts] = useState<DemoAlert[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      if (isDemo) {
        setPatient(DEMO_PATIENT);
        const [r, a] = await Promise.all([demoGetReports(), demoGetAlerts()]);
        setReports(r);
        setAlerts(a);
      } else {
        const res = await api.get(`/nurse/patients/${patientId}/history`);
        setPatient(res.data.patient);
        setReports(res.data.reports || []);
        setAlerts(res.data.alerts || []);
      }
    } catch (e: any) {
      Alert.alert('Erreur', e?.response?.data?.error || 'Impossible de charger');
    } finally {
      setLoading(false);
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

  return (
    <View style={styles.container}>
      <Header
        title={patient?.name || 'Patient'}
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
            <Text style={styles.patientName}>{patient?.name || 'Patient'}</Text>
            <Text style={styles.patientEmail}>{patient?.email || ''}</Text>
          </View>
          {pendingAlerts.length > 0 && (
            <View style={styles.alertBadge}>
              <Text style={styles.alertBadgeText}>{pendingAlerts.length}</Text>
            </View>
          )}
        </LinearGradient>

        {/* Alerts Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alertes récentes</Text>
          {alerts.length === 0 ? (
            <Card>
              <Text style={styles.emptyText}>Aucune alerte</Text>
            </Card>
          ) : (
            alerts.slice(0, 3).map((a) => (
              <Card key={a._id} style={styles.alertItem}>
                <View style={styles.alertHeader}>
                  <Badge label={a.resolved ? 'Résolu' : 'Nouveau'} variant={a.resolved ? 'success' : 'danger'} />
                  <Text style={styles.alertDate}>{formatDate(a.createdAt)}</Text>
                </View>
                <Text style={styles.alertMessage}>{a.message}</Text>
              </Card>
            ))
          )}
        </View>

        {/* Reports Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Historique des rapports</Text>
          {reports.length === 0 ? (
            <EmptyState
              icon="📊"
              title="Aucun rapport"
              description="Ce patient n'a pas encore soumis de rapport quotidien."
            />
          ) : (
            reports.map((r) => (
              <Card key={r._id} style={styles.reportCard}>
                <View style={styles.reportHeader}>
                  <Text style={styles.reportDate}>{formatDate(r.createdAt)}</Text>
                  <Badge
                    label={`Moy: ${((r.fatigue + r.pain + r.walkingDifficulty + r.vision) / 4).toFixed(1)}`}
                    variant={((r.fatigue + r.pain + r.walkingDifficulty + r.vision) / 4) <= 3 ? 'success' : ((r.fatigue + r.pain + r.walkingDifficulty + r.vision) / 4) <= 6 ? 'warning' : 'danger'}
                  />
                </View>

                <View style={styles.metricsRow}>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricIcon}>😴</Text>
                    <Text style={[styles.metricValue, { color: getScoreColor(r.fatigue) }]}>{r.fatigue}</Text>
                    <Text style={styles.metricLabel}>Fatigue</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricIcon}>😣</Text>
                    <Text style={[styles.metricValue, { color: getScoreColor(r.pain) }]}>{r.pain}</Text>
                    <Text style={styles.metricLabel}>Douleur</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricIcon}>🚶</Text>
                    <Text style={[styles.metricValue, { color: getScoreColor(r.walkingDifficulty) }]}>{r.walkingDifficulty}</Text>
                    <Text style={styles.metricLabel}>Marche</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricIcon}>👁️</Text>
                    <Text style={[styles.metricValue, { color: getScoreColor(r.vision) }]}>{r.vision}</Text>
                    <Text style={styles.metricLabel}>Vision</Text>
                  </View>
                </View>

                {r.comment && (
                  <View style={styles.commentBox}>
                    <Text style={styles.commentLabel}>Note</Text>
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
});
