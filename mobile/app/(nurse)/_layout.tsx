import { Stack } from 'expo-router';

export default function NurseLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="patient/[patientId]" />
    </Stack>
  );
}
