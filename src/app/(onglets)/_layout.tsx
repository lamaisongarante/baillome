import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router/js-tabs';
import type { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';

import { arrondis, couleurs, polices } from '@/theme/tokens';

type NomIcone = ComponentProps<typeof Ionicons>['name'];

function IconeOnglet({ nom, actif }: { nom: NomIcone; actif: boolean }) {
  return (
    <View style={[styles.pastille, actif && styles.pastilleActive]}>
      <Ionicons name={nom} size={22} color={couleurs.pin} />
    </View>
  );
}

/** Onglet central « Loyers » : mis en avant, c'est le cœur de l'usage quotidien. */
function IconeLoyers({ actif }: { actif: boolean }) {
  return (
    <View style={[styles.boutonCentral, actif && styles.boutonCentralActif]}>
      <Ionicons name="wallet" size={26} color={actif ? couleurs.pin : couleurs.citron} />
    </View>
  );
}

export default function OngletsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: couleurs.fond },
        tabBarActiveTintColor: couleurs.pin,
        tabBarInactiveTintColor: couleurs.texteDiscret,
        tabBarLabelStyle: styles.libelle,
        tabBarStyle: styles.barre,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ focused }) => (
            <IconeOnglet nom={focused ? 'home' : 'home-outline'} actif={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="biens"
        options={{
          title: 'Biens',
          tabBarIcon: ({ focused }) => (
            <IconeOnglet nom={focused ? 'business' : 'business-outline'} actif={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="loyers"
        options={{
          title: 'Loyers',
          tabBarIcon: ({ focused }) => <IconeLoyers actif={focused} />,
        }}
      />
      <Tabs.Screen
        name="agenda"
        options={{
          title: 'Agenda',
          tabBarIcon: ({ focused }) => (
            <IconeOnglet nom={focused ? 'calendar' : 'calendar-outline'} actif={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="docs"
        options={{
          title: 'Docs',
          tabBarIcon: ({ focused }) => (
            <IconeOnglet nom={focused ? 'document-text' : 'document-text-outline'} actif={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  barre: {
    backgroundColor: couleurs.carte,
    borderTopColor: couleurs.trait,
    height: 88,
    paddingTop: 8,
  },
  libelle: {
    fontFamily: polices.interfaceMoyen,
    fontSize: 11,
    marginTop: 4,
  },
  pastille: {
    width: 48,
    height: 30,
    borderRadius: arrondis.pilule,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pastilleActive: {
    backgroundColor: couleurs.citron,
  },
  boutonCentral: {
    width: 54,
    height: 54,
    borderRadius: arrondis.pilule,
    backgroundColor: couleurs.pin,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -22,
  },
  boutonCentralActif: {
    backgroundColor: couleurs.citron,
    borderWidth: 2,
    borderColor: couleurs.pin,
  },
});
