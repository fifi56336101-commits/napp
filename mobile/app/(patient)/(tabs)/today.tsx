import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Button, Card, colors, Header, Input, Slider } from '@/components/ui';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { demoAddReport } from '@/lib/demo-storage';

export default function PatientTodayScreen() {
  const { signOut, isDemo } = useAuth();

  const [fatigue, setFatigue] = useState(5);
  const [pain, setPain] = useState(0);
  const [walkingDifficulty, setWalkingDifficulty] = useState(0);
  const [vision, setVision] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    try {
      setLoading(true);
      if (isDemo) {
        await demoAddReport({
          fatigue,
          pain,
          walkingDifficulty,
          vision,
          comment,
        });
        Alert.alert('✅ Succès', 'Votre état a été enregistré (mode démo)');
      } else {
        await api.post('/reports', {
          fatigue,
          pain,
          walkingDifficulty,
          vision,
          comment,
        });
        Alert.alert('✅ Succès', 'Votre état a été enregistré');
      }
      setComment('');
    } catch (e: any) {
      Alert.alert('Erreur', e?.response?.data?.error || 'Impossible d\'enregistrer');
    } finally {
      setLoading(false);
    }
  };

  const getOverallStatus = () => {
    const avg = (fatigue + pain + walkingDifficulty + vision) / 4;
    if (avg <= 3) return { label: 'Bon', color: colors.success, icon: '😊' };
    if (avg <= 6) return { label: 'Moyen', color: colors.warning, icon: '😐' };
    return { label: 'À surveiller', color: colors.danger, icon: '😟' };
  };

  const status = getOverallStatus();

  return (
    <View style={styles.container}>
      <Header
        title="Aujourd'hui"
        subtitle="Comment vous sentez-vous ?"
        rightAction={
          <TouchableOpacity onPress={signOut} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Déconnexion</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <Card style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusIcon}>{status.icon}</Text>
            <View>
              <Text style={styles.statusLabel}>État général</Text>
              <Text style={[styles.statusValue, { color: status.color }]}>{status.label}</Text>
            </View>
          </View>
          <View style={styles.statusBars}>
            <View style={[styles.statusBar, { backgroundColor: status.color, width: `${(fatigue + pain + walkingDifficulty + vision) / 40 * 100}%` }]} />
          </View>
        </Card>

        {/* Health Metrics Card */}
        <Card>
          <Text style={styles.cardTitle}>Indicateurs de santé</Text>
          <Text style={styles.cardSubtitle}>Évaluez chaque symptôme de 0 à 10</Text>

          <Slider
            label="Fatigue"
            value={fatigue}
            onValueChange={setFatigue}
            icon="😴"
          />

          <Slider
            label="Douleur"
            value={pain}
            onValueChange={setPain}
            icon="😣"
          />

          <Slider
            label="Difficulté de marche"
            value={walkingDifficulty}
            onValueChange={setWalkingDifficulty}
            icon="🚶"
          />

          <Slider
            label="Vision"
            value={vision}
            onValueChange={setVision}
            icon="👁️"
          />
        </Card>

        {/* Comment Card */}
        <Card>
          <Text style={styles.cardTitle}>Notes supplémentaires</Text>
          <Input
            value={comment}
            onChangeText={setComment}
            placeholder="Décrivez comment vous vous sentez aujourd'hui..."
            multiline
            numberOfLines={4}
          />
        </Card>

        {/* Submit Button */}
        <Button
          title={loading ? 'Enregistrement...' : 'Enregistrer mon état'}
          onPress={submit}
          loading={loading}
          size="large"
          style={styles.submitBtn}
        />

        {isDemo && (
          <View style={styles.demoBanner}>
            <Text style={styles.demoText}>🎮 Mode démo actif</Text>
          </View>
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
  demoBanner: {
    backgroundColor: colors.primary + '15',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  demoText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
