import OnboardingScreen from '@/components/onboarding/ondoarding-screen';
import { useRevenueCat } from '@/providers/revenue-cat';
import { Redirect } from 'expo-router';
import React from 'react';
import { SafeAreaView } from 'react-native';

export default function Index() {
  const { isPro } = useRevenueCat();

  if (isPro) {
    return <Redirect href="/home" />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <OnboardingScreen />
    </SafeAreaView>
  );
}
