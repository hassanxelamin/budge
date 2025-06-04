import { RevenueCatProvider, useRevenueCat } from '@/providers/revenue-cat';
import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';

const InitialLayout = () => {
  const router = useRouter();
  const { isPro } = useRevenueCat();

  useEffect(() => {
    if (isPro) {
      router.replace('/home');
    }
  }, [isPro]);

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
};

export default function Layout() {
  return (
    <RevenueCatProvider>
      <InitialLayout />
    </RevenueCatProvider>
  );
}
