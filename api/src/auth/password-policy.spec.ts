import { passwordProblem } from './password-policy';

describe('passwordProblem', () => {
  it('rejects short passwords', () => {
    expect(passwordProblem('Ab1!')).not.toBeNull();
  });
  it('requires three character classes', () => {
    expect(passwordProblem('alllowercaseletters')).not.toBeNull();
    expect(passwordProblem('Lowercase and 1234 mix')).toBeNull();
  });
  it('rejects passwords containing the email local part', () => {
    expect(
      passwordProblem('Richemakso-2026!x', 'richemakso@example.com'),
    ).not.toBeNull();
  });
  it('accepts a strong password', () => {
    expect(passwordProblem('Correct-Horse-9-Battery', 'a@b.co')).toBeNull();
  });
});
