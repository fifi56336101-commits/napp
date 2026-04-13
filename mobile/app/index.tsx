import { Redirect } from 'expo-router';

import { useAuth } from '@/lib/auth-context';

export default function Index() {
  const { loading, token, role } = useAuth();

  if (loading) return null;

  if (!token) return <Redirect href="/(auth)/login" />;

  if (role === 'nurse') return <Redirect href="/(nurse)/(tabs)/patients" />;

  return <Redirect href="/(patient)/(tabs)/today" />;
}
