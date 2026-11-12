import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = resolve(__dirname, '../../..')

describe('inline hero preload script', () => {
  it('is allowed by the hash in the Content-Security-Policy', () => {
    const html = readFileSync(resolve(root, 'index.html'), 'utf8')
    const headers = readFileSync(resolve(root, 'public/_headers'), 'utf8')
    const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((match) => match[1] ?? '')

    expect(scripts).toHaveLength(1)
    const hash = createHash('sha256').update(scripts[0] ?? '').digest('base64')
    expect(headers).toContain(`'sha256-${hash}'`)
  })
})
