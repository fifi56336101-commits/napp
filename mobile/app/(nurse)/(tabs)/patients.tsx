import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Badge, Card, colors, EmptyState, Header } from '@/components/ui';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/lib/i18n';

type Patient = {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  reportCount?: number;
  lastReportAt?: string | null;
};

export default function NursePatientsScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { t } = useI18n();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientStats, setPatientStats] = useState<Record<string, { count: number; lastDate: string | null }>>({});
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get('/nurse/patients');
      const loadedPatients: Patient[] = res.data.patients || [];
      setPatients(loadedPatients);

      const stats: Record<string, { count: number; lastDate: string | null }> = {};
      for (const p of loadedPatients) {
        stats[p._id] = {
          count: p.reportCount || 0,
          lastDate: p.lastReportAt || null,
        };
      }
      setPatientStats(stats);
    } catch (e: any) {
      Alert.alert(t('error'), e?.response?.data?.error || t('loadError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatLastReport = (dateStr: string | null) => {
    if (!dateStr) return t('noReport');
    const date = new Date(dateStr);
    const today = new Date();
    const diffDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return t('today');
    if (diffDays === 1) return t('yesterday');
    if (diffDays < 7) return `${diffDays} ${t('daysAgo')}`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  return (
    <View style={styles.container}>
      <Header
        title={t('myPatients')}
        subtitle={`${patients.length} ${patients.length !== 1 ? t('patientsAssignedPlural') : t('patientsAssigned')}`}
        rightAction={
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>{t('logout')}</Text>
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
        {patients.length === 0 ? (
          <EmptyState
            icon="👥"
            title={t('noPatients')}
            description={t('noPatientsDesc')}
          />
        ) : (
          patients.map((p) => {
            const stats = patientStats[p._id];
            return (
              <Card
                key={p._id}
                onPress={() => router.push(`/(nurse)/patient/${p._id}`)}
                style={styles.patientCard}
              >
                <View style={styles.patientHeader}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{getInitials(p.name)}</Text>
                  </View>
                  <View style={styles.patientInfo}>
                    <Text style={styles.patientName}>{p.name}</Text>
                    <Text style={styles.patientEmail}>{p.email}</Text>
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </View>

                <View style={styles.patientStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{stats?.count || 0}</Text>
                    <Text style={styles.statLabel}>{t('reports')}</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{formatLastReport(stats?.lastDate || null)}</Text>
                    <Text style={styles.statLabel}>{t('lastReport')}</Text>
                  </View>
                </View>

                {false && (
                  <View style={styles.demoBadge}>
                    <Badge label="Mode démo" variant="info" />
                  </View>
                )}
              </Card>
            );
          })
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
  patientCard: {
    marginBottom: 12,
  },
  patientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
  patientInfo: {
    flex: 1,
    marginLeft: 14,
  },
  patientName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  patientEmail: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  chevron: {
    fontSize: 24,
    color: colors.textMuted,
  },
  patientStats: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  demoBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
});
