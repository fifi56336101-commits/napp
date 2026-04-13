import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Badge, Button, Card, colors, EmptyState, Header } from '@/components/ui';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { demoGetAlerts, demoResolveAlert, DemoAlert } from '@/lib/demo-storage';

export default function NurseAlertsScreen() {
  const { isDemo } = useAuth();

  const [alerts, setAlerts] = useState<DemoAlert[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      if (isDemo) {
        const local = await demoGetAlerts();
        setAlerts(local);
      } else {
        const res = await api.get('/nurse/alerts');
        setAlerts(res.data.alerts || []);
      }
    } catch (e: any) {
      Alert.alert('Erreur', e?.response?.data?.error || 'Impossible de charger');
    } finally {
      setLoading(false);
    }
  };

  const resolve = async (alertId: string) => {
    try {
      if (isDemo) {
        await demoResolveAlert(alertId);
        await load();
      } else {
        await api.post(`/nurse/alerts/${alertId}/resolve`);
        await load();
      }
    } catch (e: any) {
      Alert.alert('Erreur', e?.response?.data?.error || 'Impossible');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const pendingAlerts = alerts.filter(a => !a.resolved);
  const resolvedAlerts = alerts.filter(a => a.resolved);

  return (
    <View style={styles.container}>
      <Header
        title="Alertes"
        subtitle={pendingAlerts.length > 0 ? `${pendingAlerts.length} nouvelle${pendingAlerts.length !== 1 ? 's' : ''}` : 'Aucune nouvelle alerte'}
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
        {alerts.length === 0 ? (
          <EmptyState
            icon="🔔"
            title="Aucune alerte"
            description="Les alertes de vos patients apparaîtront ici. Vous serez notifié en cas de changement important."
          />
        ) : (
          <>
            {/* Pending Alerts */}
            {pendingAlerts.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>À traiter</Text>
                {pendingAlerts.map((a) => (
                  <Card key={a._id} style={styles.alertCard}>
                    <LinearGradient
                      colors={[colors.danger, '#DC2626']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.alertIndicator}
                    />
                    <View style={styles.alertContent}>
                      <View style={styles.alertHeader}>
                        <Badge label="Nouveau" variant="danger" />
                        <Text style={styles.alertTime}>{formatTime(a.createdAt)}</Text>
                      </View>
                      <Text style={styles.alertMessage}>{a.message}</Text>
                      <View style={styles.alertFooter}>
                        <Text style={styles.patientId}>Patient: {a.patientId}</Text>
                        <Button
                          title="Résoudre"
                          onPress={() => resolve(a._id)}
                          variant="primary"
                          size="small"
                        />
                      </View>
                    </View>
                  </Card>
                ))}
              </View>
            )}

            {/* Resolved Alerts */}
            {resolvedAlerts.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Résolues</Text>
                {resolvedAlerts.map((a) => (
                  <Card key={a._id} style={[styles.alertCard, styles.resolvedCard] as any}>
                    <View style={[styles.alertIndicator, { backgroundColor: colors.success }]} />
                    <View style={styles.alertContent}>
                      <View style={styles.alertHeader}>
                        <Badge label="Résolu" variant="success" />
                        <Text style={styles.alertTime}>{formatTime(a.createdAt)}</Text>
                      </View>
                      <Text style={[styles.alertMessage, styles.resolvedMessage]}>{a.message}</Text>
                      <Text style={styles.patientId}>Patient: {a.patientId}</Text>
                    </View>
                  </Card>
                ))}
              </View>
            )}
          </>
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  alertCard: {
    flexDirection: 'row',
    overflow: 'hidden',
    padding: 0,
    marginBottom: 12,
  },
  resolvedCard: {
    opacity: 0.7,
  },
  alertIndicator: {
    width: 4,
  },
  alertContent: {
    flex: 1,
    padding: 16,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  alertTime: {
    fontSize: 13,
    color: colors.textMuted,
  },
  alertMessage: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
    lineHeight: 22,
    marginBottom: 12,
  },
  resolvedMessage: {
    color: colors.textSecondary,
  },
  alertFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  patientId: {
    fontSize: 12,
    color: colors.textMuted,
  },
});
