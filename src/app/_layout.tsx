import {
  BricolageGrotesque_600SemiBold,
  BricolageGrotesque_700Bold,
  BricolageGrotesque_800ExtraBold,
} from '@expo-google-fonts/bricolage-grotesque';
import { IBMPlexMono_500Medium, IBMPlexMono_600SemiBold } from '@expo-google-fonts/ibm-plex-mono';
import {
  InstrumentSans_400Regular,
  InstrumentSans_500Medium,
  InstrumentSans_600SemiBold,
  InstrumentSans_700Bold,
} from '@expo-google-fonts/instrument-sans';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { FournisseurSession, useSession } from '@/lib/session';
import { couleurs } from '@/theme/tokens';

// L'écran de démarrage reste affiché tant que les polices ne sont pas prêtes.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [policesChargees, erreur] = useFonts({
    BricolageGrotesque_600SemiBold,
    BricolageGrotesque_700Bold,
    BricolageGrotesque_800ExtraBold,
    InstrumentSans_400Regular,
    InstrumentSans_500Medium,
    InstrumentSans_600SemiBold,
    InstrumentSans_700Bold,
    IBMPlexMono_500Medium,
    IBMPlexMono_600SemiBold,
  });

  if (!policesChargees && !erreur) {
    return null;
  }

  return (
    <FournisseurSession>
      <StatusBar style="dark" />
      <Navigation />
    </FournisseurSession>
  );
}

/**
 * Aiguillage selon l'état du bailleur :
 * - non connecté : bienvenue, inscription, connexion ;
 * - connecté sans les consentements à jour : acceptation des textes ;
 * - connecté et à jour : l'application.
 * Les textes juridiques restent consultables dans tous les cas.
 */
function Navigation() {
  const { session, chargement, consentementsAJour } = useSession();
  const pret = !chargement && (!session || consentementsAJour !== null);

  useEffect(() => {
    if (pret) SplashScreen.hideAsync();
  }, [pret]);

  if (!pret) return null;

  const connecte = !!session;
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: couleurs.fond } }}>
      <Stack.Protected guard={connecte && consentementsAJour === true}>
        <Stack.Screen name="(onglets)" />
        <Stack.Screen name="compte" />
        <Stack.Screen name="formules" />
        <Stack.Screen name="bien/nouveau" />
        <Stack.Screen name="bien/[id]/index" />
        <Stack.Screen name="bien/[id]/[rubrique]" />
        <Stack.Screen name="document/nouveau" />
        <Stack.Screen name="document/[id]" />
        <Stack.Screen name="entite/[id]" />
        <Stack.Screen name="checkup/[id]" />
        <Stack.Screen name="checkup/resultat/[id]" />
        <Stack.Screen name="checkup/point" />
        <Stack.Screen name="parcours/scan-bail" options={{ gestureEnabled: false }} />
        <Stack.Screen name="parcours/check-up" options={{ gestureEnabled: false }} />
      </Stack.Protected>
      <Stack.Protected guard={connecte && consentementsAJour === false}>
        <Stack.Screen name="consentement" />
      </Stack.Protected>
      <Stack.Protected guard={!connecte}>
        <Stack.Screen name="bienvenue" />
        <Stack.Screen name="inscription" />
        <Stack.Screen name="connexion" />
      </Stack.Protected>
      <Stack.Screen name="juridique/[document]" />
    </Stack>
  );
}
