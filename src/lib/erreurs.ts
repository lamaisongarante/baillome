import type { AuthError } from '@supabase/supabase-js';

/** Traduit les erreurs de connexion et d'inscription en messages clairs. */
export function messageErreurAuth(erreur: AuthError | Error): string {
  const code = 'code' in erreur ? erreur.code : undefined;
  switch (code) {
    case 'invalid_credentials':
      return 'Email ou mot de passe incorrect.';
    case 'user_already_exists':
    case 'email_exists':
      return 'Un compte existe déjà avec cet email. Vous pouvez vous connecter.';
    case 'weak_password':
      return 'Ce mot de passe est trop simple. Choisissez-en un plus long ou plus varié.';
    case 'email_address_invalid':
    case 'validation_failed':
      return 'Cette adresse email ne semble pas valide.';
    case 'email_not_confirmed':
      return 'Votre adresse email n’est pas encore confirmée. Ouvrez le lien reçu par email.';
    case 'over_request_rate_limit':
    case 'over_email_send_rate_limit':
      return 'Trop de tentatives. Patientez quelques minutes avant de réessayer.';
    default:
      if (/network|fetch/i.test(erreur.message)) {
        return 'Pas de connexion internet. Vérifiez votre réseau et réessayez.';
      }
      return 'Une erreur est survenue. Réessayez dans un instant.';
  }
}

export const LONGUEUR_MIN_MOT_DE_PASSE = 8;
