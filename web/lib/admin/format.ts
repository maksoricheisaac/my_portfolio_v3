export function formatDate(iso: string, short = false): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat(
    "fr-FR",
    short
      ? { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }
      : { dateStyle: "long", timeStyle: "short" },
  ).format(d);
}

const ACTIONS: Record<string, string> = {
  "auth.login.success": "Connexion réussie",
  "auth.login.failed": "Échec de connexion",
  "auth.login.locked": "Tentative sur compte verrouillé",
  "auth.account.locked": "Compte verrouillé (trop d'échecs)",
  "auth.otp.failed": "Code de vérification invalide",
  "auth.logout": "Déconnexion",
  "auth.refresh.reuse": "Réutilisation d'un jeton de session (sessions révoquées)",
  "auth.password.forgot": "Demande de réinitialisation du mot de passe",
  "auth.password.reset": "Mot de passe réinitialisé",
  "auth.password.changed": "Mot de passe modifié",
  "auth.password.change.failed": "Échec de changement de mot de passe",
  "auth.2fa.enabled": "Double authentification activée",
  "auth.2fa.disabled": "Double authentification désactivée",
  "auth.session.revoked": "Session révoquée",
  "project.create": "Projet créé",
  "project.update": "Projet modifié",
  "project.duplicate": "Projet dupliqué",
  "project.delete": "Projet supprimé",
  "project.reorder": "Projets réordonnés",
  "message.update": "Message mis à jour",
  "message.delete": "Message supprimé",
  "message.reply": "Réponse envoyée",
  "media.upload": "Image importée",
  "media.delete": "Image supprimée",
  "settings.update": "Paramètres SEO / profil modifiés",
};

export function actionLabel(action: string): string {
  return ACTIONS[action] ?? action;
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} o`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} Ko`;
  return `${(n / 1024 / 1024).toFixed(1)} Mo`;
}
