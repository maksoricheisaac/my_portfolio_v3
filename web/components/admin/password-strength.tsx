/** Mirrors the API password policy so the user gets feedback before submitting. */
export function passwordIssues(password: string): string[] {
  const issues: string[] = [];
  if (password.length < 12) issues.push("12 caractères minimum");
  const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((re) => re.test(password)).length;
  if (classes < 3) issues.push("3 types parmi : minuscules, majuscules, chiffres, symboles");
  return issues;
}

export function PasswordHint({ password }: { password: string }) {
  if (!password) return <p className="text-xs text-subtle">12 caractères minimum, 3 types de caractères.</p>;
  const issues = passwordIssues(password);
  return issues.length === 0 ? (
    <p className="text-xs text-emerald-300">Mot de passe conforme.</p>
  ) : (
    <ul className="text-xs text-amber-300">
      {issues.map((i) => (
        <li key={i}>• {i}</li>
      ))}
    </ul>
  );
}
