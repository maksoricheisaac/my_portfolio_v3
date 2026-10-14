/** Returns an error message when the password is too weak, otherwise null. */
export function passwordProblem(
  password: string,
  email?: string,
): string | null {
  if (password.length < 12)
    return 'Password must be at least 12 characters long.';
  if (password.length > 128)
    return 'Password must be at most 128 characters long.';
  const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((re) =>
    re.test(password),
  ).length;
  if (classes < 3) {
    return 'Use at least three of: lowercase, uppercase, digits, symbols.';
  }
  const local = email?.split('@')[0]?.toLowerCase();
  if (local && local.length >= 4 && password.toLowerCase().includes(local)) {
    return 'Password must not contain your email address.';
  }
  if (/^(.)\1+$/.test(password)) return 'Password is too repetitive.';
  return null;
}
