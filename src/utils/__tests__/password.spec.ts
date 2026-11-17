import { describe, expect, it } from 'vitest'
import { passwordProblem } from '../password'

describe('passwordProblem', () => {
  it('matches the API rule: 8+ characters with a letter and a number', () => {
    expect(passwordProblem('short1')).toMatch(/8 characters/)
    expect(passwordProblem('onlyletters')).toMatch(/number/)
    expect(passwordProblem('12345678')).toMatch(/letter/)
    expect(passwordProblem('Password1')).toBe('')
  })
})
