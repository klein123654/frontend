import AxeBuilder from '@axe-core/playwright'
import { expect, type Page } from '@playwright/test'

export async function expectNoAxeViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    // Vue DevTools injects this development-only control; it is not app markup.
    .exclude('.panel-entry-btn')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()
  expect(results.violations, JSON.stringify(results.violations.map(({ id, impact, description, nodes }) => ({ id, impact, description, targets: nodes.map((node) => node.target) })), null, 2)).toEqual([])
}
