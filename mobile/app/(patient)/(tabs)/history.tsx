import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Badge, Card, colors, EmptyState, Header } from '@/components/ui';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/lib/i18n';

type Report = {
  _id: string;
  motorDisorders: number;
  balanceWalking: number;
  urinaryDisorders: number;
  cognitiveDisorders: number;
  fatigue?: number;
  pain?: number;
  walkingDifficulty?: number;
  vision?: number;
  comment?: string;
  createdAt: string;
};

export default function PatientHistoryScreen() {
  useAuth();
  const { t } = useI18n();

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reports/me');
      setReports(res.data.reports || []);
    } catch (e: any) {
      Alert.alert(t('error'), e?.response?.data?.error || t('loadError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `${t('today')} ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return `${t('yesterday')} ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    }
    return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  const getScoreColor = (value: number) => {
    if (value <= 3) return colors.success;
    if (value <= 6) return colors.warning;
    return colors.danger;
  };

  const getAverageScore = (r: Report) => {
    const m = Number.isFinite(r.motorDisorders) ? r.motorDisorders : 0;
    const b = Number.isFinite(r.balanceWalking) ? r.balanceWalking : 0;
    const u = Number.isFinite(r.urinaryDisorders) ? r.urinaryDisorders : 0;
    const c = Number.isFinite(r.cognitiveDisorders) ? r.cognitiveDisorders : 0;
    return ((m + b + u + c) / 4).toFixed(1);
  };

  return (
    <View style={styles.container}>
      <Header
        title={t('history')}
        subtitle={`${reports.length} ${reports.length !== 1 ? t('reports') : t('report')}`}
        rightAction={
          <TouchableOpacity onPress={load} disabled={loading} style={styles.refreshBtn}>
            {loading ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.refreshText}></Text>
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
        {reports.length === 0 ? (
          <EmptyState
            icon="📋"
            title={t('noReports')}
            description={t('noReportsDesc')}
          />
        ) : (
          reports.map((r, index) => (
            <Card key={r._id} style={styles.reportCard}>
              <View style={styles.reportHeader}>
                <View style={styles.dateContainer}>
                  <Text style={styles.dateText}>{formatDate(r.createdAt)}</Text>
                  <Badge
                    label={`${t('average')}: ${getAverageScore(r)}`}
                    variant={Number(getAverageScore(r)) <= 3 ? 'success' : Number(getAverageScore(r)) <= 6 ? 'warning' : 'danger'}
                    size="medium"
                  />
                </View>
              </View>

              <View style={styles.metricsGrid}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricIcon}>�</Text>
                  <Text style={styles.metricLabel}>{t('motorDisorders')}</Text>
                  <View style={[styles.metricBar, { backgroundColor: getScoreColor(r.motorDisorders) + '30' }]}>
                    <View style={[styles.metricFill, { width: `${r.motorDisorders * 10}%`, backgroundColor: getScoreColor(r.motorDisorders) }]} />
                  </View>
                  <Text style={[styles.metricValue, { color: getScoreColor(r.motorDisorders) }]}>{r.motorDisorders}</Text>
                </View>

                <View style={styles.metricItem}>
                  <Text style={styles.metricIcon}>�</Text>
                  <Text style={styles.metricLabel}>{t('balanceWalking')}</Text>
                  <View style={[styles.metricBar, { backgroundColor: getScoreColor(r.balanceWalking) + '30' }]}>
                    <View style={[styles.metricFill, { width: `${r.balanceWalking * 10}%`, backgroundColor: getScoreColor(r.balanceWalking) }]} />
                  </View>
                  <Text style={[styles.metricValue, { color: getScoreColor(r.balanceWalking) }]}>{r.balanceWalking}</Text>
                </View>

                <View style={styles.metricItem}>
                  <Text style={styles.metricIcon}>�</Text>
                  <Text style={styles.metricLabel}>{t('urinaryDisorders')}</Text>
                  <View style={[styles.metricBar, { backgroundColor: getScoreColor(r.urinaryDisorders) + '30' }]}>
                    <View style={[styles.metricFill, { width: `${r.urinaryDisorders * 10}%`, backgroundColor: getScoreColor(r.urinaryDisorders) }]} />
                  </View>
                  <Text style={[styles.metricValue, { color: getScoreColor(r.urinaryDisorders) }]}>{r.urinaryDisorders}</Text>
                </View>

                <View style={styles.metricItem}>
                  <Text style={styles.metricIcon}>🧠</Text>
                  <Text style={styles.metricLabel}>{t('cognitiveDisorders')}</Text>
                  <View style={[styles.metricBar, { backgroundColor: getScoreColor(r.cognitiveDisorders) + '30' }]}>
                    <View style={[styles.metricFill, { width: `${r.cognitiveDisorders * 10}%`, backgroundColor: getScoreColor(r.cognitiveDisorders) }]} />
                  </View>
                  <Text style={[styles.metricValue, { color: getScoreColor(r.cognitiveDisorders) }]}>{r.cognitiveDisorders}</Text>
                </View>
              </View>

              {r.comment && (
                <View style={styles.commentContainer}>
                  <Text style={styles.commentLabel}>📝 {t('note')}</Text>
                  <Text style={styles.commentText}>{r.comment}</Text>
                </View>
              )}

              {/* Timeline connector */}
              {index < reports.length - 1 && (
                <View style={styles.timelineConnector} />
              )}
            </Card>
          ))
        )}
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
  reportCard: {
    marginBottom: 8,
  },
  reportHeader: {
    marginBottom: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricItem: {
    width: '48%',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  metricIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  metricBar: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    marginBottom: 6,
  },
  metricFill: {
    height: '100%',
    borderRadius: 3,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  commentContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  commentLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  commentText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  timelineConnector: {
    position: 'absolute',
    left: 20,
    bottom: -12,
    width: 2,
    height: 16,
    backgroundColor: colors.border,
  },
});
