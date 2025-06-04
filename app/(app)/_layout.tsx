// app/_layout.tsx
import { Stack } from 'expo-router';

export default function RootLayout() {
  // If all checks pass, show the app
  return (
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>  
  );
}