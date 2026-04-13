import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Badge, Card, colors, EmptyState, Header } from '@/components/ui';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { demoGetReports, DemoReport } from '@/lib/demo-storage';

export default function PatientHistoryScreen() {
  const { isDemo } = useAuth();

  const [reports, setReports] = useState<DemoReport[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      if (isDemo) {
        const local = await demoGetReports();
        setReports(local);
      } else {
        const res = await api.get('/reports/me');
        setReports(res.data.reports || []);
      }
    } catch (e: any) {
      Alert.alert('Erreur', e?.response?.data?.error || 'Impossible de charger');
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
      return `Aujourd'hui à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return `Hier à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    }
    return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  const getScoreColor = (value: number) => {
    if (value <= 3) return colors.success;
    if (value <= 6) return colors.warning;
    return colors.danger;
  };

  const getAverageScore = (r: DemoReport) => {
    return ((r.fatigue + r.pain + r.walkingDifficulty + r.vision) / 4).toFixed(1);
  };

  return (
    <View style={styles.container}>
      <Header
        title="Historique"
        subtitle={`${reports.length} rapport${reports.length !== 1 ? 's' : ''}`}
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
        {reports.length === 0 ? (
          <EmptyState
            icon="📋"
            title="Aucun rapport"
            description="Vos rapports quotidiens apparaîtront ici. Commencez par enregistrer votre état du jour."
          />
        ) : (
          reports.map((r, index) => (
            <Card key={r._id} style={styles.reportCard}>
              <View style={styles.reportHeader}>
                <View style={styles.dateContainer}>
                  <Text style={styles.dateText}>{formatDate(r.createdAt)}</Text>
                  <Badge
                    label={`Moyenne: ${getAverageScore(r)}`}
                    variant={Number(getAverageScore(r)) <= 3 ? 'success' : Number(getAverageScore(r)) <= 6 ? 'warning' : 'danger'}
                    size="medium"
                  />
                </View>
              </View>

              <View style={styles.metricsGrid}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricIcon}>😴</Text>
                  <Text style={styles.metricLabel}>Fatigue</Text>
                  <View style={[styles.metricBar, { backgroundColor: getScoreColor(r.fatigue) + '30' }]}>
                    <View style={[styles.metricFill, { width: `${r.fatigue * 10}%`, backgroundColor: getScoreColor(r.fatigue) }]} />
                  </View>
                  <Text style={[styles.metricValue, { color: getScoreColor(r.fatigue) }]}>{r.fatigue}</Text>
                </View>

                <View style={styles.metricItem}>
                  <Text style={styles.metricIcon}>😣</Text>
                  <Text style={styles.metricLabel}>Douleur</Text>
                  <View style={[styles.metricBar, { backgroundColor: getScoreColor(r.pain) + '30' }]}>
                    <View style={[styles.metricFill, { width: `${r.pain * 10}%`, backgroundColor: getScoreColor(r.pain) }]} />
                  </View>
                  <Text style={[styles.metricValue, { color: getScoreColor(r.pain) }]}>{r.pain}</Text>
                </View>

                <View style={styles.metricItem}>
                  <Text style={styles.metricIcon}>🚶</Text>
                  <Text style={styles.metricLabel}>Marche</Text>
                  <View style={[styles.metricBar, { backgroundColor: getScoreColor(r.walkingDifficulty) + '30' }]}>
                    <View style={[styles.metricFill, { width: `${r.walkingDifficulty * 10}%`, backgroundColor: getScoreColor(r.walkingDifficulty) }]} />
                  </View>
                  <Text style={[styles.metricValue, { color: getScoreColor(r.walkingDifficulty) }]}>{r.walkingDifficulty}</Text>
                </View>

                <View style={styles.metricItem}>
                  <Text style={styles.metricIcon}>👁️</Text>
                  <Text style={styles.metricLabel}>Vision</Text>
                  <View style={[styles.metricBar, { backgroundColor: getScoreColor(r.vision) + '30' }]}>
                    <View style={[styles.metricFill, { width: `${r.vision * 10}%`, backgroundColor: getScoreColor(r.vision) }]} />
                  </View>
                  <Text style={[styles.metricValue, { color: getScoreColor(r.vision) }]}>{r.vision}</Text>
                </View>
              </View>

              {r.comment && (
                <View style={styles.commentContainer}>
                  <Text style={styles.commentLabel}>📝 Note</Text>
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
