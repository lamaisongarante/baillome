import { Tabs } from 'expo-router/js-tabs';

import { BarreOnglets } from '@/components/barre-onglets';
import { couleurs } from '@/theme/tokens';

export default function OngletsLayout() {
  return (
    <Tabs
      tabBar={(props) => <BarreOnglets {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: couleurs.fond },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Accueil' }} />
      <Tabs.Screen name="biens" options={{ title: 'Biens' }} />
      <Tabs.Screen name="loyers" options={{ title: 'Loyers' }} />
      <Tabs.Screen name="agenda" options={{ title: 'Agenda' }} />
      <Tabs.Screen name="docs" options={{ title: 'Docs' }} />
    </Tabs>
  );
}
