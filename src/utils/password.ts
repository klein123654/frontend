/** Password rule shared with the API: at least 8 characters, with a letter and a number. */
export const PASSWORD_HINT = 'At least 8 characters, with a letter and a number.'

/** Returns what is wrong with a new password, or an empty string when it is acceptable. */
export function passwordProblem(password: string): string {
  if (password.length < 8) return 'Password must contain at least 8 characters.'
  if (!/[A-Za-z]/.test(password)) return 'Password must include a letter.'
  if (!/[0-9]/.test(password)) return 'Password must include a number.'
  return ''
}
