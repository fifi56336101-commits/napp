import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { Button, colors, Input } from '@/components/ui';

import { api } from '@/lib/api';
import { registerPushToken, useAuth } from '@/lib/auth-context';
import { getExpoPushTokenSafely } from '@/lib/push';

type Role = 'patient' | 'nurse';

export default function RegisterScreen() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('patient');
  const [nurseEmail, setNurseEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const onRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }
    try {
      setLoading(true);
      const res = await api.post('/auth/register', {
        name,
        email,
        password,
        role,
        nurseEmail: role === 'patient' ? nurseEmail : undefined,
      });

      const token: string = res.data.token;
      const savedRole: Role = res.data.user.role;
      await signIn(token, savedRole);

      const pushToken = await getExpoPushTokenSafely();
      if (pushToken) {
        await registerPushToken(pushToken);
      }

      router.replace('/');
    } catch (e: any) {
      Alert.alert('Erreur', e?.response?.data?.error || 'Inscription impossible');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.logo}>✨</Text>
        <Text style={styles.title}>Créer un compte</Text>
        <Text style={styles.subtitle}>Rejoignez la communauté</Text>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Informations personnelles</Text>

          <Input
            label="Nom complet"
            value={name}
            onChangeText={setName}
            placeholder="Jean Dupont"
            icon={<Text style={{ fontSize: 18 }}>👤</Text>}
          />

          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="votre@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            icon={<Text style={{ fontSize: 18 }}>📧</Text>}
          />

          <Input
            label="Mot de passe"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
            icon={<Text style={{ fontSize: 18 }}>🔒</Text>}
          />

          <Text style={styles.sectionTitle}>Type de compte</Text>

          <View style={styles.roleContainer}>
            <TouchableOpacity
              onPress={() => setRole('patient')}
              style={[
                styles.roleCard,
                role === 'patient' && styles.roleCardActive,
              ]}
            >
              <Text style={styles.roleIcon}>👤</Text>
              <Text style={[styles.roleTitle, role === 'patient' && styles.roleTitleActive]}>Patient</Text>
              <Text style={styles.roleDesc}>Suivez votre santé quotidienne</Text>
              {role === 'patient' && <View style={styles.roleCheck} />}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setRole('nurse')}
              style={[
                styles.roleCard,
                role === 'nurse' && styles.roleCardActive,
              ]}
            >
              <Text style={styles.roleIcon}>👩‍⚕️</Text>
              <Text style={[styles.roleTitle, role === 'nurse' && styles.roleTitleActive]}>Infirmier</Text>
              <Text style={styles.roleDesc}>Gérez vos patients</Text>
              {role === 'nurse' && <View style={styles.roleCheck} />}
            </TouchableOpacity>
          </View>

          {role === 'patient' && (
            <View style={styles.nurseSection}>
              <Text style={styles.sectionTitle}>Votre infirmier</Text>
              <Input
                label="Email de l'infirmier (optionnel)"
                value={nurseEmail}
                onChangeText={setNurseEmail}
                placeholder="infirmier@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                icon={<Text style={{ fontSize: 18 }}>👨‍⚕️</Text>}
              />
            </View>
          )}

          <Button
            title={loading ? 'Création...' : 'Créer mon compte'}
            onPress={onRegister}
            loading={loading}
            size="large"
            style={{ marginTop: 16 }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  backBtn: {
    marginBottom: 16,
  },
  backText: {
    fontSize: 16,
    color: colors.white,
    fontWeight: '600',
  },
  logo: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 24,
    paddingTop: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    marginTop: 8,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  roleCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
  },
  roleCardActive: {
    borderColor: colors.primary,
    backgroundColor: '#F0F9FF',
  },
  roleIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  roleTitleActive: {
    color: colors.primary,
  },
  roleDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  roleCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nurseSection: {
    marginTop: 8,
  },
});
