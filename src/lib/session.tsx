import type { Session } from '@supabase/supabase-js';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

import { textesJuridiques } from '@/contenus/textes-juridiques';
import { supabase } from '@/lib/supabase';

/** Textes que le bailleur doit avoir acceptés, dans leur version en vigueur. */
export const CONSENTEMENTS_REQUIS = [
  { document: 'cgu', version: textesJuridiques.cgu.version },
  { document: 'confidentialite', version: textesJuridiques.confidentialite.version },
] as const;

type EtatSession = {
  session: Session | null;
  /** Vrai tant qu'on ne sait pas encore si le bailleur est connecté. */
  chargement: boolean;
  /** null tant que la vérification n'est pas faite. */
  consentementsAJour: boolean | null;
  verifierConsentements: () => Promise<void>;
  /** Vrai juste après l'inscription : l'accueil enchaîne sur le premier bien. */
  parcoursEnAttente: boolean;
  setParcoursEnAttente: (v: boolean) => void;
};

/** Le bailleur a-t-il accepté la version en vigueur de chaque texte ? */
async function consentementsSontAJour(): Promise<boolean> {
  const { data, error } = await supabase.from('consentements').select('document, version');
  // En cas de souci réseau, on ne bloque pas un bailleur déjà engagé.
  if (error) return true;
  return CONSENTEMENTS_REQUIS.every((r) =>
    data.some((c) => c.document === r.document && c.version === r.version),
  );
}

const ContexteSession = createContext<EtatSession | null>(null);

export function FournisseurSession({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [chargement, setChargement] = useState(true);
  const [parcoursEnAttente, setParcoursEnAttente] = useState(false);
  // Résultat de la vérification, rattaché au compte vérifié.
  const [verification, setVerification] = useState<{ idUtilisateur: string; aJour: boolean } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChargement(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_evenement, nouvelle) => {
      setSession(nouvelle);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const idUtilisateur = session?.user.id;

  const verifierConsentements = useCallback(async () => {
    if (!idUtilisateur) return;
    setVerification({ idUtilisateur, aJour: await consentementsSontAJour() });
  }, [idUtilisateur]);

  useEffect(() => {
    if (!idUtilisateur) return;
    let actif = true;
    consentementsSontAJour().then((aJour) => {
      if (actif) setVerification({ idUtilisateur, aJour });
    });
    return () => {
      actif = false;
    };
  }, [idUtilisateur]);

  const consentementsAJour =
    idUtilisateur && verification?.idUtilisateur === idUtilisateur ? verification.aJour : null;

  return (
    <ContexteSession.Provider value={{
        session,
        chargement,
        consentementsAJour,
        verifierConsentements,
        parcoursEnAttente,
        setParcoursEnAttente,
      }}>
      {children}
    </ContexteSession.Provider>
  );
}

export function useSession() {
  const etat = useContext(ContexteSession);
  if (!etat) throw new Error('useSession doit être utilisé dans FournisseurSession');
  return etat;
}
