import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { Button, colors, Input } from '@/components/ui';

import { api } from '@/lib/api';
import { registerPushToken, useAuth } from '@/lib/auth-context';
import { getExpoPushTokenSafely } from '@/lib/push';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onDemo = async (role: 'patient' | 'nurse') => {
    await signIn('demo', role);
    router.replace('/');
  };

  const onLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    try {
      setLoading(true);
      const res = await api.post('/auth/login', { email, password });
      const token: string = res.data.token;
      const role: 'patient' | 'nurse' = res.data.user.role;

      await signIn(token, role);

      const pushToken = await getExpoPushTokenSafely();
      if (pushToken) {
        await registerPushToken(pushToken);
      }

      router.replace('/');
    } catch (e: any) {
      Alert.alert('Erreur', e?.response?.data?.error || 'Connexion impossible');
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
        <Text style={styles.logo}>🩺</Text>
        <Text style={styles.title}>Suivi SEP</Text>
        <Text style={styles.subtitle}>Suivi quotidien de la sclérose en plaques</Text>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
          <Text style={styles.formTitle}>Connexion</Text>

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

          <Button
            title={loading ? 'Connexion...' : 'Se connecter'}
            onPress={onLogin}
            loading={loading}
            size="large"
            style={{ marginTop: 8 }}
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou essayer</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.demoButtons}>
            <Button
              title="👤 Patient"
              onPress={() => onDemo('patient')}
              variant="outline"
              size="medium"
            />
            <Button
              title="👩‍⚕️ Infirmier"
              onPress={() => onDemo('nurse')}
              variant="outline"
              size="medium"
            />
          </View>

          <Link href="/(auth)/register" asChild>
            <Text style={styles.registerLink}>
              Pas de compte ? <Text style={{ color: colors.primary, fontWeight: '600' }}>Créer un compte</Text>
            </Text>
          </Link>
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
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  logo: {
    fontSize: 56,
    marginBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 8,
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 24,
    paddingTop: 32,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 24,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: colors.textMuted,
  },
  demoButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  registerLink: {
    textAlign: 'center',
    marginTop: 32,
    fontSize: 15,
    color: colors.textSecondary,
  },
});
