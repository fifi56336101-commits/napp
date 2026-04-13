import React, { useState, useCallback } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Button, Card, colors, Header, Input } from '@/components/ui';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { demoAddAlert, DEMO_PATIENT } from '@/lib/demo-storage';

const QUICK_REASONS = [
  { icon: '😣', label: 'Douleur intense' },
  { icon: '😴', label: 'Fatigue extrême' },
  { icon: '🚶', label: 'Difficulté à marcher' },
  { icon: '👁️', label: 'Troubles visuels' },
  { icon: '🧠', label: 'Confusion' },
  { icon: '🌡️', label: 'Fièvre' },
];

export default function PatientAlertScreen() {
  const { isDemo } = useAuth();

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);

  const submit = async () => {
    if (!message.trim()) {
      Alert.alert('Erreur', 'Veuillez décrire le changement');
      return;
    }
    try {
      setLoading(true);
      if (isDemo) {
        await demoAddAlert({ patientId: DEMO_PATIENT._id, message: message.trim() });
        Alert.alert('✅ Envoyé', 'Votre infirmier a été notifié (mode démo)');
      } else {
        const res = await api.post('/alerts', { message });
        Alert.alert('✅ Envoyé', res.data.push?.ok ? 'Notification envoyée à l\'infirmier' : 'Alerte enregistrée');
      }
      setMessage('');
      setSelectedReason(null);
    } catch (e: any) {
      Alert.alert('Erreur', e?.response?.data?.error || 'Impossible d\'envoyer');
    } finally {
      setLoading(false);
    }
  };

  const selectReason = useCallback((reason: string) => {
    setSelectedReason(reason);
    const parts = message.split('\n').filter(p => !QUICK_REASONS.some(q => p.includes(q.label)));
    setMessage([reason, ...parts].join('\n').trim());
  }, [message]);

  return (
    <View style={styles.container}>
      <Header
        title="Signaler"
        subtitle="Changement important"
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
            <Text style={styles.warningTitle}>Quand signaler ?</Text>
            <Text style={styles.warningText}>
              Utilisez cette fonction pour prévenir votre infirmier de tout changement important dans votre état de santé.
            </Text>
          </View>
        </LinearGradient>

        {/* Quick Reasons */}
        <Card>
          <Text style={styles.cardTitle}>Raison principale</Text>
          <Text style={styles.cardSubtitle}>Sélectionnez une option ou décrivez ci-dessous</Text>

          <View style={styles.reasonsGrid}>
            {QUICK_REASONS.map((reason) => (
              <TouchableOpacity
                key={reason.label}
                onPress={() => selectReason(reason.label)}
                style={[
                  styles.reasonChip,
                  selectedReason === reason.label && styles.reasonChipActive,
                ]}
              >
                <Text style={styles.reasonIcon}>{reason.icon}</Text>
                <Text style={[
                  styles.reasonLabel,
                  selectedReason === reason.label && styles.reasonLabelActive,
                ]}>
                  {reason.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Description */}
        <Card>
          <Text style={styles.cardTitle}>Description</Text>
          <Input
            value={message}
            onChangeText={setMessage}
            placeholder="Décrivez en détail ce qui a changé..."
            multiline
            numberOfLines={5}
          />
        </Card>

        {/* Submit */}
        <Button
          title={loading ? 'Envoi en cours...' : 'Envoyer l\'alerte'}
          onPress={submit}
          loading={loading}
          variant="danger"
          size="large"
          disabled={!message.trim()}
          style={styles.submitBtn}
        />

        {isDemo && (
          <View style={styles.demoBanner}>
            <Text style={styles.demoText}>🎮 Mode démo - L'alerte sera sauvegardée localement</Text>
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
    fontSize: 13,
    fontWeight: '500',
  },
});
