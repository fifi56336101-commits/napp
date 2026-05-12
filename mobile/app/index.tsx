import { Redirect } from 'expo-router';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

import { colors } from '@/components/ui';
import { useAuth } from '@/lib/auth-context';

export default function Index() {
  const { loading, token, role } = useAuth();

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!token) return <Redirect href="/(auth)/login" />;

  if (role === 'nurse') return <Redirect href="/(nurse)/(tabs)/patients" />;

  return <Redirect href="/(patient)/(tabs)/today" />;
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
